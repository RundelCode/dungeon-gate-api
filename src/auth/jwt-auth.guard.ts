import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    Inject,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        @Inject('SUPABASE_ANON_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();

        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            throw new UnauthorizedException('No token provided');
        }

        const token = authHeader.replace('Bearer ', '');

        const { data, error } = await this.supabase.auth.getUser(token);

        if (error || !data?.user) {
            throw new UnauthorizedException('Invalid token');
        }

        req.user = {
            id: data.user.id,
            email: data.user.email,
        };

        return true;
    }
}
