// ============================================
// BOSS CONFIG: Internet Explorer 6
// Layer 6 - Presentation Boss
// Le Monopole Absolu
// ============================================

export const boss_explorer = {
    id: 'boss_explorer',
    name: 'INTERNET',
    name2: 'EXPLORER 6',
    subtitle: 'LE MONOPOLE ABSOLU',
    quote: '"Vous voulez des standards web ouverts ? Trop tard. JE SUIS le web."',
    dramaticLine: 'Ce réseau ne supportera JAMAIS Firefox.',
    midCombatQuote: 'ActiveX injection détectée ! Tout site web M\'appartient !',
    defeatQuote: 'Non... Chrome... Firefox... les standards... ma part de marché... 95%... perdue...',
    layer: 6,

    // Stats
    health: 300,
    speed: 2.0,
    size: 90,
    points: 2800,

    // Visual - Palette Doc
    color: '#0078D4',           // Bleu IE primaire
    glowColor: '#00A4EF',       // Cyan clair
    shape: 'explorer_logo',
    portrait: '/images/game/bosses/INTERNET_EXPLORER_cartoon1.jpg',

    // Mouvement hybride figure-8 + téléportation
    movement: {
        type: 'figure_eight_with_teleport',
        amplitude: 120,
        frequency: 0.0015,
        verticalSpeed: 0.3,
        stopAtY: 100,
        // Paramètres téléportation "Lag"
        teleportCooldownMin: 5000,
        teleportCooldownMax: 8000,
        teleportGlitchDuration: 300
    },

    // Attack patterns
    attacks: [
        // ATTAQUE 1: Popup Spam - vagues de fenêtres
        {
            name: 'popup_spam',
            type: 'projectile_rain',
            cooldown: 3000,
            dropCount: 7,
            dropSpeed: 3.5,
            dropSize: 25,
            dropColor: '#1E90FF',
            projectileType: 'popup_window',
            damage: 12,
            spreadWidth: 350
        },
        // ATTAQUE 2: ActiveX Laser - rayon balayant
        {
            name: 'activex_laser',
            type: 'sweeping_beam',
            cooldown: 5000,
            beamLength: 400,
            beamWidth: 25,
            sweepSpeed: 0.03,
            sweepAngle: 140,
            damage: 18,
            beamColor: '#1E90FF'
        }
    ],

    // Phase transitions
    phases: [
        {
            threshold: 0.5,
            speedMultiplier: 1.3,
            attackCooldownMultiplier: 0.85,
            enrageText: 'MISE À JOUR FORCÉE...',
            activateAttack: '404_error'
        }
    ],

    // Attaque de phase: 404 Error (zones de danger au sol)
    phaseAttacks: {
        '404_error': {
            name: '404_error',
            type: 'ground_hazard',
            cooldown: 4500,
            hazardCount: 4,
            hazardDuration: 5000,
            hazardRadius: 50,
            damagePerSecond: 20,
            hazardColor: '#FF4444'
        }
    }
};
