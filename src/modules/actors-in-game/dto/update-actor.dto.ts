import {
    IsOptional,
    IsString,
    IsInt,
    IsBoolean,
} from 'class-validator';

export class UpdateActorDto {
    @IsOptional()
    @IsString()
    name_override?: string;

    @IsOptional()
    @IsInt()
    current_hp?: number;

    @IsOptional()
    @IsInt()
    temp_hp?: number;

    @IsOptional()
    @IsBoolean()
    is_conscious?: boolean;

    @IsOptional()
    @IsBoolean()
    is_stable?: boolean;
}
