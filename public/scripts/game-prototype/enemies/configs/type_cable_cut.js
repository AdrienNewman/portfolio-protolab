// ============================================
// ENEMY CONFIG: Cable Cutter
// Layer 1 - Physical Enemy
// Physical cable severing
// ============================================

export const type_cable_cut = {
    id: 'type_cable_cut',
    name: 'Cable Cutter',
    layer: 1,

    // Stats
    health: 5,
    speed: 1.5,
    size: 48,
    points: 250,

    // Behavior
    behavior: 'slow_tank',
    behaviorParams: {
        speedMultiplier: 0.7
    },

    // Visual
    visual: 'tank',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 6
};
