import { IsUUID } from 'class-validator';

export class RemoveConditionDto {
    @IsUUID()
    actor_condition_id: string;
}
