import { IsUUID, IsArray, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CastSpellDto {
    @IsUUID()
    spell_id: string;

    @IsUUID()
    caster_actor_id: string;

    @IsArray()
    @IsUUID('all', { each: true })
    target_actor_ids: string[];

    @IsInt()
    spell_level: number;

    @IsOptional()
    @IsBoolean()
    advantage?: boolean;

    @IsOptional()
    @IsBoolean()
    disadvantage?: boolean;
}
