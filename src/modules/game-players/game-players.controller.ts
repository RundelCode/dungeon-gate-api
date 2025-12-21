import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GamePlayersService } from './game-players.service';
import { AssignCharacterDto } from './dto/assign-character.dto';
import { UpdatePlayerStatusDto } from './dto/update-player-status.dto';

@UseGuards(JwtAuthGuard)
@Controller('games/:gameId/players')
export class GamePlayersController {
    constructor(
        private readonly gamePlayersService: GamePlayersService,
    ) { }

    @Get()
    findAll(
        @Req() req,
        @Param('gameId') gameId: string,
    ) {
        return this.gamePlayersService.findAll(
            gameId,
            req.user.id,
        );
    }

    @Get('me')
    myRole(
        @Req() req,
        @Param('gameId') gameId: string,
    ) {
        return this.gamePlayersService.myRole(
            gameId,
            req.user.id,
        );
    }

    @Patch(':playerId/status')
    updateStatus(
        @Req() req,
        @Param('gameId') gameId: string,
        @Param('playerId') playerId: string,
        @Body() dto: UpdatePlayerStatusDto,
    ) {
        return this.gamePlayersService.updateStatus(
            gameId,
            playerId,
            req.user.id,
            dto,
        );
    }

    @Patch(':playerId/assign-character')
    assignCharacter(
        @Req() req,
        @Param('gameId') gameId: string,
        @Param('playerId') playerId: string,
        @Body() dto: AssignCharacterDto,
    ) {
        return this.gamePlayersService.assignCharacter(
            gameId,
            playerId,
            req.user.id,
            dto,
        );
    }

    @Patch(':playerId/kick')
    kick(
        @Req() req,
        @Param('gameId') gameId: string,
        @Param('playerId') playerId: string,
    ) {
        return this.gamePlayersService.kick(
            gameId,
            playerId,
            req.user.id,
        );
    }
}
