import {
    IsUUID,
    IsInt,
    IsOptional,
    IsBoolean,
    Min,
} from 'class-validator';

export class AddSpellDto {
    @IsUUID()
    spell_id: string;

    @IsInt()
    @Min(0)
    spell_level: number; // 0 = cantrip

    @IsOptional()
    @IsBoolean()
    is_prepared?: boolean;

    @IsOptional()
    source?: string; // class | feat | item
}
