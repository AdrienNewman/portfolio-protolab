// ============================================
// PROJECTILE CONFIG: Letter
// BSOD-style letter projectile (EULA)
// Used by CLIPP-E boss (macro_virus attack)
// ============================================

export const type_letter = {
    id: 'type_letter',
    name: 'EULA Letter',
    description: 'Lettre EULA style écran bleu de la mort',

    // Visual
    visual: 'letter',
    hasTrail: false,
    trailLength: 0,
    hasGlow: false,

    // Letter options
    letters: ['E', 'U', 'L', 'A'],
    backgroundColor: '#0078D4',
    borderColor: '#4DA6FF',
    textColor: '#FFFFFF',

    // Default values
    defaultSize: 18,
    defaultDamage: 12,
    defaultLifetime: 10000,

    // Rendering
    renderStyle: 'square',
    fontSizeRatio: 0.6
};
