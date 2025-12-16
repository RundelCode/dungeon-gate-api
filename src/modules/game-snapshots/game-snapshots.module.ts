import { Module } from '@nestjs/common';
import { GameSnapshotsController } from './game-snapshots.controller';
import { GameSnapshotsService } from './game-snapshots.service';

@Module({
  controllers: [GameSnapshotsController],
  providers: [GameSnapshotsService]
})
export class GameSnapshotsModule {}
