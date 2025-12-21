export type GameEvent =
    | {
        type: 'attack.resolved';
        payload: any;
    }
    | {
        type: 'spell.cast.resolved';
        payload: any;
    }
    | {
        type: 'actor.hp.updated';
        payload: any;
    }
    | {
        type: 'condition.applied';
        payload: any;
    }
    | {
        type: 'condition.removed';
        payload: any;
    }
    | {
        type: 'combat.turn.changed';
        payload: any;
    }
    | {
        type: 'combat.round.changed';
        payload: any;
    }
    | {
        type: 'snapshot.created';
        payload: any;
    }
    | {
        type: 'generic';
        payload: any;
    };
