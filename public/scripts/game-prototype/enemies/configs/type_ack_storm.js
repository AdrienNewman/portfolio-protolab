// ============================================
// ENEMY CONFIG: ACK Storm
// Layer 4 - Transport Enemy
// TCP ACK storm attack
// ============================================

export const type_ack_storm = {
    id: 'type_ack_storm',
    name: 'ACK Storm',
    layer: 4,

    // Stats
    health: 4,
    speed: 2.0,
    size: 40,
    points: 220,

    // Behavior
    behavior: 'wave',
    behaviorParams: {
        speedMultiplier: 0.8,
        waveAmplitude: 4,
        waveFrequency: 2
    },

    // Visual
    visual: 'standard',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 7
};
