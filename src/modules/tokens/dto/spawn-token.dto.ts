import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class SpawnTokenDto {
    @IsNumber()
    x: number;

    @IsNumber()
    y: number;

    @IsOptional()
    @IsString()
    icon_url?: string;

    @IsOptional()
    @IsBoolean()
    is_visible_to_players?: boolean;
}
