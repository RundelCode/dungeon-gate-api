export type RollMode = 'normal' | 'advantage' | 'disadvantage';

export function resolveRollMode(
    advantage?: boolean,
    disadvantage?: boolean,
): RollMode {
    if (advantage && !disadvantage) return 'advantage';
    if (disadvantage && !advantage) return 'disadvantage';
    return 'normal';
}

export function rollD20(mode: RollMode = 'normal') {
    const r1 = Math.floor(Math.random() * 20) + 1;
    if (mode === 'normal') return r1;

    const r2 = Math.floor(Math.random() * 20) + 1;
    return mode === 'advantage'
        ? Math.max(r1, r2)
        : Math.min(r1, r2);
}

export function rollDamage(formula: string): number {
    const parts = formula.match(/(\d+)d(\d+)(\s*\+\s*\d+)?/);
    if (!parts) return 0;

    const rolls = Number(parts[1]);
    const die = Number(parts[2]);
    const bonus = parts[3] ? Number(parts[3].replace('+', '')) : 0;

    let total = bonus;
    for (let i = 0; i < rolls; i++) {
        total += Math.floor(Math.random() * die) + 1;
    }

    return total;
}
