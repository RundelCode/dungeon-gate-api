import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Req,
    UseGuards,
    Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GameLogsService } from './game-logs.service';
import { CreateGameLogDto } from './dto/create-log.dto';

@UseGuards(JwtAuthGuard)
@Controller('games/:gameId/logs')
export class GameLogsController {
    constructor(
        private readonly gameLogsService: GameLogsService,
    ) { }

    @Get()
    findAll(
        @Req() req,
        @Param('gameId') gameId: string,
        @Query('limit') limit?: string,
    ) {
        return this.gameLogsService.findAll(
            gameId,
            req.user.id,
            limit ? parseInt(limit) : 50,
        );
    }

    @Post()
    create(
        @Req() req,
        @Body() dto: CreateGameLogDto,
    ) {
        return this.gameLogsService.create(
            req.user.id,
            dto,
        );
    }
}
