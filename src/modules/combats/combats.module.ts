import { Module } from '@nestjs/common';
import { CombatService } from './combats.service';
import { CombatController } from './combats.controller';

@Module({
  controllers: [CombatController],
  providers: [CombatService],
})
export class CombatsModule { }
