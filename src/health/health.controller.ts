import { Controller, Get, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Controller('health')
export class HealthController {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    @Get('supabase')
    async checkSupabase() {
        const { data, error } = await this.supabase
            .from('users')
            .select('id')
            .limit(1);

        if (error) {
            return {
                ok: false,
                error: error.message,
            };
        }

        return {
            ok: true,
            message: 'Supabase connection successful',
            sample: data,
        };
    }
}
