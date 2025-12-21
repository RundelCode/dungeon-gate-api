import {
    Injectable,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ItemsService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    async create(dto: CreateItemDto) {
        const itemId = randomUUID();

        const { error } = await this.supabase
            .from('items')
            .insert({
                id: itemId,
                ...dto,
            });

        if (error) throw error;

        return this.findOne(itemId);
    }

    async findAll() {
        const { data, error } = await this.supabase
            .from('items')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    }

    async findOne(itemId: string) {
        const { data, error } = await this.supabase
            .from('items')
            .select('*')
            .eq('id', itemId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Item not found');
        }

        return data;
    }

    async update(itemId: string, dto: UpdateItemDto) {
        const { data, error } = await this.supabase
            .from('items')
            .update(dto)
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async remove(itemId: string) {
        const { error } = await this.supabase
            .from('items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;

        return { success: true };
    }
}
