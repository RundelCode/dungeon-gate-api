import {
    Injectable,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateSpellDto } from './dto/create-spell.dto';
import { UpdateSpellDto } from './dto/update-spell.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class SpellsService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    async create(dto: CreateSpellDto) {
        const spellId = randomUUID();

        const { error } = await this.supabase
            .from('spells')
            .insert({
                id: spellId,
                ...dto,
            });

        if (error) throw error;

        return this.findOne(spellId);
    }

    async findAll() {
        const { data, error } = await this.supabase
            .from('spells')
            .select('*')
            .order('level')
            .order('name');

        if (error) throw error;
        return data;
    }

    async findOne(spellId: string) {
        const { data, error } = await this.supabase
            .from('spells')
            .select('*')
            .eq('id', spellId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Spell not found');
        }

        return data;
    }

    async update(spellId: string, dto: UpdateSpellDto) {
        const { data, error } = await this.supabase
            .from('spells')
            .update(dto)
            .eq('id', spellId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async remove(spellId: string) {
        const { error } = await this.supabase
            .from('spells')
            .delete()
            .eq('id', spellId);

        if (error) throw error;

        return { success: true };
    }
}
