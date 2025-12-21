import {
    Injectable,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ApplyConditionDto } from './dto/apply-condition.dto';
import { RemoveConditionDto } from './dto/remove-condition.dto';
import { CombatService } from '../combats/combats.service';
import { GameGateway } from '../realtime/game.gateway';
import * as crypto from 'crypto';

@Injectable()
export class ActorConditionsService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
        private readonly combatsService: CombatService,
        private readonly realtime: GameGateway,
    ) { }

    async apply(
        gameId: string,
        userId: string,
        dto: ApplyConditionDto,
    ) {
        await this.combatsService.assertCanAct(gameId, userId);

        const { data: actor } = await this.supabase
            .from('actors_in_game')
            .select('id')
            .eq('id', dto.actor_in_game_id)
            .eq('game_id', gameId)
            .single();

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        const { data: condition } = await this.supabase
            .from('conditions')
            .select('id, name')
            .eq('id', dto.condition_id)
            .single();

        if (!condition) {
            throw new NotFoundException('Condition not found');
        }

        const id = crypto.randomUUID();

        await this.supabase
            .from('actor_conditions')
            .insert({
                id,
                actor_in_game_id: actor.id,
                condition_id: condition.id,
                expires_at: dto.duration_rounds
                    ? new Date(
                        Date.now() +
                        dto.duration_rounds * 6000,
                    )
                    : null,
            });

        this.realtime.emitToGame(gameId, 'condition.applied', {
            actor_id: actor.id,
            condition_id: condition.id,
            duration_rounds: dto.duration_rounds ?? null,
        });

        await this.supabase.from('game_logs').insert({
            id: crypto.randomUUID(),
            game_id: gameId,
            actor_in_game_id: actor.id,
            action_type: 'condition.applied',
            payload: {
                condition: condition.name,
                duration_rounds: dto.duration_rounds ?? null,
            },
        });

        return { success: true };
    }

    async remove(
        gameId: string,
        userId: string,
        dto: RemoveConditionDto,
    ) {
        await this.combatsService.assertCanAct(gameId, userId);

        const { data: actorCondition } = await this.supabase
            .from('actor_conditions')
            .select(`
        id,
        actor_in_game_id,
        conditions ( name )
      `)
            .eq('id', dto.actor_condition_id)
            .single();

        if (!actorCondition) {
            throw new NotFoundException('Condition not found');
        }

        await this.supabase
            .from('actor_conditions')
            .delete()
            .eq('id', actorCondition.id);

        this.realtime.emitToGame(gameId, 'condition.removed', {
            actor_id: actorCondition.actor_in_game_id,
            condition_id: actorCondition.id,
        });

        await this.supabase.from('game_logs').insert({
            id: crypto.randomUUID(),
            game_id: gameId,
            actor_in_game_id: actorCondition.actor_in_game_id,
            action_type: 'condition.removed',
            payload: {
                condition: actorCondition.conditions[0]?.name,
            },
        });

        return { success: true };
    }

    async listForActor(
        gameId: string,
        actorId: string,
    ) {
        const { data, error } = await this.supabase
            .from('actor_conditions')
            .select(`
        id,
        applied_at,
        expires_at,
        conditions (
          id,
          name,
          description
        )
      `)
            .eq('actor_in_game_id', actorId);

        if (error) throw error;
        return data;
    }
}
