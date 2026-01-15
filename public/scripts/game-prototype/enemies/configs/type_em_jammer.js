// ============================================
// ENEMY CONFIG: EM Jammer
// Layer 1 - Physical Enemy
// Electromagnetic interference
// ============================================

export const type_em_jammer = {
    id: 'type_em_jammer',
    name: 'EM Jammer',
    layer: 1,

    // Stats
    health: 6,
    speed: 1.2,
    size: 55,
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
