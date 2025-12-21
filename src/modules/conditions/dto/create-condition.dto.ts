import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateConditionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    @IsNotEmpty()
    source: string; // PHB, DMG, Homebrew
}
