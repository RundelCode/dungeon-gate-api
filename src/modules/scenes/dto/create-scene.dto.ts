import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateSceneDto {
    @IsString()
    name: string;

    @IsString()
    scene_type: string; // exploration | battle | roleplay

    @IsOptional()
    @IsBoolean()
    is_battle_scene?: boolean;
}
