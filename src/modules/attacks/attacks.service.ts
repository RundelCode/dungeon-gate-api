import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { PerformAttackDto } from './dto/perform-attack.dto';
import { CombatService } from '../combats/combats.service';
import { GameGateway } from '../realtime/game.gateway';
import * as crypto from 'crypto';

@Injectable()
export class AttacksService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
        private readonly combatsService: CombatService,
        private readonly realtime: GameGateway,
    ) { }

    async performAttack(
        gameId: string,
        userId: string,
        dto: PerformAttackDto,
    ) {
        await this.combatsService.assertCanAct(gameId, userId);

        const { data: attacker } = await this.supabase
            .from('actors_in_game')
            .select('id, resources_json')
            .eq('id', dto.attacker_actor_id)
            .eq('game_id', gameId)
            .single();

        if (!attacker) {
            throw new NotFoundException('Attacker not found');
        }

        const { data: target } = await this.supabase
            .from('actors_in_game')
            .select('id, current_hp, armor_class')
            .eq('id', dto.target_actor_id)
            .eq('game_id', gameId)
            .single();

        if (!target) {
            throw new NotFoundException('Target not found');
        }

        const roll = this.attackRoll(dto.advantage, dto.disadvantage);
        const hit = roll.total >= target.armor_class;
        const crit = roll.natural === 20;

        let damage = 0;

        if (hit) {
            damage = this.rollDamage('1d8');
            if (crit) {
                damage *= 2;
            }
        }

        const newHp = Math.max(0, target.current_hp - damage);

        await this.supabase
            .from('actors_in_game')
            .update({
                current_hp: newHp,
                updated_at: new Date(),
            })
            .eq('id', target.id);

        this.realtime.emitToGame(gameId, 'attack.resolved', {
            game_id: gameId,
            attacker_actor_id: attacker.id,
            target_actor_id: target.id,
            roll: roll.total,
            hit,
            crit,
            damage,
            current_hp: newHp,
        });

        await this.supabase.from('game_logs').insert({
            id: crypto.randomUUID(),
            game_id: gameId,
            actor_in_game_id: attacker.id,
            action_type: 'attack.resolved',
            payload: {
                target_actor_id: target.id,
                roll: roll.total,
                hit,
                crit,
                damage,
            },
        });

        return {
            hit,
            crit,
            roll: roll.total,
            damage,
            target_hp: newHp,
        };
    }

    private attackRoll(
        advantage?: boolean,
        disadvantage?: boolean,
    ) {
        const r1 = this.d20();
        const r2 = this.d20();

        let natural = r1;

        if (advantage && !disadvantage) {
            natural = Math.max(r1, r2);
        }

        if (disadvantage && !advantage) {
            natural = Math.min(r1, r2);
        }

        return {
            natural,
            total: natural,
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
