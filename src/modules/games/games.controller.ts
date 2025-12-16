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
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@UseGuards(JwtAuthGuard)
@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) { }

    @Post()
    create(@Req() req, @Body() dto: CreateGameDto) {
        return this.gamesService.create(req.user.id, dto);
    }

    @Get()
    findAll(@Req() req) {
        return this.gamesService.findAllForUser(req.user.id);
    }

    @Get(':id')
    findOne(@Req() req, @Param('id') id: string) {
        return this.gamesService.findOne(id, req.user.id);
    }

    @Patch(':id')
    update(
        @Req() req,
        @Param('id') id: string,
        @Body() dto: UpdateGameDto,
    ) {
        return this.gamesService.update(id, req.user.id, dto);
    }

    @Delete(':id')
    archive(@Req() req, @Param('id') id: string) {
        return this.gamesService.archive(id, req.user.id);
    }

    @Post(':id/join')
    join(@Req() req, @Param('id') id: string) {
        return this.gamesService.joinGame(id, req.user.id);
    }

}
