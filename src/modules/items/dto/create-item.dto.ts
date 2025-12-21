import {
    IsString,
    IsOptional,
    IsNumber,
} from 'class-validator';

export class CreateItemDto {
    @IsString()
    name: string;

    @IsString()
    type: string; // weapon | armor | gear | consumable | magic

    @IsOptional()
    @IsString()
    rarity?: string;

    @IsOptional()
    @IsNumber()
    weight?: number;

    @IsOptional()
    @IsString()
    cost?: string;

    @IsOptional()
    @IsString()
    damage_formula?: string;

    @IsOptional()
    @IsString()
    damage_type?: string;

    @IsOptional()
    properties?: any;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    source: string; // SRD | Homebrew
}
