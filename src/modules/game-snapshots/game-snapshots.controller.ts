import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Req,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GameSnapshotsService } from './game-snapshots.service';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';

@UseGuards(JwtAuthGuard)
@Controller('games/:gameId/snapshots')
export class GameSnapshotsController {
    constructor(
        private readonly service: GameSnapshotsService,
    ) { }

    @Post()
    create(
        @Req() req,
        @Param('gameId') gameId: string,
        @Body() dto: CreateSnapshotDto,
    ) {
        return this.service.create(
            gameId,
            req.user.id,
            dto,
        );
    }

    @Get()
    findAll(
        @Req() req,
        @Param('gameId') gameId: string,
    ) {
        return this.service.findAll(
            gameId,
            req.user.id,
        );
    }

    @Get(':snapshotId')
    findOne(
        @Req() req,
        @Param('gameId') gameId: string,
        @Param('snapshotId') snapshotId: string,
    ) {
        return this.service.findOne(
            gameId,
            snapshotId,
            req.user.id,
        );
    }

    @Patch(':snapshotId/restore')
    restore(
        @Req() req,
        @Param('gameId') gameId: string,
        @Param('snapshotId') snapshotId: string,
    ) {
        return this.service.restore(
            gameId,
            snapshotId,
            req.user.id,
        );
    }
}
