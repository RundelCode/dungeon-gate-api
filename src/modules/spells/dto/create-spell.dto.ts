import {
    IsString,
    IsInt,
    IsOptional,
    IsBoolean,
} from 'class-validator';

export class CreateSpellDto {
    @IsString()
    name: string;

    @IsInt()
    level: number; // 0 = cantrip

    @IsOptional()
    @IsString()
    school?: string;

    @IsOptional()
    @IsString()
    casting_time?: string;

    @IsOptional()
    @IsString()
    range?: string;

    @IsOptional()
    @IsString()
    components?: string;

    @IsOptional()
    @IsString()
    duration?: string;

    @IsOptional()
    @IsBoolean()
    is_concentration?: boolean;

    @IsOptional()
    @IsBoolean()
    is_ritual?: boolean;

    @IsOptional()
    @IsString()
    attack_type?: string;

    @IsOptional()
    @IsString()
    save_ability?: string;

    @IsOptional()
    @IsString()
    damage_formula?: string;

    @IsOptional()
    @IsString()
    damage_type?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    source: string; // SRD | Homebrew
}
