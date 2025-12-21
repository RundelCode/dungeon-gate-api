import { Injectable } from '@nestjs/common';
import { SavingThrowDto } from './dto/saving-throw.dto';

@Injectable()
export class SavingThrowsService {
    rollSavingThrow(dto: SavingThrowDto) {
        const rollMode = dto.roll_mode ?? 'normal';

        const roll =
            rollMode === 'advantage'
                ? Math.max(this.d20(), this.d20())
                : rollMode === 'disadvantage'
                    ? Math.min(this.d20(), this.d20())
                    : this.d20();

        const modifier = dto.modifier ?? 0;
        const total = roll + modifier;

        return {
            roll,
            modifier,
            total,
            dc: dto.dc,
            success: total >= dto.dc,
            ability: dto.ability ?? null,
        };
    }

    private d20(): number {
        return Math.floor(Math.random() * 20) + 1;
    }
}
