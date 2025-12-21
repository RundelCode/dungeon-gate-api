import { IsOptional, IsString } from 'class-validator';

export class SpawnCharacterActorDto {
    @IsOptional()
    @IsString()
    name_override?: string;
}
