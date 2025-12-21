import { IsUUID, IsInt } from 'class-validator';

export class AddParticipantDto {
    @IsUUID()
    actor_in_game_id: string;

    @IsInt()
    initiative: number;
}
