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
import { ActorsInGameService } from './actors-in-game.service';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { SpawnCharacterActorDto } from './dto/spawn-character-actor.dto';
import { UpdateHpDto } from './dto/update-hp.dto';

@UseGuards(JwtAuthGuard)
@Controller('games/:gameId/actors')
export class ActorsInGameController {
    constructor(
        private readonly actorsService: ActorsInGameService,
    ) { }

    @Post()
    create(
        @Req() req,
        @Param('gameId') gameId: string,
        @Body() dto: CreateActorDto,
    ) {
        return this.actorsService.create(gameId, req.user.id, dto);
    }

    @Get()
    findAll(
        @Req() req,
        @Param('gameId') gameId: string,
    ) {
        return this.actorsService.findAll(gameId, req.user.id);
    }

    @Get(':actorId')
    findOne(
        @Req() req,
        @Param('actorId') actorId: string,
    ) {
        return this.actorsService.findOne(actorId, req.user.id);
    }

    @Patch(':actorId')
    update(
        @Req() req,
        @Param('actorId') actorId: string,
        @Body() dto: UpdateActorDto,
    ) {
        return this.actorsService.update(actorId, req.user.id, dto);
    }

    @Delete(':actorId')
    remove(
        @Req() req,
        @Param('actorId') actorId: string,
    ) {
        return this.actorsService.remove(actorId, req.user.id);
    }

    @Post('/characters/:characterId/actor')
    spawnFromCharacter(
        @Req() req,
        @Param('gameId') gameId: string,
        @Param('characterId') characterId: string,
        @Body() dto?: SpawnCharacterActorDto,
    ) {
        return this.actorsService.spawnFromCharacter(
            gameId,
            characterId,
            req.user.id,
            dto?.name_override,
        );
    }

    @Patch(':actorId/hp')
    updateHp(
        @Req() req,
        @Param('actorId') actorId: string,
        @Body() dto: UpdateHpDto,
    ) {
        return this.actorsService.updateHp(
            actorId,
            req.user.id,
            dto,
        );
    }
}
