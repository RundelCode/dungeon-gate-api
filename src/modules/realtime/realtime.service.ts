import { Injectable } from '@nestjs/common';
import { GameGateway } from './game.gateway';

@Injectable()
export class RealtimeService {
    constructor(
        private readonly gateway: GameGateway,
    ) { }

    emit(gameId: string, event: string, payload: any) {
        this.gateway.emitToGame(gameId, event, payload);
    }

    combatStarted(gameId: string, payload: any) {
        this.emit(gameId, 'combat.started', payload);
    }

    combatTurnChanged(gameId: string, payload: any) {
        this.emit(gameId, 'combat.turn.changed', payload);
    }

    combatRoundChanged(gameId: string, payload: any) {
        this.emit(gameId, 'combat.round.changed', payload);
    }

    attackResolved(gameId: string, payload: any) {
        this.emit(gameId, 'attack.resolved', payload);
    }

    spellResolved(gameId: string, payload: any) {
        this.emit(gameId, 'spell.resolved', payload);
    }

    actorUpdated(gameId: string, payload: any) {
        this.emit(gameId, 'actor.updated', payload);
    }

    conditionApplied(gameId: string, payload: any) {
        this.emit(gameId, 'condition.applied', payload);
    }

    conditionRemoved(gameId: string, payload: any) {
        this.emit(gameId, 'condition.removed', payload);
    }

    tokenMoved(gameId: string, payload: any) {
        this.emit(gameId, 'token.moved', payload);
    }
}
