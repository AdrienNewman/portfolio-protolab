// ============================================
// PROJECTILE CONFIG: Rain
// Teardrop shaped raindrop projectile
// ============================================

export const type_rain = {
    id: 'type_rain',
    name: 'Rain Drop',
    description: 'Goutte de pluie tombante',

    // Visual
    visual: 'rain',
    hasTrail: true,
    trailLength: 3,
    hasGlow: true,

    // Default values
    defaultSize: 10,
    defaultDamage: 6,
    defaultLifetime: 8000,

    // Rendering
    renderStyle: 'teardrop'
};
