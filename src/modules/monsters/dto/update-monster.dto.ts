import {
    IsOptional,
    IsString,
    IsInt,
    IsNumber,
} from 'class-validator';

export class UpdateMonsterDto {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsString() size?: string;
    @IsOptional() @IsString() type?: string;
    @IsOptional() @IsString() subtype?: string;

    @IsOptional() @IsInt() max_hp?: number;
    @IsOptional() @IsInt() armor_class?: number;
    @IsOptional() @IsInt() speed?: number;

    @IsOptional() @IsInt() str?: number;
    @IsOptional() @IsInt() dex?: number;
    @IsOptional() @IsInt() con?: number;
    @IsOptional() @IsInt() int_?: number;
    @IsOptional() @IsInt() wis?: number;
    @IsOptional() @IsInt() cha?: number;

    @IsOptional() @IsNumber() challenge_rating?: number;
    @IsOptional() abilities_json?: any;
}
