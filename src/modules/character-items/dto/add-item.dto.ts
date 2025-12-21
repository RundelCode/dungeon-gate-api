import {
    IsUUID,
    IsInt,
    IsOptional,
    IsBoolean,
    Min,
} from 'class-validator';

export class AddItemDto {
    @IsUUID()
    item_id: string;

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
