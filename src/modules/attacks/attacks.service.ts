import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { RealtimeService } from '../realtime/realtime.service';
import { SavingThrowsService } from '../saving-throws/saving-throws.service';
import * as crypto from 'crypto';

@Injectable()
export class AttacksService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
        private readonly realtime: RealtimeService,
        private readonly savingThrows: SavingThrowsService,
    ) { }

    async executeAttack(
        gameId: string,
        userId: string,
        attackId: string,
        attackerActorId: string,
        targetActorId: string,
        advantage = false,
        disadvantage = false,
    ) {
        const { data: attack } = await this.supabase
            .from('character_attacks')
            .select('*')
            .eq('id', attackId)
            .single();

        if (!attack) throw new NotFoundException('Attack not found');

        const { data: attacker } = await this.supabase
            .from('actors_in_game')
            .select('id')
            .eq('id', attackerActorId)
            .eq('game_id', gameId)
            .single();

        const { data: target } = await this.supabase
            .from('actors_in_game')
            .select('id, armor_class, current_hp, temp_hp, is_conscious')
            .eq('id', targetActorId)
            .eq('game_id', gameId)
            .single();

        if (!attacker || !target) {
            throw new BadRequestException('Invalid actors');
        }

        const rollData = this.rollD20(advantage, disadvantage);
        const hit = rollData.total >= target.armor_class;
        const crit = rollData.natural === 20;

        let damage = 0;
        if (hit && attack.damage_formula) {
            damage = this.rollDamage(attack.damage_formula);
            if (crit) damage *= 2;
        }

        let remaining = damage;
        let tempHp = target.temp_hp ?? 0;
        let hp = target.current_hp;

        if (remaining > 0 && tempHp > 0) {
            const absorbed = Math.min(tempHp, remaining);
            tempHp -= absorbed;
            remaining -= absorbed;
        }

        hp = Math.max(0, hp - remaining);

        const { data: updated } = await this.supabase
            .from('actors_in_game')
            .update({
                current_hp: hp,
                temp_hp: tempHp,
                is_conscious: hp > 0,
                updated_at: new Date(),
            })
            .eq('id', target.id)
            .select()
            .single();

        const appliedConditions = await this.applyAttackConditions(
            gameId,
            attack,
            target.id,
            hit,
        );

        const payload = {
            attacker_actor_id: attacker.id,
            target_actor_id: target.id,
            attack_id: attack.id,
            roll: {
                natural: rollData.natural,
                total: rollData.total,
                mode: rollData.mode,
            },
            hit,
            crit,
            damage,
            actor_state: {
                current_hp: updated.current_hp,
                temp_hp: updated.temp_hp,
                is_conscious: updated.is_conscious,
            },
            conditions_applied: appliedConditions,
        };

        this.realtime.attackResolved(gameId, payload);

        await this.supabase.from('game_logs').insert({
            id: crypto.randomUUID(),
            game_id: gameId,
            actor_in_game_id: attacker.id,
            action_type: 'attack.resolved',
            payload,
        });

        return payload;
    }

    private async applyAttackConditions(
        gameId: string,
        attack: any,
        targetActorId: string,
        hit: boolean,
    ) {
        if (!attack.conditions_json) return [];

        const { data: combat } = await this.supabase
            .from('combats')
            .select('round')
            .eq('game_id', gameId)
            .eq('is_active', true)
            .single();

        const round = combat?.round ?? 1;
        const applied: any[] = [];

        for (const cond of attack.conditions_json) {
            if (cond.on === 'hit' && !hit) continue;

            if (cond.requires_save) {
                const save = this.savingThrows.rollSavingThrow({
                    dc: cond.requires_save.dc,
                    modifier: cond.requires_save.modifier ?? 0,
                });
                if (save.success) continue;
            }

            const expires_on_round =
                cond.duration_rounds != null
                    ? round + cond.duration_rounds
                    : null;

            await this.supabase.from('actor_conditions').insert({
                id: crypto.randomUUID(),
                actor_in_game_id: targetActorId,
                condition_id: cond.condition_id,
                applied_on_round: round,
                expires_on_round,
            });

            const { data: condition } = await this.supabase
                .from('conditions')
                .select('name')
                .eq('id', cond.condition_id)
                .single();

            applied.push({
                condition_id: cond.condition_id,
                name: condition?.name,
                expires_on_round,
            });
        }

        return applied;
    }

    private rollDamage(formula: string): number {
        const m = formula.match(/(\d+)d(\d+)(\s*\+\s*\d+)?/);
        if (!m) return 0;

        const rolls = Number(m[1]);
        const die = Number(m[2]);
        const bonus = m[3] ? Number(m[3].replace('+', '')) : 0;

        let total = bonus;
        for (let i = 0; i < rolls; i++) {
            total += Math.floor(Math.random() * die) + 1;
        }
        return total;
    }

    private rollD20(adv = false, dis = false) {
        const r1 = this.d20();
        const r2 = this.d20();

        if (adv && !dis) {
            return { natural: Math.max(r1, r2), total: Math.max(r1, r2), mode: 'advantage' };
        }
        if (dis && !adv) {
            return { natural: Math.min(r1, r2), total: Math.min(r1, r2), mode: 'disadvantage' };
        }
        return { natural: r1, total: r1, mode: 'normal' };
    }

    private d20(): number {
        return Math.floor(Math.random() * 20) + 1;
    }
}
