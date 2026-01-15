// ============================================
// ENEMY CONFIG: Homograph
// Layer 6 - Presentation Enemy
// IDN homograph attack (lookalike domains)
// ============================================

export const type_homograph = {
    id: 'type_homograph',
    name: 'Homograph',
    layer: 6,

    // Stats
    health: 1,
    speed: 3.2,
    size: 26,
    points: 100,

    // Behavior
    behavior: 'fast',
    behaviorParams: {
        speedMultiplier: 1.2
    },

    // Visual
    visual: 'standard',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 12
};
