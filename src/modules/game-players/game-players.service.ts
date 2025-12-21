import {
    Injectable,
    Inject,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { AssignCharacterDto } from './dto/assign-character.dto';
import { UpdatePlayerStatusDto } from './dto/update-player-status.dto';

@Injectable()
export class GamePlayersService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }


    private async assertMember(gameId: string, userId: string) {
        const { data } = await this.supabase
            .from('game_players')
            .select('id')
            .eq('game_id', gameId)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (!data) {
            throw new ForbiddenException('Not a member');
        }
    }

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


    async findAll(gameId: string, userId: string) {
        await this.assertMember(gameId, userId);

        const { data, error } = await this.supabase
            .from('game_players')
            .select(`
        id,
        role,
        is_active,
        joined_at,
        users (
          id,
          display_name,
          avatar_url
        ),
        characters (
          id,
          name
        )
      `)
            .eq('game_id', gameId);

        if (error) throw error;
        return data;
    }


    async myRole(gameId: string, userId: string) {
        const { data, error } = await this.supabase
            .from('game_players')
            .select('role')
            .eq('game_id', gameId)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            throw new NotFoundException();
        }

        return data;
    }


    async kick(
        gameId: string,
        playerId: string,
        userId: string,
    ) {
        await this.assertDm(gameId, userId);

        const { error } = await this.supabase
            .from('game_players')
            .update({ is_active: false })
            .eq('id', playerId)
            .eq('game_id', gameId);

        if (error) throw error;

        return { success: true };
    }


    async updateStatus(
        gameId: string,
        playerId: string,
        userId: string,
        dto: UpdatePlayerStatusDto,
    ) {
        await this.assertDm(gameId, userId);

        const { data, error } = await this.supabase
            .from('game_players')
            .update({ is_active: dto.is_active })
            .eq('id', playerId)
            .eq('game_id', gameId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }


    async assignCharacter(
        gameId: string,
        playerId: string,
        userId: string,
        dto: AssignCharacterDto,
    ) {
        await this.assertDm(gameId, userId);

        const { data, error } = await this.supabase
            .from('game_players')
            .update({
                assigned_character_id: dto.character_id,
            })
            .eq('id', playerId)
            .eq('game_id', gameId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
