import { Controller, Post, Param, Body, Req } from '@nestjs/common';
import { AttacksService } from './attacks.service';
import { PerformAttackDto } from './dto/perform-attack.dto';

@Controller('games/:gameId/attacks')
export class AttacksController {
    constructor(
        private readonly service: AttacksService,
    ) { }

    @Post()
    attack(
        @Req() req,
        @Param('gameId') gameId: string,
        @Body() dto: PerformAttackDto,
    ) {
        return this.service.performAttack(
            gameId,
            req.user.id,
            dto,
        );
    }
}
