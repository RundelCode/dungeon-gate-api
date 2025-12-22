import { Module, Global } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { RealtimeService } from './realtime.service';

@Global()
@Module({
  providers: [RealtimeService, GameGateway],
  exports: [RealtimeService],
})
export class RealtimeModule {}
