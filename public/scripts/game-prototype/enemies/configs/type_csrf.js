// ============================================
// ENEMY CONFIG: CSRF Bot
// Layer 7 - Application Enemy
// Cross-Site Request Forgery
// ============================================

export const type_csrf = {
    id: 'type_csrf',
    name: 'CSRF Bot',
    layer: 7,

    // Stats
    health: 1,
    speed: 2.2,
    size: 30,
    points: 90,

    // Behavior
    behavior: 'diagonal',
    behaviorParams: {
        speedMultiplier: 0.8,
        bounceMargin: 50
    },

    // Visual
    visual: 'standard',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 10
};
