import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Global()
@Module({
    providers: [
        {
            provide: 'SUPABASE_ANON_CLIENT',
            inject: [ConfigService],
            useFactory: (config: ConfigService): SupabaseClient => {
                return createClient(
                    config.getOrThrow<string>('SUPABASE_URL'),
                    config.getOrThrow<string>('SUPABASE_ANON_KEY'),
                );
            },
        },
        {
            provide: 'SUPABASE_SERVICE_CLIENT',
            inject: [ConfigService],
            useFactory: (config: ConfigService): SupabaseClient => {
                return createClient(
                    config.getOrThrow<string>('SUPABASE_URL'),
                    config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
                );
            },
        },
    ],
    exports: ['SUPABASE_ANON_CLIENT', 'SUPABASE_SERVICE_CLIENT'],
})
export class SupabaseModule { }
