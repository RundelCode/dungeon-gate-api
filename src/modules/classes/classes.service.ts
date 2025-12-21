import {
    Injectable,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ClassesService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    async findAll() {
        const { data, error } = await this.supabase
            .from('classes')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    }

    async findOne(classId: string) {
        const { data, error } = await this.supabase
            .from('classes')
            .select('*')
            .eq('id', classId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Class not found');
        }

        return data;
    }
}
