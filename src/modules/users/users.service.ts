import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    // 🔍 Get profile
    async findById(userId: string) {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    }

    // ✏️ Update profile
    async update(userId: string, dto: UpdateUserDto) {
        const { data, error } = await this.supabase
            .from('users')
            .update({
                ...dto,
                updated_at: new Date(),
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ❌ Soft delete
    async deactivate(userId: string) {
        const { error } = await this.supabase
            .from('users')
            .update({
                is_active: false,
                updated_at: new Date(),
            })
            .eq('id', userId);

        if (error) throw error;

        return { success: true };
    }

    // 🎲 Get games
    async getGames(userId: string) {
        const { data, error } = await this.supabase
            .from('game_players')
            .select(`
        role,
        games (
          id,
          name,
          status,
          created_at
        )
      `)
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    }

    // 🧙 Get my characters
    async getCharacters(userId: string) {
        const { data, error } = await this.supabase
            .from('characters')
            .select('*')
            .eq('owner_id', userId);

        if (error) throw error;
        return data;
    }
}
