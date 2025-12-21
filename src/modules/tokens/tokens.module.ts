import { Module } from '@nestjs/common';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  controllers: [TokensController],
  providers: [TokensService],
  imports: [RealtimeModule],
})
export class TokensModule {}
