import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CombatParticipantsService } from './combat-participants.service';
import { AddParticipantDto } from './dto/add-participant.dto';
import { UpdateInitiativeDto } from './dto/update-initiative.dto';

@UseGuards(JwtAuthGuard)
@Controller('games/:gameId/combat/participants')
export class CombatParticipantsController {
    constructor(
        private readonly service: CombatParticipantsService,
    ) { }

    @Post()
    add(
        @Req() req,
        @Param('gameId') gameId: string,
        @Body() dto: AddParticipantDto,
    ) {
        return this.service.add(
            gameId,
            req.user.id,
            dto,
        );
    }

    @Get()
    list(
        @Req() req,
        @Param('gameId') gameId: string,
    ) {
        return this.service.list(gameId);
    }

    @Patch(':participantId/initiative')
    updateInitiative(
        @Req() req,
        @Param('gameId') gameId: string,
        @Param('participantId') participantId: string,
        @Body() dto: UpdateInitiativeDto,
    ) {
        return this.service.updateInitiative(
            gameId,
            participantId,
            req.user.id,
            dto,
        );
    }

    @Patch('next-turn')
    nextTurn(
        @Req() req,
        @Param('gameId') gameId: string,
    ) {
        return this.service.nextTurn(
            gameId,
            req.user.id,
        );
    }

    @Delete(':participantId')
    remove(
        @Req() req,
        @Param('gameId') gameId: string,
        @Param('participantId') participantId: string,
    ) {
        return this.service.remove(
            gameId,
            participantId,
            req.user.id,
        );
    }

    @Post('round/advance')
    async advanceRound(
        @Param('gameId') gameId: string,
        @Req() req: any,
    ) {
        return this.service.forceAdvanceRound(
            gameId,
            req.user.id,
        );
    }

}
