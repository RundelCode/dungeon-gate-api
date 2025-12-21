import { Module } from '@nestjs/common';
import { AttacksService } from './attacks.service';
import { AttacksController } from './attacks.controller';
import { CombatsModule } from '../combats/combats.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
    imports: [CombatsModule, RealtimeModule],
    controllers: [AttacksController],
    providers: [AttacksService],
})
export class AttacksModule { }
