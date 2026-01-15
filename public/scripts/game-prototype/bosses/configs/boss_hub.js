// ============================================
// BOSS CONFIG: Hub 10BASE-T
// Layer 2 - Data Link Boss
// Collisions Infinies
// ============================================

export const boss_hub = {
    id: 'boss_hub',
    name: 'HUB',
    name2: '10BASE-T',
    subtitle: 'COLLISIONS INFINIES',
    quote: '"Half-duplex. Collisions infinies. Personne ne passe."',
    dramaticLine: 'Broadcast ! TOUT LE MONDE REÇOIT TOUT !',
    midCombatQuote: 'COLLISION DÉTECTÉE! Backoff... Retry... COLLISION!',
    defeatQuote: 'Mes ports... s\'éteignent... un par un... LEDs... mortes...',
    layer: 2,

    // Stats
    health: 250,
    speed: 0.8,
    size: 90,
    points: 2400,

    // Movement pattern - Statique comme un vrai hub
    movement: {
        type: 'static_with_shield',
        verticalSpeed: 0.1,
        stopAtY: 80,
        shieldRotationSpeed: 0.02
    },

    // Attack patterns
    attacks: [
        // ATTAQUE 1: Broadcast Chaos - projectiles dans toutes les directions
        {
            name: 'broadcast_chaos',
            type: 'circular_wave',
            cooldown: 4000,
            waveCount: 2,
            projectilesPerWave: 16,
            waveDelay: 500,
            projectileSpeed: 3,
            projectileSize: 10,
            projectileColor: '#FF6600',
            damage: 4
        },
        // ATTAQUE 2: Collision Storm - projectiles qui se multiplient
        {
            name: 'collision_storm',
            type: 'projectile_multiply',
            cooldown: 3500,
            initialProjectiles: 4,
            multiplyCount: 2,
            multiplyDelay: 800,
            projectileSpeed: 4,
            projectileSize: 12,
            projectileColor: '#C0C0C0',
            damage: 4
        },
        // ATTAQUE 3: Port Jam - lignes de tir depuis les "ports"
        {
            name: 'port_jam',
            type: 'multi_line_fire',
            cooldown: 5000,
            lines: 8,
            lineLength: 300,
            fireRate: 100,
            projectileSpeed: 5,
            projectileSize: 8,
            projectileColor: '#FF6600',
            damage: 3
        }
    ],

    // Phase transitions
    phases: [
        {
            threshold: 0.6,
            attackCooldownMultiplier: 0.8,
            enrageText: 'TRAFIC SATURÉ!'
        },
        {
            threshold: 0.3,
            attackCooldownMultiplier: 0.5,
            speedMultiplier: 1.3,
            enrageText: 'BROADCAST STORM IMMINENT!'
        }
    ],

    // Visual - Palette Doc
    color: '#C0C0C0',           // Gris hub
    glowColor: '#FF6600',       // Orange collision/LEDs
    shape: 'hub_box',
    portrait: '/images/game/bosses/10BASE-T_cartoon1.jpg'
};
