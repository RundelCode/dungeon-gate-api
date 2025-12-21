import {
    Injectable,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class BackgroundsService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    // 📋 Listar backgrounds
    async findAll() {
        const { data, error } = await this.supabase
            .from('backgrounds')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    }

    // 🔍 Ver background
    async findOne(backgroundId: string) {
        const { data, error } = await this.supabase
            .from('backgrounds')
            .select('*')
            .eq('id', backgroundId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Background not found');
        }

        return data;
    }
}
