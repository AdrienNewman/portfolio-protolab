// ============================================
// BOSS CONFIG: CLIPPY MALÉFIQUE
// Layer 7 - Application Boss
// L'Assistant Immortel
// ============================================

export const boss_clippe = {
    id: 'boss_clippe',
    name: 'CLIPPY',
    name2: 'MALÉFIQUE',
    subtitle: 'L\'ASSISTANT IMMORTEL',
    quote: '"Je vois que vous tentez d\'installer Linux... Mais votre licence Windows est ÉTERNELLE."',
    dramaticLine: 'Vous. Ne. Partirez. JAMAIS!',
    midCombatQuote: 'Assistance automatique activée ! Vous ne pouvez PAS refuser mon aide !',
    defeatQuote: 'Non... impossible... Vous n\'aviez pas besoin de mon aide...?',
    layer: 7,

    // Stats
    health: 250,
    speed: 1.0,
    size: 80,
    points: 3000,

    // Movement pattern
    movement: {
        type: 'pendulum',
        amplitude: 250,
        frequency: 0.002,
        verticalSpeed: 0.3,
        stopAtY: 120
    },

    // Attack patterns
    attacks: [
        {
            name: 'macro_virus',
            type: 'projectile_burst',
            cooldown: 1800,
            projectiles: 4,
            spreadAngle: 60,
            projectileSpeed: 4,
            projectileSize: 18,
            projectileColor: '#0078D4',
            projectileType: 'letter',
            damage: 12
        },
        // ATTAQUE 2: Help Bubble - bulles d'aide qui traquent le joueur
        {
            name: 'help_bubble',
            type: 'help_bubble',
            cooldown: 4000,
            bubbleCount: 3,
            trackingSpeed: 1.5,
            duration: 5000,
            bubbleSize: 25,
            bubbleColor: '#FFFF00',
            damage: 8
        }
    ],

    // Special behavior
    behavior: {
        type: 'sticky_assistant',
        triggerDistance: 150,
        stickDuration: 3000,
        speedMultiplier: 2.0,
        cooldown: 8000
    },

    // Phase transitions
    phases: [
        { threshold: 0.5, speedMultiplier: 1.5, attackCooldownMultiplier: 0.8, enrageText: 'DÉSINSTALLATION FORCÉE...' }
    ],

    // Visual - Palette Doc
    color: '#C0C0C0',         // Gris métal trombone
    glowColor: '#0078D4',     // Bleu Windows
    eyeColor: '#FFFF00',      // Jaune yeux pulsants
    shape: 'paperclip',
    portrait: '/images/game/bosses/CLIPP-E_cartoon1.jpg'
};
