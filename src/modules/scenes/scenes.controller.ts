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
import { ScenesService } from './scenes.service';
import { CreateSceneDto } from './dto/create-scene.dto';
import { UpdateSceneDto } from './dto/update-scene.dto';

@UseGuards(JwtAuthGuard)
@Controller('games/:gameId/scenes')
export class ScenesController {
    constructor(private readonly scenesService: ScenesService) { }

    @Post()
    create(
        @Req() req,
        @Param('gameId') gameId: string,
        @Body() dto: CreateSceneDto,
    ) {
        return this.scenesService.create(gameId, req.user.id, dto);
    }

    @Get()
    findAll(@Req() req, @Param('gameId') gameId: string) {
        return this.scenesService.findAll(gameId, req.user.id);
    }

    @Get(':sceneId')
    findOne(
        @Req() req,
        @Param('gameId') gameId: string,
        @Param('sceneId') sceneId: string,
    ) {
        return this.scenesService.findOne(gameId, sceneId, req.user.id);
    }

    @Patch(':sceneId')
    update(
        @Req() req,
        @Param('gameId') gameId: string,
        @Param('sceneId') sceneId: string,
        @Body() dto: UpdateSceneDto,
    ) {
        return this.scenesService.update(gameId, sceneId, req.user.id, dto);
    }

    @Delete(':sceneId')
    remove(
        @Req() req,
        @Param('gameId') gameId: string,
        @Param('sceneId') sceneId: string,
    ) {
        return this.scenesService.remove(gameId, sceneId, req.user.id);
    }

    @Post(':sceneId/activate')
    activate(
        @Req() req,
        @Param('gameId') gameId: string,
        @Param('sceneId') sceneId: string,
    ) {
        return this.scenesService.setActive(gameId, sceneId, req.user.id);
    }
}
