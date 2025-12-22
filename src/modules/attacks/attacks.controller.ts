import { Controller, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AttacksService } from './attacks.service';
import { PerformAttackDto } from './dto/perform-attack.dto';

@UseGuards(JwtAuthGuard)
@Controller('games/:gameId/attacks')
export class AttacksController {
    constructor(private readonly service: AttacksService) { }

    @Post()
    execute(
        @Req() req,
        @Param('gameId') gameId: string,
        @Body() dto: PerformAttackDto,
    ) {
        return this.service.executeAttack(
            gameId,
            req.user.id,
            dto.attack_id,
            dto.attacker_actor_id,
            dto.target_actor_id,
            dto.advantage,
            dto.disadvantage,
        );
    }
}
