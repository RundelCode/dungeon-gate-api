import { Module } from '@nestjs/common';
import { GamePlayersController } from './game-players.controller';
import { GamePlayersService } from './game-players.service';

@Module({
  controllers: [GamePlayersController],
  providers: [GamePlayersService]
})
export class GamePlayersModule {}
