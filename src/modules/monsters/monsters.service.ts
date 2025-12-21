import {
    Injectable,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateMonsterDto } from './dto/create-monster.dto';
import { UpdateMonsterDto } from './dto/update-monster.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class MonstersService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    async create(dto: CreateMonsterDto) {
        const monsterId = randomUUID();

        const { error } = await this.supabase
            .from('monsters')
            .insert({
                id: monsterId,
                ...dto,
            });

        if (error) throw error;

        return this.findOne(monsterId);
    }

    async findAll() {
        const { data, error } = await this.supabase
            .from('monsters')
            .select('*')
            .order('challenge_rating', { ascending: true });

        if (error) throw error;
        return data;
    }

    async findOne(monsterId: string) {
        const { data, error } = await this.supabase
            .from('monsters')
            .select('*')
            .eq('id', monsterId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Monster not found');
        }

        return data;
    }

    async update(monsterId: string, dto: UpdateMonsterDto) {
        const { data, error } = await this.supabase
            .from('monsters')
            .update(dto)
            .eq('id', monsterId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async remove(monsterId: string) {
        const { error } = await this.supabase
            .from('monsters')
            .delete()
            .eq('id', monsterId);

        if (error) throw error;

        return { success: true };
    }
}
