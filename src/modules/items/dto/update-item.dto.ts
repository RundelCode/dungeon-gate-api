import {
    IsOptional,
    IsString,
    IsNumber,
} from 'class-validator';

export class UpdateItemDto {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsString() type?: string;
    @IsOptional() @IsString() rarity?: string;
    @IsOptional() @IsNumber() weight?: number;
    @IsOptional() @IsString() cost?: string;
    @IsOptional() @IsString() damage_formula?: string;
    @IsOptional() @IsString() damage_type?: string;
    @IsOptional() properties?: any;
    @IsOptional() @IsString() description?: string;
}
