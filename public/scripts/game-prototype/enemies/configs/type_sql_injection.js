// ============================================
// ENEMY CONFIG: SQL Injection
// Layer 7 - Application Enemy
// Classic web attack pattern
// ============================================

export const type_sql_injection = {
    id: 'type_sql_injection',
    name: 'SQL Injection',
    layer: 7,

    // Stats
    health: 2,
    speed: 2.0,
    size: 35,
    points: 100,

    // Behavior
    behavior: 'zigzag',
    behaviorParams: {
        amplitude: 3,
        frequency: 3
    },

    // Visual
    visual: 'standard',
    color: null,         // null = inherit from layer
    glowColor: null,

    // Spawn weight (higher = more common)
    spawnWeight: 10
};
