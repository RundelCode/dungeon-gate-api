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
import * as crypto from 'crypto';

@Injectable()
export class SpellCastingService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
        private readonly combatsService: CombatService,
        private readonly realtime: GameGateway,
    ) { }

    async cast(gameId: string, userId: string, dto: CastSpellDto) {
        await this.combatsService.assertCanAct(gameId, userId);

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

        let result: any = { spell_id: spell.id };

        if (spell.attack_type === 'attack') {
            result = await this.resolveAttackSpell(gameId, spell, dto);
        }

        if (spell.attack_type === 'save') {
            result = await this.resolveSaveSpell(gameId, spell, dto);
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
            game_id: gameId,
            caster_actor_id: caster.id,
            ...result,
        });

        await this.supabase.from('game_logs').insert({
            id: crypto.randomUUID(),
            game_id: gameId,
            actor_in_game_id: caster.id,
            action_type: 'spell.cast',
            payload: result,
        });

        return result;
    }

    private async resolveAttackSpell(gameId: string, spell: any, dto: CastSpellDto) {
        const { data: target } = await this.supabase
            .from('actors_in_game')
            .select('id, current_hp, armor_class')
            .eq('id', dto.target_actor_id)
            .eq('game_id', gameId)
            .single();

        if (!target) {
            throw new NotFoundException('Target not found');
        }

        const roll = this.d20();
        const hit = roll >= target.armor_class;
        const crit = roll === 20;

        let damage = 0;
        if (hit && spell.damage_formula) {
            damage = this.rollDamage(spell.damage_formula);
            if (crit) damage *= 2;
        }

        const newHp = Math.max(0, target.current_hp - damage);

        await this.supabase
            .from('actors_in_game')
            .update({ current_hp: newHp })
            .eq('id', target.id);

        this.realtime.emitToGame(gameId, 'actor.hp.updated', {
            actor_id: target.id,
            current_hp: newHp,
            delta: -damage,
        });

        return {
            target_actor_id: target.id,
            roll,
            hit,
            crit,
            damage,
            current_hp: newHp,
        };
    }

    private async resolveSaveSpell(gameId: string, spell: any, dto: CastSpellDto) {
        const { data: target } = await this.supabase
            .from('actors_in_game')
            .select('id, current_hp')
            .eq('id', dto.target_actor_id)
            .eq('game_id', gameId)
            .single();

        if (!target) {
            throw new NotFoundException('Target not found');
        }

        const saveRoll = this.d20();
        const dc = 10 + spell.level;
        const success = saveRoll >= dc;

        let damage = 0;
        if (spell.damage_formula) {
            damage = this.rollDamage(spell.damage_formula);
            if (success) damage = Math.floor(damage / 2);
        }

        const newHp = Math.max(0, target.current_hp - damage);

        await this.supabase
            .from('actors_in_game')
            .update({ current_hp: newHp })
            .eq('id', target.id);

        this.realtime.emitToGame(gameId, 'actor.hp.updated', {
            actor_id: target.id,
            current_hp: newHp,
            delta: -damage,
        });

        return {
            target_actor_id: target.id,
            save_roll: saveRoll,
            success,
            damage,
            current_hp: newHp,
        };
    }

    private rollDamage(formula: string): number {
        const match = formula.match(/(\d+)d(\d+)/);
        if (!match) return 0;

        const rolls = Number(match[1]);
        const die = Number(match[2]);

        let total = 0;
        for (let i = 0; i < rolls; i++) {
            total += Math.floor(Math.random() * die) + 1;
        }

        return total;
    }

    private d20(): number {
        return Math.floor(Math.random() * 20) + 1;
    }
}
