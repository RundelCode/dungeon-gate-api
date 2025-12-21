import {
    Injectable,
    Inject,
    ForbiddenException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { randomUUID } from 'crypto';
import { SpawnTokenDto } from './dto/spawn-token.dto';
import { MoveTokenDto } from './dto/move-token.dto';
import { GameGateway } from '../realtime/game.gateway';

@Injectable()
export class TokensService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
        private readonly realtime: GameGateway
    ) { }

    private async assertMember(sceneId: string, userId: string) {
        const { data: scene } = await this.supabase
            .from('scenes')
            .select('game_id')
            .eq('id', sceneId)
            .single();

        if (!scene) throw new NotFoundException('Scene not found');

        const { data: member } = await this.supabase
            .from('game_players')
            .select('id')
            .eq('game_id', scene.game_id)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (!member) {
            throw new ForbiddenException('Not a member of this game');
        }

        return scene.game_id;
    }

    private async assertDm(sceneId: string, userId: string) {
        const gameId = await this.assertMember(sceneId, userId);

        const { data } = await this.supabase
            .from('game_players')
            .select('role')
            .eq('game_id', gameId)
            .eq('user_id', userId)
            .single();

        if (!data || data.role !== 'dm') {
            throw new ForbiddenException('Only DM can manage tokens');
        }

        return gameId;
    }

    async create(sceneId: string, userId: string, dto: CreateTokenDto) {
        await this.assertDm(sceneId, userId);

        const tokenId = randomUUID();

        const { error } = await this.supabase
            .from('tokens')
            .insert({
                id: tokenId,
                scene_id: sceneId,
                actor_in_game_id: dto.actor_in_game_id,
                label: dto.label,
                kind: dto.kind,
                icon_url: dto.icon_url,
                x: dto.x,
                y: dto.y,
                z_index: dto.z_index ?? 0,
                is_visible_to_players: dto.is_visible_to_players ?? true,
            });

        if (error) throw error;

        return this.findOne(tokenId, userId);
    }

    async findByScene(sceneId: string, userId: string) {
        await this.assertMember(sceneId, userId);

        const { data, error } = await this.supabase
            .from('tokens')
            .select('*')
            .eq('scene_id', sceneId)
            .order('z_index');

        if (error) throw error;
        return data;
    }

    async findOne(tokenId: string, userId: string) {
        const { data, error } = await this.supabase
            .from('tokens')
            .select('*, scenes ( game_id )')
            .eq('id', tokenId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Token not found');
        }

        const { data: member } = await this.supabase
            .from('game_players')
            .select('id')
            .eq('game_id', data.scenes.game_id)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (!member) {
            throw new ForbiddenException('Not allowed');
        }

        return data;
    }

    async update(tokenId: string, userId: string, dto: UpdateTokenDto) {
        const { data: token } = await this.supabase
            .from('tokens')
            .select('scene_id')
            .eq('id', tokenId)
            .single();

        if (!token) throw new NotFoundException('Token not found');

        await this.assertDm(token.scene_id, userId);

        const { data, error } = await this.supabase
            .from('tokens')
            .update({
                ...dto,
                updated_at: new Date(),
            })
            .eq('id', tokenId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async remove(tokenId: string, userId: string) {
        const { data: token } = await this.supabase
            .from('tokens')
            .select('scene_id')
            .eq('id', tokenId)
            .single();

        if (!token) throw new NotFoundException('Token not found');

        await this.assertDm(token.scene_id, userId);

        const { error } = await this.supabase
            .from('tokens')
            .delete()
            .eq('id', tokenId);

        if (error) throw error;

        return { success: true };
    }


    async spawnFromActor(
        sceneId: string,
        actorId: string,
        userId: string,
        dto: SpawnTokenDto,
    ) {
        const { data: scene } = await this.supabase
            .from('scenes')
            .select('id, game_id')
            .eq('id', sceneId)
            .single();

        if (!scene) {
            throw new NotFoundException('Scene not found');
        }

        await this.assertDm(scene.game_id, userId);

        const { data: actor } = await this.supabase
            .from('actors_in_game')
            .select('id, game_id, name_override')
            .eq('id', actorId)
            .single();

        if (!actor || actor.game_id !== scene.game_id) {
            throw new BadRequestException(
                'Actor does not belong to this game',
            );
        }

        const tokenId = randomUUID();

        const { error } = await this.supabase
            .from('tokens')
            .insert({
                id: tokenId,
                scene_id: sceneId,
                actor_in_game_id: actor.id,
                label: actor.name_override,
                kind: 'actor',
                icon_url: dto.icon_url,
                x: dto.x,
                y: dto.y,
                z_index: 1,
                is_visible_to_players:
                    dto.is_visible_to_players ?? true,
            });

        if (error) throw error;

        const { data: token } = await this.supabase
            .from('tokens')
            .select('*')
            .eq('id', tokenId)
            .single();

        return token;
    }

    async moveToken(
        tokenId: string,
        userId: string,
        dto: MoveTokenDto,
    ) {

        const { data: token, error: tokenError } =
            await this.supabase
                .from('tokens')
                .select('id, scene_id, x, y, z_index')
                .eq('id', tokenId)
                .single();

        if (tokenError || !token) {
            throw new NotFoundException('Token not found');
        }


        const { data: scene, error: sceneError } =
            await this.supabase
                .from('scenes')
                .select('id, game_id')
                .eq('id', token.scene_id)
                .single();

        if (sceneError || !scene) {
            throw new NotFoundException('Scene not found');
        }

        const gameId = scene.game_id;

        await this.assertDm(gameId, userId);

        const { data: updated, error: updateError } =
            await this.supabase
                .from('tokens')
                .update({
                    x: dto.x,
                    y: dto.y,
                    z_index: dto.z_index,
                    updated_at: new Date(),
                })
                .eq('id', tokenId)
                .select()
                .single();

        if (updateError || !updated) {
            throw updateError;
        }

        this.realtime.emitToGame(gameId, 'token.moved', {
            token_id: updated.id,
            scene_id: scene.id,
            x: updated.x,
            y: updated.y,
            z_index: updated.z_index,
        });

        await this.supabase.from('game_logs').insert({
            id: crypto.randomUUID(),
            game_id: gameId,
            scene_id: scene.id,
            action_type: 'token.moved',
            payload: {
                token_id: updated.id,
                from: {
                    x: token.x,
                    y: token.y,
                    z_index: token.z_index,
                },
                to: {
                    x: updated.x,
                    y: updated.y,
                    z_index: updated.z_index,
                },
            },
        });

        return updated;
    }
}
