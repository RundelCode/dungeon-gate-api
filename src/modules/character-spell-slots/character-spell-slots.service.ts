import {
    Injectable,
    Inject,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateSpellSlotDto } from './dto/create-spell-slot.dto';
import { UpdateSpellSlotDto } from './dto/update-spell-slot.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CharacterSpellSlotsService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    private async assertOwner(characterId: string, userId: string) {
        const { data } = await this.supabase
            .from('characters')
            .select('id')
            .eq('id', characterId)
            .eq('owner_id', userId)
            .single();

        if (!data) {
            throw new ForbiddenException('Not owner of this character');
        }
    }

    async create(
        characterId: string,
        userId: string,
        dto: CreateSpellSlotDto,
    ) {
        await this.assertOwner(characterId, userId);

        const slotId = randomUUID();

        const { error } = await this.supabase
            .from('character_spell_slots')
            .insert({
                id: slotId,
                character_id: characterId,
                spell_level: dto.spell_level,
                slots_max: dto.slots_max,
                slots_used: dto.slots_used,
            });

        if (error) throw error;

        return this.findOne(slotId, userId);
    }

    async findAll(characterId: string, userId: string) {
        await this.assertOwner(characterId, userId);

        const { data, error } = await this.supabase
            .from('character_spell_slots')
            .select('*')
            .eq('character_id', characterId)
            .order('spell_level');

        if (error) throw error;
        return data;
    }

    async findOne(slotId: string, userId: string) {
        const { data, error } = await this.supabase
            .from('character_spell_slots')
            .select('*')
            .eq('id', slotId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Spell slot not found');
        }

        await this.assertOwner(data.character_id, userId);
        return data;
    }

    async update(
        slotId: string,
        userId: string,
        dto: UpdateSpellSlotDto,
    ) {
        const { data } = await this.supabase
            .from('character_spell_slots')
            .select('character_id')
            .eq('id', slotId)
            .single();

        if (!data) {
            throw new NotFoundException('Spell slot not found');
        }

        await this.assertOwner(data.character_id, userId);

        const { data: updated, error } = await this.supabase
            .from('character_spell_slots')
            .update(dto)
            .eq('id', slotId)
            .select()
            .single();

        if (error) throw error;
        return updated;
    }

    async remove(slotId: string, userId: string) {
        const { data } = await this.supabase
            .from('character_spell_slots')
            .select('character_id')
            .eq('id', slotId)
            .single();

        if (!data) {
            throw new NotFoundException('Spell slot not found');
        }

        await this.assertOwner(data.character_id, userId);

        const { error } = await this.supabase
            .from('character_spell_slots')
            .delete()
            .eq('id', slotId);

        if (error) throw error;

        return { success: true };
    }
}
