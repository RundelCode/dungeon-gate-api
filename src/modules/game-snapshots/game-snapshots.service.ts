import {
    Injectable,
    Inject,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
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


    async create(
        gameId: string,
        userId: string,
        dto: CreateSnapshotDto,
    ) {
        await this.assertDm(gameId, userId);

        const snapshotId = randomUUID();

        const { error } = await this.supabase
            .from('game_snapshots')
            .insert({
                id: snapshotId,
                game_id: gameId,
                label: dto.label,
                state_json: dto.state_json,
            });

        if (error) throw error;

        return this.findOne(gameId, snapshotId, userId);
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
