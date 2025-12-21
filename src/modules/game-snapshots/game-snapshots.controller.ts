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

@UseGuards(JwtAuthGuard)
@Controller('games/:gameId/snapshots')
export class GameSnapshotsController {
    constructor(
        private readonly service: GameSnapshotsService,
    ) { }

    @Post()
    createManual(
        @Req() req,
        @Param('gameId') gameId: string,
        @Body('label') label?: string,
    ) {
        return this.service.createManual(
            gameId,
            req.user.id,
            label ?? 'manual_snapshot',
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
