// ============================================
// ENEMY CONFIG: SYN Flood
// Layer 4 - Transport Enemy
// TCP SYN flood swarm attack
// ============================================

export const type_syn_flood = {
    id: 'type_syn_flood',
    name: 'SYN Flood',
    layer: 4,

    // Stats
    health: 1,
    speed: 4.0,
    size: 22,
    points: 60,

    // Behavior
    behavior: 'swarm',
    behaviorParams: {
        waveAmplitude: 2,
        waveFrequency: 5
    },

    // Visual
    visual: 'swarm',
    color: null,
    glowColor: null,

    // Spawn weight (high for swarm effect)
    spawnWeight: 15
};
