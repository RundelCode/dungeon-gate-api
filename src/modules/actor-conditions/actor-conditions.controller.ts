import { Controller, Post, Delete, Get, Param, Body, Req } from '@nestjs/common';
import { ActorConditionsService } from './actor-conditions.service';
import { ApplyConditionDto } from './dto/apply-condition.dto';
import { RemoveConditionDto } from './dto/remove-condition.dto';

@Controller('games/:gameId/conditions')
export class ActorConditionsController {
    constructor(
        private readonly service: ActorConditionsService,
    ) { }

    @Post()
    apply(
        @Req() req,
        @Param('gameId') gameId: string,
        @Body() dto: ApplyConditionDto,
    ) {
        return this.service.apply(
            gameId,
            req.user.id,
            dto,
        );
    }

    @Delete()
    remove(
        @Req() req,
        @Param('gameId') gameId: string,
        @Body() dto: RemoveConditionDto,
    ) {
        return this.service.remove(
            gameId,
            req.user.id,
            dto,
        );
    }

    @Get(':actorId')
    list(
        @Param('gameId') gameId: string,
        @Param('actorId') actorId: string,
    ) {
        return this.service.listForActor(
            gameId,
            actorId,
        );
    }
}
