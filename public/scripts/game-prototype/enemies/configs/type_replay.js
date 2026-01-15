// ============================================
// ENEMY CONFIG: Replay Attack
// Layer 5 - Session Enemy
// Request replay attack
// ============================================

export const type_replay = {
    id: 'type_replay',
    name: 'Replay Attack',
    layer: 5,

    // Stats
    health: 3,
    speed: 2.0,
    size: 36,
    points: 160,

    // Behavior
    behavior: 'zigzag',
    behaviorParams: {
        amplitude: 3,
        frequency: 3
    },

    // Visual
    visual: 'standard',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 10
};
