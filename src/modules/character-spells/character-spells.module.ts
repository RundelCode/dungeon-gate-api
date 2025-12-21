import { Module } from '@nestjs/common';
import { CharacterSpellsService } from './character-spells.service';
import { CharacterSpellsController } from './character-spells.controller';

@Module({
  controllers: [CharacterSpellsController],
  providers: [CharacterSpellsService],
})
export class CharacterSpellsModule { }
