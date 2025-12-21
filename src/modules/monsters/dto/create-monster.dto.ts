import {
    IsString,
    IsInt,
    IsOptional,
    IsNumber,
} from 'class-validator';

export class CreateMonsterDto {
    @IsString()
    name: string;

    @IsString()
    source: string; // SRD | Homebrew

    @IsOptional()
    @IsString()
    size?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    subtype?: string;

    @IsInt()
    max_hp: number;

    @IsInt()
    armor_class: number;

    @IsInt()
    speed: number;

    @IsInt() str: number;
    @IsInt() dex: number;
    @IsInt() con: number;
    @IsInt() int_: number;
    @IsInt() wis: number;
    @IsInt() cha: number;

    @IsOptional()
    @IsNumber()
    challenge_rating?: number;

    @IsOptional()
    abilities_json?: any;
}
