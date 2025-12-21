import {
    Injectable,
    Inject,
    ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateGameLogDto } from './dto/create-log.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class GameLogsService {
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

    async create(userId: string, dto: CreateGameLogDto) {
        await this.assertMember(dto.game_id, userId);

        const logId = randomUUID();

        const { error } = await this.supabase
            .from('game_logs')
            .insert({
                id: logId,
                game_id: dto.game_id,
                scene_id: dto.scene_id,
                actor_in_game_id: dto.actor_in_game_id,
                action_type: dto.action_type,
                payload: dto.payload,
            });

        if (error) throw error;

        return { success: true };
    }

    async findAll(
        gameId: string,
        userId: string,
        limit = 50,
    ) {
        await this.assertMember(gameId, userId);

        const { data, error } = await this.supabase
            .from('game_logs')
            .select(`
        id,
        action_type,
        payload,
        created_at,
        actor_in_game_id,
        scene_id
      `)
            .eq('game_id', gameId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }
}
