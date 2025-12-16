import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateSceneDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    background_image_url?: string;

    @IsOptional()
    @IsBoolean()
    is_battle_scene?: boolean;
}
