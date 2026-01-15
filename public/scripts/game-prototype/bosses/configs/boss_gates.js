// ============================================
// BOSS CONFIG: Bill Gates
// Layer 1 - Physical Boss (FINAL BOSS)
// Cyborg Hardware Lock → Azure Cloud (Dual Phase)
// ============================================

export const boss_gates = {
    id: 'boss_gates',
    name: 'BILL',
    name2: 'GATES',
    subtitle: 'CYBORG HARDWARE LOCK',
    quote: '"Votre matériel est trop VIEUX pour Windows 11."',
    dramaticLine: 'Vous êtes PIÉGÉS.',
    midCombatQuote: 'TPM 2.0 non détecté. Secure Boot désactivé. ACCÈS REFUSÉ.',
    defeatQuote: 'Non... le monopole... s\'effondre...',
    layer: 1,

    // Stats - Boss final = plus costaud
    health: 300,
    speed: 1.0,
    size: 100,
    points: 10000,

    // Movement pattern - Multi-phase comme le vrai boss
    movement: {
        type: 'multi_phase',
        phases: [
            { type: 'slow_descent', stopAtY: 120, speed: 0.3 },
            { type: 'figure_eight', amplitude: 100, frequency: 0.001 },
            { type: 'aggressive_chase', speed: 2.5 }
        ]
    },

    // Attack patterns - Phase 1 (Hardware Lock)
    attacks: [
        // ATTAQUE 1: TPM Check - projectiles vérification
        {
            name: 'tpm_check',
            type: 'projectile_burst',
            cooldown: 3000,
            projectiles: 5,
            spreadAngle: 70,
            projectileSpeed: 4,
            projectileSize: 15,
            projectileColor: '#0078D4',
            damage: 5,
            phase: 1
        },
        // ATTAQUE 2: Secure Boot - zones de danger au sol
        {
            name: 'secure_boot',
            type: 'ground_hazard',
            cooldown: 5000,
            hazardCount: 5,
            hazardDuration: 4000,
            hazardRadius: 45,
            damagePerSecond: 6,
            hazardColor: '#FFD700',
            phase: 1
        },
        // ATTAQUE 3: License Check - rayon de scan
        {
            name: 'license_check',
            type: 'sweeping_beam',
            cooldown: 6000,
            beamLength: 350,
            beamWidth: 20,
            sweepSpeed: 0.04,
            sweepAngle: 160,
            damage: 6,
            beamColor: '#00A4EF',
            phase: 1
        }
    ],

    // Phase transitions avec transformation visuelle
    phases: [
        {
            threshold: 0.7,
            speedMultiplier: 1.3,
            attackCooldownMultiplier: 0.9,
            enrageText: 'MISE À NIVEAU MATÉRIELLE REQUISE...'
        },
        {
            threshold: 0.5,
            transform: true,
            transformTo: 'phase2',
            phaseIndex: 1,
            enrageText: 'TRANSFORMATION: AZURE CLOUD!'
        },
        {
            threshold: 0.15,
            speedMultiplier: 2.5,
            attackCooldownMultiplier: 0.4,
            enrageText: 'EMBRACE. EXTEND. EXTINGUISH!'
        }
    ],

    // Phase 2: Azure Cloud - Transformation complète
    phase2: {
        name: 'AZURE',
        name2: 'CLOUD',
        subtitle: 'EMBRACE EXTEND EXTINGUISH',
        quote: '"Le matériel est obsolète. Je suis PARTOUT maintenant."',
        midCombatQuote: 'Vos données sont dans MON cloud. Pour TOUJOURS.',
        color: '#0089D6',
        glowColor: '#50E6FF',
        shape: 'azure_cloud',
        portrait: '/images/game/bosses/AZURE_cartoon1.png',

        // Nouvelles attaques Phase 2
        attacks: [
            // ATTAQUE 4: BGP Hijack - projectiles qui changent de direction
            {
                name: 'bgp_hijack',
                type: 'projectile_redirect',
                cooldown: 4000,
                projectiles: 6,
                projectileSpeed: 3,
                redirectDelay: 800,
                projectileColor: '#50E6FF',
                damage: 5,
                phase: 2
            },
            // ATTAQUE 5: Region Lock - zones restrictives
            {
                name: 'region_lock',
                type: 'zone_restrict',
                cooldown: 6000,
                zoneCount: 3,
                zoneDuration: 5000,
                zoneRadius: 80,
                zoneColor: '#0089D6',
                damage: 4,
                phase: 2
            },
            // ATTAQUE 6: Subscription Drain - zone cloud qui draine HP
            {
                name: 'subscription_drain',
                type: 'subscription_drain',
                cooldown: 8000,
                duration: 3000,
                drainPerSecond: 3,
                drainRadius: 200,
                drainColor: '#FF4444',
                phase: 2
            }
        ]
    },

    // Visual - Phase 1
    color: '#0078D4',           // Bleu Windows
    glowColor: '#FFD700',       // Or (richesse/puissance)
    shape: 'gates_cyborg',
    portrait: '/images/game/bosses/BILL_cartoon1.png'
};
