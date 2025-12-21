import {
    IsOptional,
    IsBoolean,
} from 'class-validator';

export class UpdateCharacterSpellDto {
    @IsOptional()
    @IsBoolean()
    is_prepared?: boolean;
}
