import {
    IsOptional,
    IsInt,
    IsBoolean,
    Min,
} from 'class-validator';

export class UpdateCharacterItemDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    quantity?: number;

    @IsOptional()
    @IsBoolean()
    is_equipped?: boolean;

    @IsOptional()
    slot?: string;
}
