import {
    IsOptional,
    IsString,
    IsBoolean,
    IsNumber,
} from 'class-validator';

export class UpdateTokenDto {
    @IsOptional()
    @IsString()
    label?: string;

    @IsOptional()
    @IsString()
    icon_url?: string;

    @IsOptional()
    @IsNumber()
    x?: number;

    @IsOptional()
    @IsNumber()
    y?: number;

    @IsOptional()
    @IsNumber()
    z_index?: number;

    @IsOptional()
    @IsBoolean()
    is_visible_to_players?: boolean;
}
