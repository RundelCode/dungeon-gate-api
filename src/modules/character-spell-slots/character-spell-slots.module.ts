import { Module } from '@nestjs/common';
import { CharacterSpellSlotsService } from './character-spell-slots.service';
import { CharacterSpellSlotsController } from './character-spell-slots.controller';

@Module({
  controllers: [CharacterSpellSlotsController],
  providers: [CharacterSpellSlotsService],
})
export class CharacterSpellSlotsModule { }
