import { Module } from '@nestjs/common';
import { SpellCastingController } from './spell-casting.controller';
import { SpellCastingService } from './spell-casting.service';

@Module({
  controllers: [SpellCastingController],
  providers: [SpellCastingService]
})
export class SpellCastingModule {}
