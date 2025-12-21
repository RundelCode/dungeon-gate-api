import { Module } from '@nestjs/common';
import { SavingThrowsService } from './saving-throws.service';

@Module({
    providers: [SavingThrowsService],
    exports: [SavingThrowsService],
})
export class SavingThrowsModule { }
