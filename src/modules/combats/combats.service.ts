import {
    Injectable,
    Inject,
    ForbiddenException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { StartCombatDto } from './dto/start-combat.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CombatService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
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

    async startCombat(
        gameId: string,
        userId: string,
        dto: StartCombatDto,
    ) {
        await this.assertDm(gameId, userId);

        const { data: scene } = await this.supabase
            .from('scenes')
            .select('id')
            .eq('id', dto.scene_id)
            .eq('game_id', gameId)
            .single();

        if (!scene) {
            throw new NotFoundException(
                'Scene does not belong to this game',
            );
        }

        const { data: existing } = await this.supabase
            .from('combats')
            .select('id')
            .eq('game_id', gameId)
            .eq('is_active', true)
            .maybeSingle();

        if (existing) {
            throw new BadRequestException(
                'There is already an active combat',
            );
        }

        const combatId = randomUUID();

        const { error } = await this.supabase
            .from('combats')
            .insert({
                id: combatId,
                game_id: gameId,
                scene_id: dto.scene_id,
                round: 1,
                current_turn_index: 0,
                is_active: true,
            });

        if (error) throw error;

        return this.findActiveCombat(gameId, userId);
    }

    async findActiveCombat(gameId: string, userId: string) {
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


    async nextRound(gameId: string, userId: string) {
        await this.assertDm(gameId, userId);

        const { data: combat } = await this.supabase
            .from('combats')
            .select('*')
            .eq('game_id', gameId)
            .eq('is_active', true)
            .single();

        if (!combat) {
            throw new NotFoundException('No active combat');
        }

        const { data, error } = await this.supabase
            .from('combats')
            .update({
                round: combat.round + 1,
                current_turn_index: 0,
            })
            .eq('id', combat.id)
            .select()
            .single();

        if (error) throw error;

        return data;
    }


    async endCombat(gameId: string, userId: string) {
        await this.assertDm(gameId, userId);

        const { data, error } = await this.supabase
            .from('combats')
            .update({
                is_active: false,
                ended_at: new Date(),
            })
            .eq('game_id', gameId)
            .eq('is_active', true)
            .select()
            .single();

        if (error || !data) {
            throw new NotFoundException('No active combat');
        }

        return data;
    }

    async getActiveParticipant(gameId: string) {
        const { data: combat } = await this.supabase
            .from('combats')
            .select('id, current_turn_index')
            .eq('game_id', gameId)
            .eq('is_active', true)
            .single();

        if (!combat) return null;

        const { data: participants } = await this.supabase
            .from('combat_participants')
            .select('id, actor_in_game_id')
            .eq('combat_id', combat.id)
            .eq('is_active', true)
            .order('turn_order');

        if (!participants || participants.length === 0) return null;

        return participants[combat.current_turn_index];
    }

    async assertCanAct(gameId: string, userId: string) {
        const { data: role } = await this.supabase
            .from('game_players')
            .select('role')
            .eq('game_id', gameId)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (role?.role === 'dm') return;


        const { data: combat } = await this.supabase
            .from('combats')
            .select('id, current_turn_index')
            .eq('game_id', gameId)
            .eq('is_active', true)
            .maybeSingle();

        if (!combat) return;

        const { data: participants } = await this.supabase
            .from('combat_participants')
            .select('id, actor_in_game_id')
            .eq('combat_id', combat.id)
            .eq('is_active', true)
            .order('turn_order');

        if (!participants || participants.length === 0) {
            throw new ForbiddenException('Combat has no participants');
        }

        const activeParticipant =
            participants[combat.current_turn_index];

        const { data: player } = await this.supabase
            .from('game_players')
            .select('assigned_character_id')
            .eq('game_id', gameId)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (!player?.assigned_character_id) {
            throw new ForbiddenException(
                'You do not control any actor',
            );
        }

        const { data: actor } = await this.supabase
            .from('actors_in_game')
            .select('id')
            .eq('base_character_id', player.assigned_character_id)
            .eq('game_id', gameId)
            .single();

        if (!actor || actor.id !== activeParticipant.actor_in_game_id) {
            throw new ForbiddenException('Not your turn');
        }
    }

}
