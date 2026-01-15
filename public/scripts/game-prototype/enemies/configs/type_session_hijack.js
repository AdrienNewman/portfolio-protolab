// ============================================
// ENEMY CONFIG: Session Hijacker
// Layer 5 - Session Enemy
// Session theft attack
// ============================================

export const type_session_hijack = {
    id: 'type_session_hijack',
    name: 'Session Hijacker',
    layer: 5,

    // Stats
    health: 2,
    speed: 2.5,
    size: 34,
    points: 140,

    // Behavior
    behavior: 'teleport',
    behaviorParams: {
        teleportChance: 0.01,
        cooldownFrames: 60
    },

    // Visual
    visual: 'standard',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 8
};
