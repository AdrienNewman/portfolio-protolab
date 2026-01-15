// ============================================
// PROJECTILE CONFIG: Default
// Basic circular projectile with glow
// ============================================

export const type_default = {
    id: 'type_default',
    name: 'Default',
    description: 'Projectile circulaire basique avec noyau lumineux',

    // Visual
    visual: 'default',
    hasTrail: true,
    trailLength: 4,
    hasGlow: true,

    // Default values
    defaultSize: 12,
    defaultDamage: 10,
    defaultLifetime: 10000,

    // Rendering
    renderStyle: 'circle',
    innerCore: true,
    coreAlpha: 0.6
};
