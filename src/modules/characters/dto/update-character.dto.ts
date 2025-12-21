import {
    IsOptional,
    IsString,
    IsInt,
    IsBoolean,
} from 'class-validator';

export class UpdateCharacterDto {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsInt() level?: number;
    @IsOptional() @IsString() alignment?: string;
    @IsOptional() @IsInt() experience?: number;

    @IsOptional() @IsInt() str?: number;
    @IsOptional() @IsInt() dex?: number;
    @IsOptional() @IsInt() con?: number;
    @IsOptional() @IsInt() int_?: number;
    @IsOptional() @IsInt() wis?: number;
    @IsOptional() @IsInt() cha?: number;

    @IsOptional() @IsInt() proficiency_bonus?: number;
    @IsOptional() @IsInt() max_hp?: number;
    @IsOptional() @IsInt() armor_class?: number;
    @IsOptional() @IsInt() speed?: number;

    @IsOptional() @IsString() hit_dice?: string;
    @IsOptional() @IsInt() passive_perception?: number;
    @IsOptional() @IsString() senses?: string;
    @IsOptional() @IsString() languages?: string;

    @IsOptional() saving_throw_proficiencies?: string;
    @IsOptional() skills_proficiencies?: any;

    @IsOptional() @IsString() spellcasting_ability?: string;
    @IsOptional() @IsString() notes?: string;

    @IsOptional() @IsBoolean() is_npc?: boolean;
}
