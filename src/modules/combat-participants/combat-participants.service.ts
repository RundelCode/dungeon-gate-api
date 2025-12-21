import {
    Injectable,
    Inject,
    ForbiddenException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { UpdateInitiativeDto } from './dto/update-initiative.dto';
import { GameGateway } from '../realtime/game.gateway';
import * as crypto from 'crypto';

@Injectable()
export class CombatParticipantsService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
        private readonly realtime: GameGateway,
    ) { }

    private async assertDm(gameId: string, userId: string) {
        const { data } = await this.supabase
            .from('game_players')
            .select('role')
            .eq('game_id', gameId)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (!data || data.role !== 'dm') {
            throw new ForbiddenException('Only DM allowed');
        }
    }

    private async getActiveCombat(gameId: string) {
        const { data } = await this.supabase
            .from('combats')
            .select('*')
            .eq('game_id', gameId)
            .eq('is_active', true)
            .single();

        if (!data) {
            throw new NotFoundException('No active combat');
        }

        return data;
    }

    async add(gameId: string, userId: string, dto: AddParticipantDto) {
        await this.assertDm(gameId, userId);

        const combat = await this.getActiveCombat(gameId);

        const { data: actor } = await this.supabase
            .from('actors_in_game')
            .select('id')
            .eq('id', dto.actor_in_game_id)
            .eq('game_id', gameId)
            .single();

        if (!actor) {
            throw new BadRequestException(
                'Actor does not belong to this game',
            );
        }

        const { data: existing } = await this.supabase
            .from('combat_participants')
            .select('id')
            .eq('combat_id', combat.id)
            .eq('actor_in_game_id', dto.actor_in_game_id)
            .maybeSingle();

        if (existing) {
            throw new BadRequestException('Actor already in combat');
        }

        const participantId = randomUUID();

        const { error } = await this.supabase
            .from('combat_participants')
            .insert({
                id: participantId,
                combat_id: combat.id,
                actor_in_game_id: dto.actor_in_game_id,
                initiative: dto.initiative,
                turn_order: 0,
                is_active: true,
                is_conscious: true,
            });

        if (error) throw error;

        await this.reorderTurns(combat.id);

        return this.list(gameId);
    }

    async list(gameId: string) {
        const combat = await this.getActiveCombat(gameId);

        const { data, error } = await this.supabase
            .from('combat_participants')
            .select(`
        id,
        initiative,
        turn_order,
        is_active,
        is_conscious,
        actors_in_game (
          id,
          name_override,
          current_hp
        )
      `)
            .eq('combat_id', combat.id)
            .order('turn_order');

        if (error) throw error;
        return data;
    }

    async updateInitiative(
        gameId: string,
        participantId: string,
        userId: string,
        dto: UpdateInitiativeDto,
    ) {
        await this.assertDm(gameId, userId);

        const combat = await this.getActiveCombat(gameId);

        const { error } = await this.supabase
            .from('combat_participants')
            .update({ initiative: dto.initiative })
            .eq('id', participantId)
            .eq('combat_id', combat.id);

        if (error) throw error;

        await this.reorderTurns(combat.id);

        return this.list(gameId);
    }

    async nextTurn(gameId: string, userId: string) {
        await this.assertDm(gameId, userId);

        const combat = await this.getActiveCombat(gameId);

        const { data: participants } = await this.supabase
            .from('combat_participants')
            .select('id')
            .eq('combat_id', combat.id)
            .eq('is_active', true)
            .order('turn_order');

        if (!participants || participants.length === 0) {
            throw new BadRequestException('No participants');
        }

        const nextIndex =
            (combat.current_turn_index + 1) % participants.length;

        const activeParticipant = participants[nextIndex];

        const { data: updatedCombat } = await this.supabase
            .from('combats')
            .update({
                current_turn_index: nextIndex,
            })
            .eq('id', combat.id)
            .select()
            .single();

        this.realtime.emitToGame(gameId, 'combat.turn.changed', {
            game_id: gameId,
            combat_id: combat.id,
            current_turn_index: nextIndex,
            active_participant_id: activeParticipant.id,
        });

        await this.supabase.from('game_logs').insert({
            id: crypto.randomUUID(),
            game_id: gameId,
            action_type: 'combat.turn.changed',
            payload: {
                current_turn_index: nextIndex,
                active_participant_id: activeParticipant.id,
            },
        });

        return updatedCombat;
    }

    async remove(
        gameId: string,
        participantId: string,
        userId: string,
    ) {
        await this.assertDm(gameId, userId);

        const combat = await this.getActiveCombat(gameId);

        const { error } = await this.supabase
            .from('combat_participants')
            .delete()
            .eq('id', participantId)
            .eq('combat_id', combat.id);

        if (error) throw error;

        await this.reorderTurns(combat.id);

        return this.list(gameId);
    }

    private async reorderTurns(combatId: string) {
        const { data: participants } = await this.supabase
            .from('combat_participants')
            .select('id')
            .eq('combat_id', combatId)
            .order('initiative', { ascending: false });

        if (!participants) return;

        for (let i = 0; i < participants.length; i++) {
            await this.supabase
                .from('combat_participants')
                .update({ turn_order: i })
                .eq('id', participants[i].id);
        }
    }
}
