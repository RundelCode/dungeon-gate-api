import { Module } from '@nestjs/common';
import { GameLogsController } from './game-logs.controller';
import { GameLogsService } from './game-logs.service';

@Module({
  controllers: [GameLogsController],
  providers: [GameLogsService]
})
export class GameLogsModule {}
