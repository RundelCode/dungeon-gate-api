import {
    Injectable,
    Inject,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { AddSpellDto } from './dto/add-spell.dto';
import { UpdateCharacterSpellDto } from './dto/update-character-spell.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CharacterSpellsService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    // 🔒 Validar dueño del personaje
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

    // ➕ Aprender spell
    async addSpell(
        characterId: string,
        userId: string,
        dto: AddSpellDto,
    ) {
        await this.assertOwner(characterId, userId);

        const characterSpellId = randomUUID();

        const { error } = await this.supabase
            .from('character_spells')
            .insert({
                id: characterSpellId,
                character_id: characterId,
                spell_id: dto.spell_id,
                spell_level: dto.spell_level,
                is_prepared: dto.is_prepared ?? false,
                source: dto.source,
            });

        if (error) throw error;

        return this.findOne(characterSpellId, userId);
    }

    // 📋 Listar spells del personaje
    async findAll(characterId: string, userId: string) {
        await this.assertOwner(characterId, userId);

        const { data, error } = await this.supabase
            .from('character_spells')
            .select(`
        id,
        spell_level,
        is_prepared,
        source,
        spells ( * )
      `)
            .eq('character_id', characterId)
            .order('spell_level');

        if (error) throw error;
        return data;
    }

    // 🔍 Ver spell del personaje
    async findOne(characterSpellId: string, userId: string) {
        const { data, error } = await this.supabase
            .from('character_spells')
            .select(`
        id,
        spell_level,
        is_prepared,
        source,
        character_id,
        spells ( * )
      `)
            .eq('id', characterSpellId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Spell not found');
        }

        await this.assertOwner(data.character_id, userId);
        return data;
    }

    // ✏️ Preparar / des-preparar
    async update(
        characterSpellId: string,
        userId: string,
        dto: UpdateCharacterSpellDto,
    ) {
        const { data } = await this.supabase
            .from('character_spells')
            .select('character_id')
            .eq('id', characterSpellId)
            .single();

        if (!data) {
            throw new NotFoundException('Spell not found');
        }

        await this.assertOwner(data.character_id, userId);

        const { data: updated, error } = await this.supabase
            .from('character_spells')
            .update(dto)
            .eq('id', characterSpellId)
            .select(`
        id,
        spell_level,
        is_prepared,
        source,
        spells ( * )
      `)
            .single();

        if (error) throw error;
        return updated;
    }

    // ❌ Quitar spell
    async remove(characterSpellId: string, userId: string) {
        const { data } = await this.supabase
            .from('character_spells')
            .select('character_id')
            .eq('id', characterSpellId)
            .single();

        if (!data) {
            throw new NotFoundException('Spell not found');
        }

        await this.assertOwner(data.character_id, userId);

        const { error } = await this.supabase
            .from('character_spells')
            .delete()
            .eq('id', characterSpellId);

        if (error) throw error;

        return { success: true };
    }
}
