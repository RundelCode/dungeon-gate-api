import { Module } from '@nestjs/common';
import { CharacterItemsService } from './character-items.service';
import { CharacterItemsController } from './character-items.controller';

@Module({
  controllers: [CharacterItemsController],
  providers: [CharacterItemsService],
})
export class CharacterItemsModule { }
