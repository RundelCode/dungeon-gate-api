import { IsUUID, IsInt, IsOptional } from 'class-validator';

export class CastSpellDto {
    @IsUUID()
    spell_id: string;

    @IsUUID()
    caster_actor_id: string;

    @IsUUID()
    target_actor_id: string;

    @IsInt()
    spell_level: number;

    @IsOptional()
    @IsInt()
    forced_damage?: number;
}
