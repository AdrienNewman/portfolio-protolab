// ============================================
// BOSS CONFIG: Norton Antivirus
// Layer 3 - Network Boss
// Faux Positif Total
// ============================================

export const boss_norton = {
    id: 'boss_norton',
    name: 'NORTON',
    name2: 'ANTIVIRUS',
    subtitle: 'FAUX POSITIF TOTAL',
    quote: '"MENACE DÉTECTÉE : Linux.iso. QUARANTAINE PERMANENTE."',
    dramaticLine: 'TOUT est suspect ! TOUT doit être supprimé !',
    midCombatQuote: 'Analyse complète en cours... 47 ans restants...',
    defeatQuote: 'Erreur critique... Votre licence... a expiré...',
    layer: 3,

    // Stats
    health: 450,
    speed: 1.2,
    size: 80,
    points: 2600,

    // Movement pattern - Scanning de gauche à droite
    movement: {
        type: 'horizontal_sweep',
        amplitude: 180,
        frequency: 0.002,
        verticalSpeed: 0.2,
        stopAtY: 100
    },

    // Attack patterns
    attacks: [
        // ATTAQUE 1: Full Scan - rayon de scan vertical balayant
        {
            name: 'full_scan',
            type: 'scan_beam',
            cooldown: 8000,
            beamWidth: 50,
            sweepSpeed: 3,
            damage: 12,
            warningTime: 1000,
            warningColor: '#FFD700',
            beamColor: '#FF0000'
        },
        // ATTAQUE 2: False Positive - spawn de minions "virus détecté"
        {
            name: 'false_positive',
            type: 'spawn_minions',
            cooldown: 6000,
            minionCount: 3,
            minionHealth: 25,
            minionSpeed: 2,
            minionColor: '#FF0000',
            damage: 8
        },
        // ATTAQUE 3: Quarantine Zone - zones de danger
        {
            name: 'quarantine_zone',
            type: 'ground_hazard',
            cooldown: 5000,
            hazardCount: 3,
            hazardDuration: 4000,
            hazardRadius: 60,
            damagePerSecond: 15,
            hazardColor: '#FFD700'
        }
    ],

    // Special behavior - capture le joueur en quarantaine
    behavior: {
        type: 'quarantine',
        triggerCooldown: 12000,
        captureDuration: 2000,
        damagePerSecond: 10,
        captureRange: 120,
        captureSpeed: 8,
        bubbleColor: '#FFD700'
    },

    // Phase transitions
    phases: [
        {
            threshold: 0.6,
            attackCooldownMultiplier: 0.8,
            enrageText: 'NIVEAU DE MENACE: CRITIQUE!'
        },
        {
            threshold: 0.3,
            speedMultiplier: 1.8,
            attackCooldownMultiplier: 0.6,
            enrageText: 'MODE PARANOÏAQUE ACTIVÉ!'
        }
    ],

    // Visual - Palette Doc
    color: '#FFD700',           // Jaune Norton
    glowColor: '#FF0000',       // Rouge alertes
    shape: 'norton_shield',
    portrait: '/images/game/bosses/NORTON_cartoon1.jpg'
};
