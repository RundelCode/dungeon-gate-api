import {
    IsOptional,
    IsInt,
    Min,
} from 'class-validator';

export class UpdateSpellSlotDto {
    @IsOptional()
    @IsInt()
    @Min(0)
    slots_max?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    slots_used?: number;
}
