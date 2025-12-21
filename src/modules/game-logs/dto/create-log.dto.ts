import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateGameLogDto {
    @IsUUID()
    game_id: string;

    @IsString()
    action_type: string;

    payload: any;

    @IsOptional()
    @IsUUID()
    scene_id?: string;

    @IsOptional()
    @IsUUID()
    actor_in_game_id?: string;
}
