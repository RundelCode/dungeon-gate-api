import {
    Injectable,
    Inject,
    ForbiddenException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { UpdateHpDto } from './dto/update-hp.dto';
import { randomUUID } from 'crypto';
import { GameGateway } from '../realtime/game.gateway';
import * as crypto from 'crypto';

@Injectable()
export class ActorsInGameService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
        private readonly realtime: GameGateway,
    ) { }

    private d20(): number {
        return Math.floor(Math.random() * 20) + 1;
    }

    private async checkConcentration(
        actor: any,
        damage: number,
        gameId: string,
    ) {
        if (!actor.base_character_id) return;

        const { data: character } = await this.supabase
            .from('characters')
            .select('con')
            .eq('id', actor.base_character_id)
            .single();

        if (!character) return;

        const conMod = Math.floor((character.con - 10) / 2);
        const roll = this.d20() + conMod;
        const dc = Math.max(10, Math.floor(damage / 2));

        if (roll >= dc) return;

        const resources = actor.resources_json ?? {};
        delete resources.concentration;

        await this.supabase
            .from('actors_in_game')
            .update({ resources_json: resources })
            .eq('id', actor.id);

        this.realtime.emitToGame(gameId, 'spell.concentration.broken', {
            actor_id: actor.id,
        });

        await this.supabase.from('game_logs').insert({
            id: crypto.randomUUID(),
            game_id: gameId,
            actor_in_game_id: actor.id,
            action_type: 'spell.concentration.broken',
            payload: {
                dc,
                roll,
            },
        });
    }

    private async assertMember(gameId: string, userId: string) {
        const { data } = await this.supabase
            .from('game_players')
            .select('id')
            .eq('game_id', gameId)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (!data) {
            throw new ForbiddenException('Not a member of this game');
        }
    }

    private async assertDm(gameId: string, userId: string) {
        const { data } = await this.supabase
            .from('game_players')
            .select('role')
            .eq('game_id', gameId)
            .eq('user_id', userId)
            .single();

        if (!data || data.role !== 'dm') {
            throw new ForbiddenException('Only DM can manage actors');
        }
    }

    async create(gameId: string, userId: string, dto: CreateActorDto) {
        await this.assertDm(gameId, userId);

        if (
            (!dto.base_character_id && !dto.base_monster_id) ||
            (dto.base_character_id && dto.base_monster_id)
        ) {
            throw new BadRequestException('Actor must reference either a character or a monster');
        }

        const actorId = randomUUID();

        await this.supabase.from('actors_in_game').insert({
            id: actorId,
            game_id: gameId,
            base_character_id: dto.base_character_id,
            base_monster_id: dto.base_monster_id,
            name_override: dto.name_override,
            current_hp: dto.current_hp,
            temp_hp: dto.temp_hp ?? 0,
            max_hp_override: dto.max_hp_override,
            death_saves_success: 0,
            death_saves_fail: 0,
            is_conscious: true,
            is_stable: true,
        });

        return this.findOne(actorId, userId);
    }

    async findAll(gameId: string, userId: string) {
        await this.assertMember(gameId, userId);

        const { data } = await this.supabase
            .from('actors_in_game')
            .select('*')
            .eq('game_id', gameId)
            .order('created_at');

        return data;
    }

    async findOne(actorId: string, userId: string) {
        const { data } = await this.supabase
            .from('actors_in_game')
            .select('*')
            .eq('id', actorId)
            .single();

        if (!data) {
            throw new NotFoundException('Actor not found');
        }

        await this.assertMember(data.game_id, userId);
        return data;
    }

    async update(actorId: string, userId: string, dto: UpdateActorDto) {
        const { data: actor } = await this.supabase
            .from('actors_in_game')
            .select('game_id')
            .eq('id', actorId)
            .single();

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        await this.assertDm(actor.game_id, userId);

        const { data } = await this.supabase
            .from('actors_in_game')
            .update({ ...dto, updated_at: new Date() })
            .eq('id', actorId)
            .select()
            .single();

        return data;
    }

    async updateHp(
        actorId: string,
        userId: string,
        dto: UpdateHpDto,
    ) {
        const { data: actor } = await this.supabase
            .from('actors_in_game')
            .select(`
                id,
                game_id,
                current_hp,
                temp_hp,
                resources_json,
                base_character_id,
                death_saves_success,
                death_saves_fail,
                is_conscious,
                is_stable
            `)
            .eq('id', actorId)
            .single();

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        await this.assertDm(actor.game_id, userId);

        let remainingDelta = dto.delta;
        let tempHp = actor.temp_hp;
        let hp = actor.current_hp;

        if (remainingDelta < 0 && tempHp > 0) {
            const absorbed = Math.min(tempHp, Math.abs(remainingDelta));
            tempHp -= absorbed;
            remainingDelta += absorbed;
        }

        hp += remainingDelta;
        if (hp < 0) hp = 0;

        let deathSuccess = actor.death_saves_success;
        let deathFail = actor.death_saves_fail;
        let isConscious = actor.is_conscious;
        let isStable = actor.is_stable;

        if (hp === 0 && actor.current_hp > 0) {
            isConscious = false;
            isStable = false;
        }

        if (hp === 0 && actor.current_hp === 0 && dto.delta < 0) {
            deathFail += 1;
        }

        if (hp > 0) {
            isConscious = true;
            isStable = true;
            deathSuccess = 0;
            deathFail = 0;
        }

        const { data: updated } = await this.supabase
            .from('actors_in_game')
            .update({
                current_hp: hp,
                temp_hp: tempHp,
                death_saves_success: deathSuccess,
                death_saves_fail: deathFail,
                is_conscious: isConscious,
                is_stable: isStable,
                updated_at: new Date(),
            })
            .eq('id', actorId)
            .select()
            .single();

        this.realtime.emitToGame(actor.game_id, 'actor.hp.updated', {
            actor_id: actorId,
            current_hp: updated.current_hp,
            temp_hp: updated.temp_hp,
            is_conscious: updated.is_conscious,
        });

        await this.supabase.from('game_logs').insert({
            id: crypto.randomUUID(),
            game_id: actor.game_id,
            actor_in_game_id: actorId,
            action_type: 'actor.hp.updated',
            payload: {
                delta: dto.delta,
                current_hp: updated.current_hp,
            },
        });

        if (dto.delta < 0 && actor.resources_json?.concentration) {
            await this.checkConcentration(actor, Math.abs(dto.delta), actor.game_id);
        }

        return updated;
    }

    async rollDeathSave(actorId: string, userId: string) {
        const { data: actor } = await this.supabase
            .from('actors_in_game')
            .select(`
                id,
                game_id,
                death_saves_success,
                death_saves_fail,
                is_conscious,
                is_stable
            `)
            .eq('id', actorId)
            .single();

        if (!actor || actor.is_conscious || actor.is_stable) {
            throw new BadRequestException('Actor does not need death saves');
        }

        await this.assertMember(actor.game_id, userId);

        const roll = this.d20();

        let success = actor.death_saves_success;
        let fail = actor.death_saves_fail;
        let isStable = actor.is_stable;

        if (roll === 20) {
            isStable = true;
            success = 3;
        } else if (roll === 1) {
            fail += 2;
        } else if (roll >= 10) {
            success += 1;
        } else {
            fail += 1;
        }

        const isDead = fail >= 3;

        await this.supabase
            .from('actors_in_game')
            .update({
                death_saves_success: success,
                death_saves_fail: fail,
                is_stable: isStable,
                is_conscious: false,
            })
            .eq('id', actorId);

        this.realtime.emitToGame(actor.game_id, 'actor.death.save', {
            actor_id: actorId,
            roll,
            success,
            fail,
            is_stable: isStable,
            is_dead: isDead,
        });

        await this.supabase.from('game_logs').insert({
            id: crypto.randomUUID(),
            game_id: actor.game_id,
            actor_in_game_id: actorId,
            action_type: 'death.save',
            payload: {
                roll,
                success,
                fail,
                is_stable: isStable,
                is_dead: isDead,
            },
        });

        return {
            roll,
            success,
            fail,
            is_stable: isStable,
            is_dead: isDead,
        };
    }
}
