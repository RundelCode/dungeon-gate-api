import {
    IsString,
    IsInt,
    IsOptional,
    IsBoolean,
    IsUUID,
} from 'class-validator';

export class CreateCharacterDto {
    @IsString()
    name: string;

    @IsInt()
    level: number;

    @IsUUID()
    class_id: string;

    @IsUUID()
    race_id: string;

    @IsUUID()
    background_id: string;

    @IsOptional()
    @IsString()
    alignment?: string;

    @IsOptional()
    @IsInt()
    experience?: number;

    @IsInt() str: number;
    @IsInt() dex: number;
    @IsInt() con: number;
    @IsInt() int_: number;
    @IsInt() wis: number;
    @IsInt() cha: number;

    @IsInt()
    proficiency_bonus: number;

    @IsInt()
    max_hp: number;

    @IsInt()
    armor_class: number;

    @IsInt()
    speed: number;

    @IsOptional()
    @IsString()
    hit_dice?: string;

    @IsOptional()
    @IsInt()
    passive_perception?: number;

    @IsOptional()
    @IsString()
    senses?: string;

    @IsOptional()
    @IsString()
    languages?: string;

    @IsOptional()
    saving_throw_proficiencies?: string;

    @IsOptional()
    skills_proficiencies?: any;

    @IsOptional()
    @IsString()
    spellcasting_ability?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsBoolean()
    is_npc?: boolean;
}
