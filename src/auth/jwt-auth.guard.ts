import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { jwtVerify } from 'jose';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing token');
        }

        const token = authHeader.replace('Bearer ', '');

        try {
            const secret = new TextEncoder().encode(
                process.env.SUPABASE_JWT_SECRET,
            );

            const { payload } = await jwtVerify(token, secret);

            req.user = {
                id: payload.sub,
                email: payload.email,
            };

            return true;
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
