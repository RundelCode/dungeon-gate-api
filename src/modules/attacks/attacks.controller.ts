import {
    Controller,
    Post,
    Param,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AttacksService } from './attacks.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('games/:gameId/attacks')
@UseGuards(JwtAuthGuard)
export class AttacksController {
    constructor(
        private readonly attacksService: AttacksService,
    ) { }

    @Post(':attackId/execute')
    async executeAttack(
        @Param('gameId') gameId: string,
        @Param('attackId') attackId: string,
        @Body()
        body: {
            attacker_actor_id: string;
            target_actor_id: string;
        },
        @Req() req: any,
    ) {
        return this.attacksService.executeAttack(
            gameId,
            req.user.id,
            attackId,
            body.attacker_actor_id,
            body.target_actor_id,
        );
    }
}
