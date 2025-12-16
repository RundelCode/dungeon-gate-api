import { Module } from '@nestjs/common';
import { CombatsController } from './combats.controller';
import { CombatsService } from './combats.service';

@Module({
  controllers: [CombatsController],
  providers: [CombatsService]
})
export class CombatsModule {}
