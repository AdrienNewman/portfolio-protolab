// ============================================
// PROJECTILE CONFIG: Homing
// Target-seeking missile projectile
// ============================================

export const type_homing = {
    id: 'type_homing',
    name: 'Homing Missile',
    description: 'Missile à tête chercheuse',

    // Visual
    visual: 'homing',
    hasTrail: true,
    trailLength: 4,
    hasGlow: true,

    // Default values
    defaultSize: 14,
    defaultDamage: 15,
    defaultLifetime: 12000,

    // Physics
    physics: 'homing',
    defaultHomingStrength: 0.1,
    maxSpeed: 8,

    // Rendering
    renderStyle: 'triangle',
    rotateToDirection: true,
    edgeGlow: true,
    edgeAlpha: 0.5
};
