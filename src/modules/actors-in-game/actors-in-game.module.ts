import { Module } from '@nestjs/common';
import { ActorsInGameController } from './actors-in-game.controller';
import { ActorsInGameService } from './actors-in-game.service';

@Module({
  controllers: [ActorsInGameController],
  providers: [ActorsInGameService]
})
export class ActorsInGameModule {}
