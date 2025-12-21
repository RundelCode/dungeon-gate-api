import { Injectable } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameEvent } from './dto/game-event.dto';

@Injectable()
export class RealtimeEventsService {
    constructor(
        private readonly gateway: GameGateway,
    ) { }

    emit(gameId: string, event: GameEvent) {
        this.gateway.emitToGame(gameId, event.type, event.payload);
    }

    emitMany(gameId: string, events: GameEvent[]) {
        for (const event of events) {
            this.emit(gameId, event);
        }
    }

    emitActionFrame(
        gameId: string,
        action: string,
        payload: any,
    ) {
        this.emit(gameId, {
            type: 'generic',
            payload: {
                action,
                ...payload,
            },
        });
    }
}
