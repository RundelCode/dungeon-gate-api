import {
    Injectable,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class RacesService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    // 📋 Listar razas
    async findAll() {
        const { data, error } = await this.supabase
            .from('races')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    }

    // 🔍 Ver raza
    async findOne(raceId: string) {
        const { data, error } = await this.supabase
            .from('races')
            .select('*')
            .eq('id', raceId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Race not found');
        }

        return data;
    }
}
