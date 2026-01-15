// ============================================
// ENEMY CONFIG: Wiretapper
// Layer 1 - Physical Enemy
// Physical line tapping
// ============================================

export const type_wiretap = {
    id: 'type_wiretap',
    name: 'Wiretapper',
    layer: 1,

    // Stats
    health: 4,
    speed: 2.0,
    size: 42,
    points: 200,

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
    spawnWeight: 8
};
