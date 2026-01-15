// ============================================
// ENEMY CONFIG: Smurf Attack
// Layer 3 - Network Enemy
// ICMP broadcast amplification
// ============================================

export const type_smurf = {
    id: 'type_smurf',
    name: 'Smurf Attack',
    layer: 3,

    // Stats
    health: 1,
    speed: 4.2,
    size: 24,
    points: 100,

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
