import { IsUUID, IsOptional, IsInt } from 'class-validator';

export class ApplyConditionDto {
    @IsUUID()
    actor_in_game_id: string;

    @IsUUID()
    condition_id: string;

    @IsOptional()
    @IsInt()
    duration_rounds?: number;
}
