import { Module } from '@nestjs/common';
import { SpellCastingService } from './spell-casting.service';
import { SpellCastingController } from './spell-casting.controller';
import { CombatsModule } from '../combats/combats.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { SavingThrowsModule } from '../saving-throws/saving-throws.module';

@Module({
  imports: [
    CombatsModule,
    RealtimeModule,
    SavingThrowsModule,
  ],
  controllers: [SpellCastingController],
  providers: [SpellCastingService],
})
export class SpellCastingModule { } 
