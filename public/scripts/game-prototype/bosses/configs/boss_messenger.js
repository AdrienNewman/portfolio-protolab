// ============================================
// BOSS CONFIG: MSN Messenger
// Layer 5 - Session Boss
// Le Fantôme de vos Contacts
// ============================================

export const boss_messenger = {
    id: 'boss_messenger',
    name: 'MSN',
    name2: 'MESSENGER',
    subtitle: 'LE FANTÔME DE VOS CONTACTS',
    quote: '"Vous êtes CONNECTÉ. Pour toujours. Impossible de vous déconnecter."',
    dramaticLine: 'Tous vos contacts sont en ligne... ET ILS VOUS REGARDENT !',
    midCombatQuote: '*NUDGE* *NUDGE* *NUDGE* Vous ne pouvez pas m\'ignorer !',
    defeatQuote: 'Votre statut... passe en... hors ligne... pour toujours...',
    layer: 5,

    // Stats
    health: 175,
    speed: 1.5,
    size: 75,
    points: 2500,

    // Movement pattern - Erratique comme un contact qui spam
    movement: {
        type: 'weave',
        amplitude: 150,
        frequency: 0.003,
        verticalSpeed: 0.2,
        stopAtY: 100
    },

    // Attack patterns
    attacks: [
        // ATTAQUE 1: Nudge Storm - secousse d'écran + onde de choc
        {
            name: 'nudge_storm',
            type: 'screen_shake_attack',
            cooldown: 5000,
            shakeDuration: 2000,
            shakeIntensity: 15,
            damage: 5,
            warningColor: '#7FBA00'
        },
        // ATTAQUE 2: Wink Spam - pluie d'emoticons
        {
            name: 'wink_spam',
            type: 'projectile_rain',
            cooldown: 3000,
            dropCount: 8,
            dropSpeed: 4,
            dropSize: 20,
            dropColor: '#7FBA00',
            projectileType: 'emoticon',
            damage: 4,
            spreadWidth: 300
        },
        // ATTAQUE 3: Contact Request - projectiles ciblés
        {
            name: 'contact_request',
            type: 'projectile_aimed',
            cooldown: 2500,
            projectileSpeed: 5,
            projectileSize: 15,
            projectileColor: '#00FF00',
            damage: 5,
            aimPrediction: 0.2
        }
    ],

    // Special behavior - disparition façon "hors ligne"
    behavior: {
        type: 'go_offline',
        triggerThreshold: 0.4,
        offlineDuration: 2500,
        cooldown: 15000,
        fadeSpeed: 0.05
    },

    // Phase transitions
    phases: [
        {
            threshold: 0.5,
            speedMultiplier: 1.4,
            attackCooldownMultiplier: 0.8,
            enrageText: 'STATUT: OCCUPÉ... À VOUS DÉTRUIRE!'
        }
    ],

    // Visual - Palette Doc
    color: '#7FBA00',           // Vert MSN
    glowColor: '#00FF00',       // Vert vif
    shape: 'messenger',
    portrait: '/images/game/bosses/MESSENGER_cartoon1.jpg'
};
