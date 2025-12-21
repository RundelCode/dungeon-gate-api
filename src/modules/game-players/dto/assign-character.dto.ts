import { IsUUID } from 'class-validator';

export class AssignCharacterDto {
    @IsUUID()
    character_id: string;
}
