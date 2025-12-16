import { Inject, Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class GamesService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    async create(userId: string, dto: CreateGameDto) {
        const gameId = randomUUID();

        const { error: gameError } = await this.supabase
            .from('games')
            .insert({
                id: gameId,
                name: dto.name,
                owner_id: userId,
                mode: dto.mode,
                status: 'active',
                max_players: dto.max_players,
                description: dto.description,
            });

        if (gameError) throw gameError;

        const { error: playerError } = await this.supabase
            .from('game_players')
            .insert({
                id: randomUUID(),
                game_id: gameId,
                user_id: userId,
                role: 'dm',
            });

        if (playerError) throw playerError;

        return this.findOne(gameId, userId);
    }

    async findAllForUser(userId: string) {
        const { data, error } = await this.supabase
            .from('game_players')
            .select(`
        role,
        games (
          id,
          name,
          status,
          mode,
          created_at
        )
      `)
            .eq('user_id', userId)
            .eq('is_active', true);

        if (error) throw error;
        return data;
    }

    async findOne(gameId: string, userId: string) {
        const { data, error } = await this.supabase
            .from('games')
            .select(`
        *,
        game_players (
          user_id,
          role,
          is_active
        )
      `)
            .eq('id', gameId)
            .single();

        if (error) throw error;

        // Validar que el usuario pertenece a la partida
        const isMember = data.game_players.some(
            (p) => p.user_id === userId && p.is_active,
        );

        if (!isMember) {
            throw new ForbiddenException('Not a member of this game');
        }

        return data;
    }

    async update(gameId: string, userId: string, dto: UpdateGameDto) {
        await this.assertDm(gameId, userId);

        const { data, error } = await this.supabase
            .from('games')
            .update({
                ...dto,
                updated_at: new Date(),
            })
            .eq('id', gameId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async archive(gameId: string, userId: string) {
        await this.assertDm(gameId, userId);

        const { error } = await this.supabase
            .from('games')
            .update({
                status: 'archived',
                updated_at: new Date(),
            })
            .eq('id', gameId);

        if (error) throw error;

        return { success: true };
    }

    private async assertDm(gameId: string, userId: string) {
        const { data, error } = await this.supabase
            .from('game_players')
            .select('role')
            .eq('game_id', gameId)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (error || data.role !== 'dm') {
            throw new ForbiddenException('Only DM can perform this action');
        }
    }

    async joinGame(gameId: string, userId: string) {
        const { data: game, error: gameError } = await this.supabase
            .from('games')
            .select('id, max_players, status')
            .eq('id', gameId)
            .single();

        if (gameError || !game) {
            throw new NotFoundException('Game not found');
        }

        if (game.status !== 'active') {
            throw new BadRequestException('Game is not active');
        }

        const { data: existing } = await this.supabase
            .from('game_players')
            .select('id')
            .eq('game_id', gameId)
            .eq('user_id', userId)
            .eq('is_active', true)
            .maybeSingle();

        if (existing) {
            throw new BadRequestException('Already joined this game');
        }

        const { count } = await this.supabase
            .from('game_players')
            .select('*', { count: 'exact', head: true })
            .eq('game_id', gameId)
            .eq('is_active', true);
        if (count) {
            if (count >= game.max_players) {
                throw new BadRequestException('Game is full');
            }
        }

        const { error } = await this.supabase
            .from('game_players')
            .insert({
                id: randomUUID(),
                game_id: gameId,
                user_id: userId,
                role: 'player',
            });

        if (error) throw error;

        return { success: true };
    }

}
