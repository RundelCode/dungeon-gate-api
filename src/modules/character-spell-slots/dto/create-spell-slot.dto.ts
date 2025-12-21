import {
    IsInt,
    Min,
} from 'class-validator';

export class CreateSpellSlotDto {
    @IsInt()
    @Min(0)
    spell_level: number;

    @IsInt()
    @Min(0)
    slots_max: number;

    @IsInt()
    @Min(0)
    slots_used: number;
}
