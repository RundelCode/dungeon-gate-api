import { Module } from '@nestjs/common';
import { CombatParticipantsController } from './combat-participants.controller';
import { CombatParticipantsService } from './combat-participants.service';

@Module({
  controllers: [CombatParticipantsController],
  providers: [CombatParticipantsService]
})
export class CombatParticipantsModule {}
