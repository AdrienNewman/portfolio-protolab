// ============================================
// ENEMY CONFIG: Zip Bomb
// Layer 6 - Presentation Enemy
// Heavy compression bomb
// ============================================

export const type_zip_bomb = {
    id: 'type_zip_bomb',
    name: 'Zip Bomb',
    layer: 6,

    // Stats
    health: 6,
    speed: 1.2,
    size: 50,
    points: 350,

    // Behavior
    behavior: 'heavy',
    behaviorParams: {
        speedMultiplier: 0.8,
        waveAmplitude: 1.5
    },

    // Visual
    visual: 'tank',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 4
};
