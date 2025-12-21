import { IsUUID } from 'class-validator';

export class StartCombatDto {
    @IsUUID()
    scene_id: string;
}
