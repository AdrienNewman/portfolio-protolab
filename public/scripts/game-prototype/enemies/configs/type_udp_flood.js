// ============================================
// ENEMY CONFIG: UDP Flood
// Layer 4 - Transport Enemy
// UDP flood swarm attack
// ============================================

export const type_udp_flood = {
    id: 'type_udp_flood',
    name: 'UDP Flood',
    layer: 4,

    // Stats
    health: 1,
    speed: 3.8,
    size: 24,
    points: 70,

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

    // Spawn weight
    spawnWeight: 14
};
