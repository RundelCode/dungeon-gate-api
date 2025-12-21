import {
    Injectable,
    Inject,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateCharacterItemDto } from './dto/update-character-item.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CharacterItemsService {
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

    async addItem(
        characterId: string,
        userId: string,
        dto: AddItemDto,
    ) {
        await this.assertOwner(characterId, userId);

        const itemId = randomUUID();

        const { error } = await this.supabase
            .from('character_items')
            .insert({
                id: itemId,
                character_id: characterId,
                item_id: dto.item_id,
                quantity: dto.quantity ?? 1,
                is_equipped: dto.is_equipped ?? false,
                slot: dto.slot,
            });

        if (error) throw error;

        return this.findOne(itemId, userId);
    }

    async findAll(characterId: string, userId: string) {
        await this.assertOwner(characterId, userId);

        const { data, error } = await this.supabase
            .from('character_items')
            .select(`
        id,
        quantity,
        is_equipped,
        slot,
        items ( * )
      `)
            .eq('character_id', characterId);

        if (error) throw error;
        return data;
    }

    async findOne(characterItemId: string, userId: string) {
        const { data, error } = await this.supabase
            .from('character_items')
            .select(`
        id,
        quantity,
        is_equipped,
        slot,
        character_id,
        items ( * )
      `)
            .eq('id', characterItemId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Item not found');
        }

        await this.assertOwner(data.character_id, userId);
        return data;
    }

    async update(
        characterItemId: string,
        userId: string,
        dto: UpdateCharacterItemDto,
    ) {
        const { data } = await this.supabase
            .from('character_items')
            .select('character_id')
            .eq('id', characterItemId)
            .single();

        if (!data) {
            throw new NotFoundException('Item not found');
        }

        await this.assertOwner(data.character_id, userId);

        const { data: updated, error } = await this.supabase
            .from('character_items')
            .update(dto)
            .eq('id', characterItemId)
            .select(`
        id,
        quantity,
        is_equipped,
        slot,
        items ( * )
      `)
            .single();

        if (error) throw error;
        return updated;
    }

    async remove(characterItemId: string, userId: string) {
        const { data } = await this.supabase
            .from('character_items')
            .select('character_id')
            .eq('id', characterItemId)
            .single();

        if (!data) {
            throw new NotFoundException('Item not found');
        }

        await this.assertOwner(data.character_id, userId);

        const { error } = await this.supabase
            .from('character_items')
            .delete()
            .eq('id', characterItemId);

        if (error) throw error;

        return { success: true };
    }
}
