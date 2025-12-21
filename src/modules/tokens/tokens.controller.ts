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
import { TokensService } from './tokens.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { SpawnTokenDto } from './dto/spawn-token.dto';
import { MoveTokenDto } from './dto/move-token.dto';
import { GameGateway } from '../realtime/game.gateway';

@UseGuards(JwtAuthGuard)
@Controller()
export class TokensController {
    constructor(private readonly tokensService: TokensService) { }

    @Post('scenes/:sceneId/tokens')
    create(
        @Req() req,
        @Param('sceneId') sceneId: string,
        @Body() dto: CreateTokenDto,
    ) {
        return this.tokensService.create(sceneId, req.user.id, dto);
    }

    @Get('scenes/:sceneId/tokens')
    findByScene(
        @Req() req,
        @Param('sceneId') sceneId: string,
    ) {
        return this.tokensService.findByScene(sceneId, req.user.id);
    }

    @Patch('tokens/:tokenId')
    update(
        @Req() req,
        @Param('tokenId') tokenId: string,
        @Body() dto: UpdateTokenDto,
    ) {
        return this.tokensService.update(tokenId, req.user.id, dto);
    }

    @Delete('tokens/:tokenId')
    remove(
        @Req() req,
        @Param('tokenId') tokenId: string,
    ) {
        return this.tokensService.remove(tokenId, req.user.id);
    }

    @Post('/scenes/:sceneId/actors/:actorId/token')
    spawnFromActor(
        @Req() req,
        @Param('sceneId') sceneId: string,
        @Param('actorId') actorId: string,
        @Body() dto: SpawnTokenDto,
    ) {
        return this.tokensService.spawnFromActor(
            sceneId,
            actorId,
            req.user.id,
            dto,
        );
    }


    @Patch(':tokenId/move')
    move(
        @Req() req,
        @Param('tokenId') tokenId: string,
        @Body() dto: MoveTokenDto,
    ) {
        return this.tokensService.moveToken(
            tokenId,
            req.user.id,
            dto,
        );
    }


}
