// ============================================
// NETDEFENDER - GAME CONFIGURATION
// Portfolio-integrated OSI Defense Game
// ============================================

// ============================================
// DEV MODE - Quick testing with reduced HP
// Activable via console: window.DEV_MODE.enabled = true
// ============================================
export const DEV_MODE = {
    enabled: false,         // Toggle via console ou prototype-game.html
    bossHPDivisor: 10       // Divise les HP des boss par ce facteur
};

export const CONFIG = {
    // Display
    FPS: 60,

    // Performance - Désactiver pour machines moins puissantes
    PERFORMANCE: {
        ENABLE_PROJECTILE_GLOW: false,  // shadowBlur sur projectiles (coûteux)
        ENABLE_GRID_GLOW: true,         // Glow accents sur la grille
        MAX_TRAIL_LENGTH: 4             // Longueur des trails de projectiles
    },

    // Player settings
    PLAYER: {
        WIDTH: 50,
        HEIGHT: 50,
        SPEED: 7,
        MAX_HEALTH: 100,
        SHOOT_COOLDOWN: 180, // ms
        INVINCIBILITY_DURATION: 1500 // ms after taking damage
    },

    // ============================================
    // PLAYER OSI SYSTEM - "Poupée Russe" HP Model
    // Damage flows from outer (L7) to inner (L1)
    // ============================================
    PLAYER_OSI: {
        // HP par couche (total: 100 HP)
        LAYER_HP: {
            7: 20,  // APPLICATION  - Débloquée au départ
            6: 15,  // PRESENTATION
            5: 15,  // SESSION
            4: 15,  // TRANSPORT
            3: 15,  // NETWORK
            2: 10,  // DATA LINK
            1: 10   // PHYSICAL     - Core, mort si détruit
        },
        // Rayons visuels (pixels depuis le centre)
        // ORDRE RÉSEAU : L7 au centre (données), L1 à l'extérieur (physique)
        // Comme un vrai paquet encapsulé !
        LAYER_RADII: {
            7: 6,   // APPLICATION - Core (données utilisateur)
            6: 10,  // PRESENTATION
            5: 14,  // SESSION
            4: 18,  // TRANSPORT
            3: 22,  // NETWORK
            2: 26,  // DATA LINK
            1: 30   // PHYSICAL - Shell externe (le câble)
        },
        // Épaisseur des anneaux (px)
        LAYER_THICKNESS: 3,
        // Animation timings (ms)
        FLICKER_SPEED: 150,         // Vitesse flicker dégâts
        UNLOCK_ANIM_DURATION: 800,  // Durée animation unlock
        DAMAGE_FLASH_DURATION: 200  // Flash rouge lors de dégâts
    },

    // Bullet settings
    BULLET: {
        WIDTH: 6,
        HEIGHT: 24,
        SPEED: 14,
        COLOR: '#00ffff'
    },

    // Visual settings (matching portfolio)
    GRID_SIZE: 30,
    PARTICLE_COUNT: 20,

    // Audio
    AUDIO: {
        MASTER_VOLUME: 0.7,
        SFX_VOLUME: 0.8,
        MUSIC_VOLUME: 0.5
    }
};

// ============================================
// OSI LAYER COLORS - Portfolio Palette
// ============================================
export const OSI_COLORS = {
    7: {
        level: 7,
        name: 'APPLICATION',
        color: '#ff0080',      // Magenta
        glow: 'rgba(255, 0, 128, 0.5)',
        gridColor: 'rgba(255, 0, 128, 0.03)'
    },
    6: {
        level: 6,
        name: 'PRESENTATION',
        color: '#ff0080',
        glow: 'rgba(255, 0, 128, 0.4)',
        gridColor: 'rgba(255, 0, 128, 0.03)'
    },
    5: {
        level: 5,
        name: 'SESSION',
        color: '#00ff88',      // Green
        glow: 'rgba(0, 255, 136, 0.5)',
        gridColor: 'rgba(0, 255, 136, 0.03)'
    },
    4: {
        level: 4,
        name: 'TRANSPORT',
        color: '#00ff88',
        glow: 'rgba(0, 255, 136, 0.4)',
        gridColor: 'rgba(0, 255, 136, 0.03)'
    },
    3: {
        level: 3,
        name: 'NETWORK',
        color: '#00ffff',      // Cyan
        glow: 'rgba(0, 255, 255, 0.5)',
        gridColor: 'rgba(0, 255, 255, 0.03)'
    },
    2: {
        level: 2,
        name: 'DATA LINK',
        color: '#ffff00',      // Yellow
        glow: 'rgba(255, 255, 0, 0.5)',
        gridColor: 'rgba(255, 255, 0, 0.03)'
    },
    1: {
        level: 1,
        name: 'PHYSICAL',
        color: '#ffff00',
        glow: 'rgba(255, 255, 0, 0.4)',
        gridColor: 'rgba(255, 255, 0, 0.03)'
    }
};

// ============================================
// OSI LAYERS WITH ENEMIES
// ============================================
export const OSI_LAYERS = [
    {
        level: 7,
        name: 'APPLICATION',
        color: '#ff0080',
        enemies: [
            { type: 'sql_injection', name: 'SQL Injection', health: 2, speed: 2.0, points: 100, behavior: 'zigzag', size: 35 },
            { type: 'xss', name: 'XSS Spider', health: 1, speed: 3.0, points: 80, behavior: 'fast', size: 28 },
            { type: 'csrf', name: 'CSRF Bot', health: 1, speed: 2.2, points: 90, behavior: 'diagonal', size: 30 },
            { type: 'clippe', name: 'CLIPP-E', health: 8, speed: 1.0, points: 500, behavior: 'boss', size: 60 }
        ],
        spawnCount: 12,
        spawnDelay: 800
    },
    {
        level: 6,
        name: 'PRESENTATION',
        color: '#1E90FF',
        enemies: [
            { type: 'ssl_stripper', name: 'SSL Stripper', health: 2, speed: 2.2, points: 120, behavior: 'phase', size: 32 },
            { type: 'ransomware', name: 'Ransomware', health: 4, speed: 1.5, points: 200, behavior: 'slow_tank', size: 45 },
            { type: 'homograph', name: 'Homograph', health: 1, speed: 3.2, points: 100, behavior: 'fast', size: 26 },
            { type: 'zip_bomb', name: 'Zip Bomb', health: 6, speed: 1.2, points: 350, behavior: 'heavy', size: 50 },
            { type: 'explorer', name: 'Internet Diabolicus Ex-Plorer', health: 30, speed: 2.0, points: 2800, behavior: 'boss', size: 90 }
        ],
        spawnCount: 15,
        spawnDelay: 750
    },
    {
        level: 5,
        name: 'SESSION',
        color: '#00ff88',
        enemies: [
            { type: 'session_hijack', name: 'Session Hijacker', health: 2, speed: 2.5, points: 140, behavior: 'teleport', size: 34 },
            { type: 'token_thief', name: 'Token Thief', health: 1, speed: 3.5, points: 110, behavior: 'fast', size: 28 },
            { type: 'replay', name: 'Replay Attack', health: 3, speed: 2.0, points: 160, behavior: 'zigzag', size: 36 },
            { type: 'brute_force', name: 'Brute Force', health: 5, speed: 1.8, points: 280, behavior: 'slow_tank', size: 48 },
            { type: 'messenger', name: 'MSN Messenger', health: 18, speed: 1.5, points: 2500, behavior: 'boss', size: 75 }
        ],
        spawnCount: 16,
        spawnDelay: 700
    },
    {
        level: 4,
        name: 'TRANSPORT',
        color: '#00ff88',
        enemies: [
            { type: 'syn_flood', name: 'SYN Flood', health: 1, speed: 4.0, points: 60, behavior: 'swarm', size: 22 },
            { type: 'udp_flood', name: 'UDP Flood', health: 1, speed: 3.8, points: 70, behavior: 'swarm', size: 24 },
            { type: 'port_scanner', name: 'Port Scanner', health: 2, speed: 2.8, points: 150, behavior: 'diagonal', size: 32 },
            { type: 'ack_storm', name: 'ACK Storm', health: 4, speed: 2.0, points: 220, behavior: 'wave', size: 40 },
            { type: 'update', name: 'Windows Update', health: 22, speed: 1.0, points: 2800, behavior: 'boss', size: 85 }
        ],
        spawnCount: 20,
        spawnDelay: 500
    },
    {
        level: 3,
        name: 'NETWORK',
        color: '#00ffff',
        enemies: [
            { type: 'ip_spoof', name: 'IP Spoofer', health: 2, speed: 3.0, points: 160, behavior: 'phase', size: 34 },
            { type: 'ping_death', name: 'Ping of Death', health: 4, speed: 1.8, points: 200, behavior: 'heavy', size: 44 },
            { type: 'smurf', name: 'Smurf Attack', health: 1, speed: 4.2, points: 100, behavior: 'swarm', size: 24 },
            { type: 'norton', name: 'Norton Antivirus', health: 20, speed: 1.2, points: 2600, behavior: 'boss', size: 80 }
        ],
        spawnCount: 18,
        spawnDelay: 600
    },
    {
        level: 2,
        name: 'DATA LINK',
        color: '#ffff00',
        enemies: [
            { type: 'arp_spoof', name: 'ARP Spoofer', health: 3, speed: 3.2, points: 180, behavior: 'erratic', size: 36 },
            { type: 'mac_flood', name: 'MAC Flooder', health: 1, speed: 4.5, points: 120, behavior: 'swarm', size: 22 },
            { type: 'vlan_hop', name: 'VLAN Hopper', health: 3, speed: 2.5, points: 240, behavior: 'zigzag', size: 38 },
            { type: 'hub', name: 'Hub 10BASE-T', health: 19, speed: 0.8, points: 2400, behavior: 'boss', size: 90 }
        ],
        spawnCount: 22,
        spawnDelay: 450
    },
    {
        level: 1,
        name: 'PHYSICAL',
        color: '#ffff00',
        enemies: [
            { type: 'cable_cut', name: 'Cable Cutter', health: 5, speed: 1.5, points: 250, behavior: 'slow_tank', size: 48 },
            { type: 'em_jammer', name: 'EM Jammer', health: 6, speed: 1.2, points: 350, behavior: 'heavy', size: 55 },
            { type: 'wiretap', name: 'Wiretapper', health: 4, speed: 2.0, points: 200, behavior: 'zigzag', size: 42 },
            { type: 'gates', name: 'Bill Gates', health: 50, speed: 1.0, points: 10000, behavior: 'boss', size: 100 }
        ],
        spawnCount: 16,
        spawnDelay: 700
    }
];

// ============================================
// POWER-UPS CONFIGURATION
// ============================================
export const POWERUPS = {
    positive: [
        {
            type: 'heal',
            name: 'Patch Tuesday',
            color: '#00ff88',
            glow: 'rgba(0, 255, 136, 0.6)',
            icon: '+',
            value: 25,
            duration: 0
        },
        {
            type: 'shield',
            name: 'VPN Shield',
            color: '#00ffff',
            glow: 'rgba(0, 255, 255, 0.6)',
            icon: '◆',
            value: 0,
            duration: 5000
        },
        {
            type: 'slowmo',
            name: 'Rate Limiter',
            color: '#ffff00',
            glow: 'rgba(255, 255, 0, 0.6)',
            icon: '◈',
            value: 0,
            duration: 4000
        },
        {
            type: 'rapid_fire',
            name: 'Firewall Boost',
            color: '#00ffff',
            glow: 'rgba(0, 255, 255, 0.6)',
            icon: '▲',
            value: 0,
            duration: 6000
        }
    ],
    negative: [
        {
            type: 'damage',
            name: 'Malware',
            color: '#ff0080',
            glow: 'rgba(255, 0, 128, 0.6)',
            icon: '✕',
            value: 20,
            duration: 0
        },
        {
            type: 'slow',
            name: 'DDoS',
            color: '#ff6600',
            glow: 'rgba(255, 102, 0, 0.6)',
            icon: '▼',
            value: 0,
            duration: 4000
        },
        {
            type: 'reverse',
            name: 'Corrupted Packet',
            color: '#ff0080',
            glow: 'rgba(255, 0, 128, 0.6)',
            icon: '↔',
            value: 0,
            duration: 3000
        }
    ]
};

// ============================================
// PORTFOLIO COLOR PALETTE (Reference)
// ============================================
export const PORTFOLIO_COLORS = {
    black: '#000000',
    white: '#ffffff',
    neonCyan: '#00ffff',
    neonMagenta: '#ff0080',
    neonGreen: '#00ff88',
    neonYellow: '#ffff00',
    grayDark: '#0a0a0a',
    grayMid: '#1a1a1a',
    grayLight: '#888888',
    grayLighter: '#aaaaaa'
};
