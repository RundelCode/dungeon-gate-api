import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CastSpellDto } from './dto/cast-spell.dto';
import { CombatService } from '../combats/combats.service';
import { GameGateway } from '../realtime/game.gateway';
import { SavingThrowsService } from '../saving-throws/saving-throws.service';
import {
    rollD20,
    rollDamage,
    resolveRollMode,
} from '../../utils/dice.util';
import * as crypto from 'crypto';

type SpellTargetResult =
    | {
        target_actor_id: string;
        save: {
            roll: number;
            total: number;
            dc: number;
            success: boolean;
        };
        damage: number;
        current_hp: number;
    }
    | {
        target_actor_id: string;
        roll: number;
        hit: boolean;
        crit: boolean;
        damage: number;
        current_hp: number;
    };

@Injectable()
export class SpellCastingService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
        private readonly combatsService: CombatService,
        private readonly realtime: GameGateway,
        private readonly savingThrows: SavingThrowsService,
    ) { }

    async cast(
        gameId: string,
        userId: string,
        dto: CastSpellDto,
    ) {
        await this.combatsService.assertCanAct(gameId, userId);

        const rollMode = resolveRollMode(
            dto.advantage,
            dto.disadvantage,
        );

        const { data: spell } = await this.supabase
            .from('spells')
            .select('*')
            .eq('id', dto.spell_id)
            .single();

        if (!spell) {
            throw new NotFoundException('Spell not found');
        }

        const { data: caster } = await this.supabase
            .from('actors_in_game')
            .select('id, resources_json')
            .eq('id', dto.caster_actor_id)
            .eq('game_id', gameId)
            .single();

        if (!caster) {
            throw new NotFoundException('Caster not found');
        }

        const { data: slot } = await this.supabase
            .from('character_spell_slots')
            .select('*')
            .eq('character_id', caster.id)
            .eq('spell_level', dto.spell_level)
            .single();

        if (!slot || slot.slots_used >= slot.slots_max) {
            throw new BadRequestException('No spell slots available');
        }

        await this.supabase
            .from('character_spell_slots')
            .update({ slots_used: slot.slots_used + 1 })
            .eq('id', slot.id);

        const results: SpellTargetResult[] = [];

        for (const targetId of dto.target_actor_ids) {
            const result =
                spell.attack_type === 'save'
                    ? await this.resolveSaveTarget(
                        gameId,
                        spell,
                        targetId,
                        rollMode,
                    )
                    : await this.resolveAttackTarget(
                        gameId,
                        spell,
                        targetId,
                        rollMode,
                    );

            results.push(result);
        }

        if (spell.is_concentration) {
            const resources = caster.resources_json ?? {};
            resources.concentration = {
                spell_id: spell.id,
                started_at: new Date().toISOString(),
            };

            await this.supabase
                .from('actors_in_game')
                .update({ resources_json: resources })
                .eq('id', caster.id);
        }

        this.realtime.emitToGame(gameId, 'spell.cast', {
            caster_actor_id: caster.id,
            spell_id: spell.id,
            roll_mode: rollMode,
            results,
        });

        await this.supabase.from('game_logs').insert({
            id: crypto.randomUUID(),
            game_id: gameId,
            actor_in_game_id: caster.id,
            action_type: 'spell.cast',
            payload: {
                spell: spell.name,
                roll_mode: rollMode,
                results,
            },
        });

        return { results };
    }

    private async resolveSaveTarget(
        gameId: string,
        spell: any,
        targetId: string,
        rollMode: 'normal' | 'advantage' | 'disadvantage',
    ) {
        const { data: target } = await this.supabase
            .from('actors_in_game')
            .select('id, current_hp')
            .eq('id', targetId)
            .eq('game_id', gameId)
            .single();

        if (!target) {
            throw new NotFoundException('Target not found');
        }

        const dc = 10 + spell.level;

        const save = this.savingThrows.rollSavingThrow({
            ability: spell.save_ability,
            dc,
            roll_mode: rollMode,
        });

        let damage = 0;
        if (spell.damage_formula) {
            damage = rollDamage(spell.damage_formula);
            if (save.success) damage = Math.floor(damage / 2);
        }

        const newHp = Math.max(0, target.current_hp - damage);

        await this.supabase
            .from('actors_in_game')
            .update({ current_hp: newHp })
            .eq('id', target.id);

        this.realtime.emitToGame(gameId, 'actor.hp.updated', {
            actor_id: target.id,
            delta: -damage,
            current_hp: newHp,
        });

        await this.applySpellConditions(
            gameId,
            target.id,
            spell,
            save.success,
        );

        return {
            target_actor_id: target.id,
            save,
            damage,
            current_hp: newHp,
        };
    }

    private async resolveAttackTarget(
        gameId: string,
        spell: any,
        targetId: string,
        rollMode: 'normal' | 'advantage' | 'disadvantage',
    ) {
        const { data: target } = await this.supabase
            .from('actors_in_game')
            .select('id, current_hp, armor_class')
            .eq('id', targetId)
            .eq('game_id', gameId)
            .single();

        if (!target) {
            throw new NotFoundException('Target not found');
        }

        const roll = rollD20(rollMode);
        const hit = roll >= target.armor_class;
        const crit = roll === 20;

        let damage = 0;
        if (hit && spell.damage_formula) {
            damage = rollDamage(spell.damage_formula);
            if (crit) damage *= 2;
        }

        const newHp = Math.max(0, target.current_hp - damage);

        await this.supabase
            .from('actors_in_game')
            .update({ current_hp: newHp })
            .eq('id', target.id);

        this.realtime.emitToGame(gameId, 'actor.hp.updated', {
            actor_id: target.id,
            delta: -damage,
            current_hp: newHp,
        });

        await this.applySpellConditions(
            gameId,
            target.id,
            spell,
            hit ? null : false,
        );

        return {
            target_actor_id: target.id,
            roll,
            roll_mode: rollMode,
            hit,
            crit,
            damage,
            current_hp: newHp,
        };
    }

    private async applySpellConditions(
        gameId: string,
        targetActorId: string,
        spell: any,
        saveSucceeded: boolean | null,
    ) {
        if (!spell.conditions_json) return;

        const { data: combat } = await this.supabase
            .from('combats')
            .select('round')
            .eq('game_id', gameId)
            .eq('is_active', true)
            .single();

        const currentRound = combat?.round ?? 1;

        for (const cond of spell.conditions_json) {
            const shouldApply =
                cond.on === 'always' ||
                (cond.on === 'hit' && saveSucceeded === null) ||
                (cond.on === 'fail_save' && saveSucceeded === false);

            if (!shouldApply) continue;

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
