import { Module } from '@nestjs/common';
import { CombatService } from './combats.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { CombatController } from './combats.controller';

@Module({
    imports: [RealtimeModule],
    controllers: [CombatController],
    providers: [CombatService],
    exports: [CombatService],
})
export class CombatsModule {}
