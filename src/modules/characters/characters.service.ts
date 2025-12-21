import {
    Injectable,
    Inject,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CharactersService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    async create(userId: string, dto: CreateCharacterDto) {
        const characterId = randomUUID();

        const { error } = await this.supabase
            .from('characters')
            .insert({
                id: characterId,
                owner_id: userId,
                ...dto,
            });

        if (error) throw error;

        return this.findOne(characterId, userId);
    }

    async findAll(userId: string) {
        const { data, error } = await this.supabase
            .from('characters')
            .select('*')
            .eq('owner_id', userId)
            .order('created_at');

        if (error) throw error;
        return data;
    }

    async findOne(characterId: string, userId: string) {
        const { data, error } = await this.supabase
            .from('characters')
            .select('*')
            .eq('id', characterId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Character not found');
        }

        if (data.owner_id !== userId) {
            throw new ForbiddenException('Not allowed');
        }

        return data;
    }

    async update(
        characterId: string,
        userId: string,
        dto: UpdateCharacterDto,
    ) {
        await this.findOne(characterId, userId);

        const { data, error } = await this.supabase
            .from('characters')
            .update({
                ...dto,
                updated_at: new Date(),
            })
            .eq('id', characterId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async remove(characterId: string, userId: string) {
        await this.findOne(characterId, userId);

        const { error } = await this.supabase
            .from('characters')
            .update({
                owner_id: null,
                updated_at: new Date(),
            })
            .eq('id', characterId);

        if (error) throw error;

        return { success: true };
    }
}
