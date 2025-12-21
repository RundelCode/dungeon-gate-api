import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CombatService } from '../combats/combats.service';
import { GameGateway } from '../realtime/game.gateway';
import * as crypto from 'crypto';
import { CastSpellDto } from './dto/cast-spell.dto';

@Injectable()
export class SpellCastingService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
        private readonly combatsService: CombatService,
        private readonly realtime: GameGateway,
    ) { }

    async castSpell(
        gameId: string,
        userId: string,
        dto: CastSpellDto,
    ) {
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
            .select('id')
            .eq('id', dto.caster_actor_id)
            .eq('game_id', gameId)
            .single();

        if (!caster) {
            throw new NotFoundException('Caster not found');
        }

        const { data: target } = await this.supabase
            .from('actors_in_game')
            .select('id, current_hp')
            .eq('id', dto.target_actor_id)
            .eq('game_id', gameId)
            .single();

        if (!target) {
            throw new NotFoundException('Target not found');
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
            .update({
                slots_used: slot.slots_used + 1,
            })
            .eq('id', slot.id);

        const damage =
            dto.forced_damage ??
            (spell.damage_formula
                ? this.rollDamage(spell.damage_formula)
                : 0);

        const newHp = Math.max(0, target.current_hp - damage);

        await this.supabase
            .from('actors_in_game')
            .update({
                current_hp: newHp,
                updated_at: new Date(),
            })
            .eq('id', target.id);

        this.realtime.emitToGame(gameId, 'spell.cast', {
            spell_id: spell.id,
            caster_actor_id: caster.id,
            target_actor_id: target.id,
            damage,
            current_hp: newHp,
        });

        await this.supabase.from('game_logs').insert({
            id: crypto.randomUUID(),
            game_id: gameId,
            actor_in_game_id: caster.id,
            action_type: 'spell.cast',
            payload: {
                spell_id: spell.id,
                target_actor_id: target.id,
                damage,
            },
        });

        return {
            success: true,
            damage,
            target_hp: newHp,
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
}
