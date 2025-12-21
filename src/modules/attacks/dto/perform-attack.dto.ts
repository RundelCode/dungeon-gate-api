import { IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class PerformAttackDto {
    @IsUUID()
    attacker_actor_id: string;

    @IsUUID()
    target_actor_id: string;

    @IsUUID()
    attack_id: string;

    @IsOptional()
    @IsBoolean()
    advantage?: boolean;

    @IsOptional()
    @IsBoolean()
    disadvantage?: boolean;
}
