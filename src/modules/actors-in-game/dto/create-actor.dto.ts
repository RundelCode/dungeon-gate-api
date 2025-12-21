import {
    IsOptional,
    IsString,
    IsUUID,
    IsInt,
    Min,
} from 'class-validator';

export class CreateActorDto {
    @IsOptional()
    @IsUUID()
    base_character_id?: string;

    @IsOptional()
    @IsUUID()
    base_monster_id?: string;

    @IsOptional()
    @IsString()
    name_override?: string;

    @IsInt()
    @Min(1)
    current_hp: number;

    @IsOptional()
    @IsInt()
    temp_hp?: number;

    @IsOptional()
    @IsInt()
    max_hp_override?: number;
}
