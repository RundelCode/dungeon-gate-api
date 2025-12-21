import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { GameGateway } from '../realtime/game.gateway';
import { SavingThrowsService } from '../saving-throws/saving-throws.service';
import {
    rollD20,
    rollDamage,
    resolveRollMode,
} from '../../utils/dice.util';
import * as crypto from 'crypto';

@Injectable()
export class AttacksService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
        private readonly realtime: GameGateway,
        private readonly savingThrows: SavingThrowsService,
    ) { }

    async executeAttack(
        gameId: string,
        userId: string,
        attackId: string,
        attackerActorId: string,
        targetActorId: string,
        advantage?: boolean,
        disadvantage?: boolean,
    ) {
        const rollMode = resolveRollMode(advantage, disadvantage);

        const { data: attack } = await this.supabase
            .from('character_attacks')
            .select('*')
            .eq('id', attackId)
            .single();

        if (!attack) {
            throw new NotFoundException('Attack not found');
        }

        const { data: attacker } = await this.supabase
            .from('actors_in_game')
            .select('id')
            .eq('id', attackerActorId)
            .eq('game_id', gameId)
            .single();

        const { data: target } = await this.supabase
            .from('actors_in_game')
            .select('id, armor_class, current_hp')
            .eq('id', targetActorId)
            .eq('game_id', gameId)
            .single();

        if (!attacker || !target) {
            throw new BadRequestException('Invalid actors');
        }

        const roll = rollD20(rollMode);
        const hit = roll >= target.armor_class;
        const crit = roll === 20;

        let damage = 0;
        if (hit && attack.damage_formula) {
            damage = rollDamage(attack.damage_formula);
            if (crit) damage *= 2;
        }

        const newHp = Math.max(0, target.current_hp - damage);

        await this.supabase
            .from('actors_in_game')
            .update({ current_hp: newHp })
            .eq('id', target.id);

        this.realtime.emitToGame(gameId, 'attack.resolved', {
            attacker_actor_id: attacker.id,
            target_actor_id: target.id,
            roll,
            roll_mode: rollMode,
            hit,
            crit,
            damage,
            current_hp: newHp,
        });

        await this.applyAttackConditions(
            gameId,
            attack,
            target.id,
            hit,
        );

        await this.supabase.from('game_logs').insert({
            id: crypto.randomUUID(),
            game_id: gameId,
            actor_in_game_id: attacker.id,
            action_type: 'attack.executed',
            payload: {
                attack: attack.name,
                roll,
                roll_mode: rollMode,
                hit,
                crit,
                damage,
                target_actor_id: target.id,
            },
        });

        return {
            roll,
            roll_mode: rollMode,
            hit,
            crit,
            damage,
            current_hp: newHp,
        };
    }

    private async applyAttackConditions(
        gameId: string,
        attack: any,
        targetActorId: string,
        hit: boolean,
    ) {
        if (!attack.conditions_json) return;

        const { data: combat } = await this.supabase
            .from('combats')
            .select('round')
            .eq('game_id', gameId)
            .eq('is_active', true)
            .single();

        const currentRound = combat?.round ?? 1;

        for (const cond of attack.conditions_json) {
            if (cond.on === 'hit' && !hit) continue;

            if (cond.requires_save) {
                const save = this.savingThrows.rollSavingThrow({
                    ability: cond.requires_save.ability,
                    dc: cond.requires_save.dc,
                });

                if (save.success) continue;
            }

            const expiresRound =
                cond.duration_rounds != null
                    ? currentRound + cond.duration_rounds
                    : null;

            await this.supabase.from('actor_conditions').insert({
                id: crypto.randomUUID(),
                actor_in_game_id: targetActorId,
                condition_id: cond.condition_id,
                applied_on_round: currentRound,
                expires_on_round: expiresRound,
            });

            const { data: condition } = await this.supabase
                .from('conditions')
                .select('name')
                .eq('id', cond.condition_id)
                .single();

            this.realtime.emitToGame(gameId, 'condition.applied', {
                actor_id: targetActorId,
                condition: condition?.name,
                expires_on_round: expiresRound,
            });

            await this.supabase.from('game_logs').insert({
                id: crypto.randomUUID(),
                game_id: gameId,
                actor_in_game_id: targetActorId,
                action_type: 'condition.applied',
                payload: {
                    condition: condition?.name,
                    expires_on_round: expiresRound,
                },
            });
        }
    }
}
