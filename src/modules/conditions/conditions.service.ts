import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateConditionDto } from './dto/create-condition.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ConditionsService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    private async assertDm(userId: string) {
        const { data } = await this.supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        if (!data || data.role !== 'dm') {
            throw new ForbiddenException('Only DM can manage conditions');
        }
    }

    async findAll() {
        const { data, error } = await this.supabase
            .from('conditions')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    }

    async findOne(id: string) {
        const { data, error } = await this.supabase
            .from('conditions')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            throw new NotFoundException('Condition not found');
        }

        return data;
    }

    async create(userId: string, dto: CreateConditionDto) {
        await this.assertDm(userId);

        const id = randomUUID();

        const { error } = await this.supabase
            .from('conditions')
            .insert({
                id,
                name: dto.name,
                description: dto.description,
                source: dto.source,
            });

        if (error) throw error;

        return this.findOne(id);
    }

    async update(
        id: string,
        userId: string,
        dto: UpdateConditionDto,
    ) {
        await this.assertDm(userId);

        const { data, error } = await this.supabase
            .from('conditions')
            .update(dto)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) {
            throw new NotFoundException('Condition not found');
        }

        return data;
    }

    async remove(id: string, userId: string) {
        await this.assertDm(userId);

        const { error } = await this.supabase
            .from('conditions')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    }
}
