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
import { CombatService } from '../combats/combats.service';

@Injectable()
export class ActorsInGameService {
    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
        private readonly realtime: GameGateway,
        private readonly combatsService: CombatService,
    ) { }

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
            throw new BadRequestException(
                'Actor must reference either a character or a monster',
            );
        }

        const actorId = randomUUID();

        const { error } = await this.supabase
            .from('actors_in_game')
            .insert({
                id: actorId,
                game_id: gameId,
                base_character_id: dto.base_character_id,
                base_monster_id: dto.base_monster_id,
                name_override: dto.name_override,
                current_hp: dto.current_hp,
                temp_hp: dto.temp_hp ?? 0,
                max_hp_override: dto.max_hp_override,
            });

        if (error) throw error;

        return this.findOne(actorId, userId);
    }

    async findAll(gameId: string, userId: string) {
        await this.assertMember(gameId, userId);

        const { data, error } = await this.supabase
            .from('actors_in_game')
            .select('*')
            .eq('game_id', gameId)
            .order('created_at');

        if (error) throw error;
        return data;
    }

    async findOne(actorId: string, userId: string) {
        const { data, error } = await this.supabase
            .from('actors_in_game')
            .select('*')
            .eq('id', actorId)
            .single();

        if (error || !data) {
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

        if (!actor) throw new NotFoundException('Actor not found');

        await this.assertDm(actor.game_id, userId);

        const { data, error } = await this.supabase
            .from('actors_in_game')
            .update({
                ...dto,
                updated_at: new Date(),
            })
            .eq('id', actorId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async remove(actorId: string, userId: string) {
        const { data: actor } = await this.supabase
            .from('actors_in_game')
            .select('game_id')
            .eq('id', actorId)
            .single();

        if (!actor) throw new NotFoundException('Actor not found');

        await this.assertDm(actor.game_id, userId);

        const { error } = await this.supabase
            .from('actors_in_game')
            .delete()
            .eq('id', actorId);

        if (error) throw error;

        return { success: true };
    }

    async spawnFromCharacter(
        gameId: string,
        characterId: string,
        userId: string,
        nameOverride?: string,
    ) {
        await this.assertDm(gameId, userId);

        const { data: character } = await this.supabase
            .from('characters')
            .select('*')
            .eq('id', characterId)
            .single();

        if (!character) {
            throw new NotFoundException('Character not found');
        }

        const actorId = randomUUID();

        const { error } = await this.supabase
            .from('actors_in_game')
            .insert({
                id: actorId,
                game_id: gameId,
                base_character_id: character.id,
                name_override: nameOverride ?? character.name,
                current_hp: character.max_hp,
                temp_hp: 0,
                max_hp_override: character.max_hp,
                resources_json: {},
                death_saves_success: 0,
                death_saves_fail: 0,
                is_conscious: true,
                is_stable: true,
            });

        if (error) throw error;

        return this.findOne(actorId, userId);
    }

    async updateHp(
        actorId: string,
        userId: string,
        dto: UpdateHpDto,
    ) {
        const { data: actor } = await this.supabase
            .from('actors_in_game')
            .select('id, game_id, current_hp, temp_hp')
            .eq('id', actorId)
            .single();

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        await this.combatsService.assertCanAct(
            actor.game_id,
            userId,
        );

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

        const { data: updated } = await this.supabase
            .from('actors_in_game')
            .update({
                current_hp: hp,
                temp_hp: tempHp,
                updated_at: new Date(),
            })
            .eq('id', actorId)
            .select()
            .single();

        this.realtime.emitToGame(actor.game_id, 'actor.hp.updated', {
            actor_id: actorId,
            game_id: actor.game_id,
            current_hp: updated.current_hp,
            temp_hp: updated.temp_hp,
            delta: dto.delta,
        });

        await this.supabase.from('game_logs').insert({
            id: crypto.randomUUID(),
            game_id: actor.game_id,
            actor_in_game_id: actorId,
            action_type: 'actor.hp.updated',
            payload: {
                before: {
                    current_hp: actor.current_hp,
                    temp_hp: actor.temp_hp,
                },
                after: {
                    current_hp: updated.current_hp,
                    temp_hp: updated.temp_hp,
                },
                delta: dto.delta,
            },
        });

        return updated;
    }
}
