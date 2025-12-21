import { Module } from '@nestjs/common';
import { ActorConditionsService } from './actor-conditions.service';
import { ActorConditionsController } from './actor-conditions.controller';
import { CombatsModule } from '../combats/combats.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
    imports: [CombatsModule, RealtimeModule],
    controllers: [ActorConditionsController],
    providers: [ActorConditionsService],
})
export class ActorConditionsModule { }
