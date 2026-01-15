// ============================================
// PROJECTILE CONFIG: Popup Window
// Windows-style popup error window
// Used by boss_explorer (popup_spam attack)
// ============================================

export const type_popup = {
    id: 'type_popup',
    name: 'Popup Window',
    description: 'Fenêtre popup style Windows classique',

    // Visual
    visual: 'popup',
    hasTrail: false,
    trailLength: 0,
    hasGlow: false,

    // Window colors
    backgroundColor: '#F0F0F0',
    titleBarColor: '#0078D4',
    closeButtonColor: '#E81123',
    borderColor: '#666666',
    warningColor: '#FFB900',

    // Default values
    defaultSize: 24,
    defaultDamage: 8,
    defaultLifetime: 8000,

    // Rendering
    renderStyle: 'square',
    titleBarRatio: 0.25,
    closeButtonRatio: 0.25
};
