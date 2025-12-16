import {
    Injectable,
    Inject,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateSceneDto } from './dto/create-scene.dto';
import { UpdateSceneDto } from './dto/update-scene.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ScenesService {
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
            throw new ForbiddenException('Only DM can manage scenes');
        }
    }

    private async assertMember(gameId: string, userId: string) {
        const { data } = await this.supabase
            .from('game_players')
            .select('id')
            .eq('game_id', gameId)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (!data) {
            throw new ForbiddenException('Not a member of this game');
        }
    }

    async create(gameId: string, userId: string, dto: CreateSceneDto) {
        await this.assertDm(gameId, userId);

        const sceneId = randomUUID();

        const { error } = await this.supabase
            .from('scenes')
            .insert({
                id: sceneId,
                game_id: gameId,
                name: dto.name,
                scene_type: dto.scene_type,
                is_battle_scene: dto.is_battle_scene ?? false,
                created_by: userId,
            });

        if (error) throw error;

        return this.findOne(gameId, sceneId, userId);
    }

    async findAll(gameId: string, userId: string) {
        await this.assertMember(gameId, userId);

        const { data, error } = await this.supabase
            .from('scenes')
            .select('*')
            .eq('game_id', gameId)
            .order('created_at');

        if (error) throw error;
        return data;
    }

    async findOne(gameId: string, sceneId: string, userId: string) {
        await this.assertMember(gameId, userId);

        const { data, error } = await this.supabase
            .from('scenes')
            .select('*')
            .eq('id', sceneId)
            .eq('game_id', gameId)
            .single();

        if (error) throw new NotFoundException('Scene not found');
        return data;
    }

    async update(
        gameId: string,
        sceneId: string,
        userId: string,
        dto: UpdateSceneDto,
    ) {
        await this.assertDm(gameId, userId);

        const { data, error } = await this.supabase
            .from('scenes')
            .update({
                ...dto,
                updated_at: new Date(),
            })
            .eq('id', sceneId)
            .eq('game_id', gameId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async remove(gameId: string, sceneId: string, userId: string) {
        await this.assertDm(gameId, userId);

        const { error } = await this.supabase
            .from('scenes')
            .delete()
            .eq('id', sceneId)
            .eq('game_id', gameId);

        if (error) throw error;
        return { success: true };
    }

    async setActive(gameId: string, sceneId: string, userId: string) {
        await this.assertDm(gameId, userId);

        const { error } = await this.supabase
            .from('games')
            .update({
                current_scene_id: sceneId,
                updated_at: new Date(),
            })
            .eq('id', gameId);

        if (error) throw error;

        return { success: true };
    }
}
