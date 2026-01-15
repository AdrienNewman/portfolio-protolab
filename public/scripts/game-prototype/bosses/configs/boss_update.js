// ============================================
// BOSS CONFIG: Windows Update
// Layer 4 - Transport Boss
// Redémarrage Forcé
// ============================================

export const boss_update = {
    id: 'boss_update',
    name: 'WINDOWS',
    name2: 'UPDATE',
    subtitle: 'REDÉMARRAGE FORCÉ',
    quote: '"Téléchargement : 99%... Redémarrage forcé dans 10 secondes."',
    dramaticLine: 'Annulation : IMPOSSIBLE.',
    midCombatQuote: 'Mise à jour 1 sur 347... Ne pas éteindre votre ordinateur.',
    defeatQuote: 'Erreur 0x80070005... Restauration... du système... impossible...',
    layer: 4,

    // Stats
    health: 400,
    speed: 1.0,
    size: 85,
    points: 2800,

    // Movement pattern - Lent et oppressant comme une màj
    movement: {
        type: 'horizontal_sweep',
        amplitude: 200,
        frequency: 0.001,
        verticalSpeed: 0.15,
        stopAtY: 90
    },

    // Attack patterns
    attacks: [
        // ATTAQUE 1: Forced Reboot - flash d'écran + stun
        {
            name: 'forced_reboot',
            type: 'screen_flash',
            cooldown: 8000,
            chargeTime: 2000,
            flashDamage: 15,
            stunDuration: 3000,
            warningColor: '#00BCF2'
        },
        // ATTAQUE 2: Bandwidth Throttle - zone de ralentissement
        {
            name: 'bandwidth_throttle',
            type: 'slow_field',
            cooldown: 5000,
            fieldRadius: 150,
            slowFactor: 0.4,
            duration: 4000,
            fieldColor: '#0078D4'
        },
        // ATTAQUE 3: Update Packets - salve de projectiles
        {
            name: 'update_packets',
            type: 'projectile_burst',
            cooldown: 3000,
            projectiles: 6,
            spreadAngle: 90,
            projectileSpeed: 3.5,
            projectileSize: 12,
            projectileColor: '#00BCF2',
            damage: 10
        }
    ],

    // Special behavior - barre de progression avec invincibilité
    behavior: {
        type: 'progress_bar',
        triggerThresholds: [0.6, 0.3],
        invincibilityDuration: 5000,
        displayText: ['Installation en cours...', 'Redémarrage imminent...'],
        progressColor: '#00BCF2',
        attackAfterComplete: 'forced_reboot'
    },

    // Phase transitions
    phases: [
        {
            threshold: 0.6,
            shieldActive: true,
            shieldHealth: 40,
            enrageText: 'INSTALLATION EN COURS...'
        },
        {
            threshold: 0.3,
            attackCooldownMultiplier: 0.6,
            speedMultiplier: 1.5,
            enrageText: 'REDÉMARRAGE IMMINENT!'
        }
    ],

    // Visual - Palette Doc
    color: '#0078D4',           // Bleu Windows
    glowColor: '#00BCF2',       // Cyan barre progression
    shape: 'update_logo',
    portrait: '/images/game/bosses/WIN_UPDATE_cartoon1.jpg'
};
