import {
    Injectable,
    Inject,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

@Injectable()
export class GameSnapshotsService {
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

    async createAutoSnapshot(gameId: string, label: string) {
        const [
            game,
            actors,
            combats,
            participants,
            tokens,
            scenes,
            conditions,
        ] = await Promise.all([
            this.supabase.from('games').select('*').eq('id', gameId).single(),
            this.supabase.from('actors_in_game').select('*').eq('game_id', gameId),
            this.supabase.from('combats').select('*').eq('game_id', gameId).eq('is_active', true),
            this.supabase.from('combat_participants').select('*'),
            this.supabase.from('tokens').select('*'),
            this.supabase.from('scenes').select('*').eq('game_id', gameId),
            this.supabase.from('actor_conditions').select('*'),
        ]);

        const snapshot = {
            game: game.data,
            actors: actors.data ?? [],
            combat: combats.data?.[0] ?? null,
            combat_participants: participants.data ?? [],
            tokens: tokens.data ?? [],
            scenes: scenes.data ?? [],
            conditions: conditions.data ?? [],
            created_at: new Date().toISOString(),
            label,
        };

        await this.supabase.from('game_snapshots').insert({
            id: randomUUID(),
            game_id: gameId,
            label,
            state_json: snapshot,
        });

        return snapshot;
    }

    async createManual(
        gameId: string,
        userId: string,
        label: string,
    ) {
        await this.assertDm(gameId, userId);
        return this.createAutoSnapshot(gameId, label);
    }

    async findAll(gameId: string, userId: string) {
        await this.assertMember(gameId, userId);

        const { data, error } = await this.supabase
            .from('game_snapshots')
            .select('id, label, created_at')
            .eq('game_id', gameId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async findOne(
        gameId: string,
        snapshotId: string,
        userId: string,
    ) {
        await this.assertMember(gameId, userId);

        const { data, error } = await this.supabase
            .from('game_snapshots')
            .select('*')
            .eq('id', snapshotId)
            .eq('game_id', gameId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Snapshot not found');
        }

        return data;
    }

    async restore(
        gameId: string,
        snapshotId: string,
        userId: string,
    ) {
        await this.assertDm(gameId, userId);

        const snapshot = await this.findOne(
            gameId,
            snapshotId,
            userId,
        );

        return {
            restored: true,
            state: snapshot.state_json,
        };
    }
}
