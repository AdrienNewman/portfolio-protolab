// ============================================
// BOSS BEHAVIORS - NetDefender
// 7 unique boss patterns with special attacks
// ============================================

/**
 * Boss Behavior Definitions
 * Each boss has unique movement, attack patterns, and special abilities
 */
export const BOSS_BEHAVIORS = {
    // ============================================
    // LAYER 7 - APPLICATION: Bobby "DROP TABLE" Thompson
    // SQL Injection Master
    // ============================================
    boss_injection: {
        id: 'boss_injection',
        name: 'Bobby "DROP TABLE" Thompson',
        subtitle: 'SQL INJECTION MASTER',
        quote: '"My mother called me Robert\'); DROP TABLE--"',
        layer: 7,

        // Stats (reduced 90% for testing)
        health: 15,
        speed: 1.5,
        size: 70,
        points: 2000,

        // Movement pattern
        movement: {
            type: 'pendulum',
            amplitude: 150,
            frequency: 0.002,
            verticalSpeed: 0.3,
            stopAtY: 120 // Boss stops at this Y and attacks
        },

        // Attack patterns
        attacks: [
            {
                name: 'sql_query',
                type: 'projectile_burst',
                cooldown: 2000,
                projectiles: 5,
                spreadAngle: 60,
                projectileSpeed: 4,
                projectileSize: 12,
                projectileColor: '#ff0080',
                damage: 15
            },
            {
                name: 'injection_stream',
                type: 'laser_sweep',
                cooldown: 5000,
                duration: 1500,
                width: 20,
                sweepAngle: 90,
                damage: 25
            }
        ],

        // Phase transitions (at % health)
        phases: [
            { threshold: 0.6, speedMultiplier: 1.3, attackCooldownMultiplier: 0.8 },
            { threshold: 0.3, speedMultiplier: 1.6, attackCooldownMultiplier: 0.6, enrageText: 'ENTERING BLIND MODE...' }
        ],

        // Visual
        color: '#ff0080',
        glowColor: 'rgba(255, 0, 128, 0.6)',
        shape: 'hexagon'
    },

    // ============================================
    // LAYER 6 - PRESENTATION: Ivan "Heartbleed" Volkov
    // Memory Leak Butcher
    // ============================================
    boss_heartbleed: {
        id: 'boss_heartbleed',
        name: 'Ivan "Heartbleed" Volkov',
        subtitle: 'MEMORY LEAK BUTCHER',
        quote: '"Your secrets bleed into my hands..."',
        layer: 6,

        health: 18,
        speed: 1.2,
        size: 75,
        points: 2500,

        movement: {
            type: 'figure_eight',
            amplitude: 120,
            frequency: 0.0015,
            verticalSpeed: 0.2,
            stopAtY: 100
        },

        attacks: [
            {
                name: 'memory_bleed',
                type: 'area_drain',
                cooldown: 3000,
                radius: 150,
                duration: 2000,
                damagePerTick: 5,
                tickInterval: 200,
                visualEffect: 'expanding_ring'
            },
            {
                name: 'data_leak',
                type: 'homing_projectile',
                cooldown: 4000,
                projectileSpeed: 3,
                homingStrength: 0.02,
                projectileSize: 18,
                projectileColor: '#ff3366',
                damage: 20
            }
        ],

        phases: [
            { threshold: 0.5, speedMultiplier: 1.4, spawnMinions: true, minionType: 'data_fragment', minionCount: 3 },
            { threshold: 0.2, speedMultiplier: 1.8, attackCooldownMultiplier: 0.5, enrageText: 'CRITICAL MEMORY OVERFLOW!' }
        ],

        color: '#ff3366',
        glowColor: 'rgba(255, 51, 102, 0.6)',
        shape: 'heart_broken'
    },

    // ============================================
    // LAYER 5 - SESSION: Cookie Monster
    // Session Theft Specialist
    // ============================================
    boss_cookie_theft: {
        id: 'boss_cookie_theft',
        name: 'The Cookie Monster',
        subtitle: 'SESSION THEFT SPECIALIST',
        quote: '"Me want COOKIE! Me steal SESSION!"',
        layer: 5,

        health: 16,
        speed: 2.0,
        size: 65,
        points: 2200,

        movement: {
            type: 'teleport_dash',
            teleportCooldown: 3000,
            dashSpeed: 8,
            dashDuration: 300,
            verticalSpeed: 0.4,
            stopAtY: 130
        },

        attacks: [
            {
                name: 'cookie_throw',
                type: 'projectile_spread',
                cooldown: 1500,
                projectiles: 7,
                spreadAngle: 180,
                projectileSpeed: 5,
                projectileSize: 10,
                projectileColor: '#00ff88',
                damage: 10
            },
            {
                name: 'session_grab',
                type: 'pull_beam',
                cooldown: 6000,
                duration: 1000,
                pullStrength: 3,
                beamWidth: 40,
                damage: 0 // Just pulls, no damage
            }
        ],

        phases: [
            { threshold: 0.7, teleportCooldownMultiplier: 0.7 },
            { threshold: 0.4, speedMultiplier: 1.5, cloneCount: 2, enrageText: 'COOKIES EVERYWHERE!' },
            { threshold: 0.15, speedMultiplier: 2.0, attackCooldownMultiplier: 0.4 }
        ],

        color: '#00ff88',
        glowColor: 'rgba(0, 255, 136, 0.6)',
        shape: 'circle_fangs'
    },

    // ============================================
    // LAYER 4 - TRANSPORT: Captain SYN Flood
    // DDoS Commander
    // ============================================
    boss_syn_flood: {
        id: 'boss_syn_flood',
        name: 'Captain SYN Flood',
        subtitle: 'DDOS COMMANDER',
        quote: '"SYN... SYN... SYN... NO ACK FOR YOU!"',
        layer: 4,

        health: 20,
        speed: 1.0,
        size: 80,
        points: 2800,

        movement: {
            type: 'static_with_shield',
            verticalSpeed: 0.15,
            stopAtY: 90,
            shieldRotationSpeed: 0.03
        },

        attacks: [
            {
                name: 'syn_barrage',
                type: 'rapid_fire',
                cooldown: 100, // Very fast!
                burstCount: 20,
                burstCooldown: 3000,
                projectileSpeed: 6,
                projectileSize: 8,
                projectileColor: '#00ff88',
                damage: 5
            },
            {
                name: 'packet_storm',
                type: 'circular_wave',
                cooldown: 4000,
                waveCount: 3,
                projectilesPerWave: 12,
                waveDelay: 300,
                projectileSpeed: 3,
                projectileSize: 10,
                projectileColor: '#00ffaa',
                damage: 8
            },
            {
                name: 'spawn_flood',
                type: 'spawn_minions',
                cooldown: 8000,
                minionType: 'syn_packet',
                minionCount: 8,
                spawnPattern: 'circle'
            }
        ],

        phases: [
            { threshold: 0.6, shieldActive: true, shieldHealth: 50 },
            { threshold: 0.3, attackCooldownMultiplier: 0.5, minionCountMultiplier: 2, enrageText: 'INITIATING FULL FLOOD!' }
        ],

        color: '#00ffaa',
        glowColor: 'rgba(0, 255, 170, 0.6)',
        shape: 'ship'
    },

    // ============================================
    // LAYER 3 - NETWORK: The IP Masquerader
    // Identity Thief
    // ============================================
    boss_ip_masquerade: {
        id: 'boss_ip_masquerade',
        name: 'The IP Masquerader',
        subtitle: 'IDENTITY THIEF',
        quote: '"I am you. You are me. We are... CONFUSED."',
        layer: 3,

        health: 17,
        speed: 1.8,
        size: 60,
        points: 2400,

        movement: {
            type: 'mirror_player',
            mirrorDelay: 500, // ms delay in copying player
            verticalOscillation: 30,
            oscillationSpeed: 0.003
        },

        attacks: [
            {
                name: 'identity_swap',
                type: 'confusion_field',
                cooldown: 7000,
                duration: 3000,
                effectType: 'reverse_controls',
                radius: 200
            },
            {
                name: 'spoof_shot',
                type: 'projectile_aimed',
                cooldown: 2000,
                projectileSpeed: 5,
                projectileSize: 14,
                projectileColor: '#00ffff',
                damage: 18,
                aimPrediction: 0.3 // Leads target
            },
            {
                name: 'clone_army',
                type: 'spawn_clones',
                cooldown: 10000,
                cloneCount: 3,
                cloneHealth: 30,
                cloneDuration: 8000
            }
        ],

        phases: [
            { threshold: 0.5, clonesActive: 2 },
            { threshold: 0.25, invisibilityEnabled: true, invisibilityDuration: 2000, invisibilityCooldown: 5000, enrageText: 'NOW YOU SEE ME... NOW YOU DON\'T!' }
        ],

        color: '#00ffff',
        glowColor: 'rgba(0, 255, 255, 0.6)',
        shape: 'mask'
    },

    // ============================================
    // LAYER 2 - DATA LINK: ARP Table Corruptor
    // MAC Address Chaos Agent
    // ============================================
    boss_arp_flood: {
        id: 'boss_arp_flood',
        name: 'ARP Table Corruptor',
        subtitle: 'MAC ADDRESS CHAOS',
        quote: '"Your addresses belong to ME now!"',
        layer: 2,

        health: 19,
        speed: 1.4,
        size: 72,
        points: 2600,

        movement: {
            type: 'erratic_jump',
            jumpCooldown: 2000,
            jumpDistance: 100,
            baseSpeed: 0.5,
            verticalSpeed: 0.2,
            stopAtY: 110
        },

        attacks: [
            {
                name: 'arp_poison',
                type: 'ground_hazard',
                cooldown: 4000,
                hazardCount: 5,
                hazardDuration: 6000,
                hazardRadius: 40,
                damagePerSecond: 15,
                hazardColor: '#ffff00'
            },
            {
                name: 'mac_flood',
                type: 'projectile_rain',
                cooldown: 3000,
                dropCount: 10,
                dropSpeed: 4,
                dropSize: 12,
                dropColor: '#ffcc00',
                damage: 10,
                spreadWidth: 300
            },
            {
                name: 'table_corruption',
                type: 'screen_effect',
                cooldown: 12000,
                duration: 2000,
                effectType: 'static_noise',
                intensity: 0.3
            }
        ],

        phases: [
            { threshold: 0.5, hazardCountMultiplier: 1.5 },
            { threshold: 0.2, permanentHazards: true, attackCooldownMultiplier: 0.6, enrageText: 'TOTAL TABLE CORRUPTION!' }
        ],

        color: '#ffff00',
        glowColor: 'rgba(255, 255, 0, 0.6)',
        shape: 'table'
    },

    // ============================================
    // LAYER 1 - PHYSICAL: The Cable Guardian
    // Infrastructure Destroyer (FINAL BOSS)
    // ============================================
    boss_guardian: {
        id: 'boss_guardian',
        name: 'The Cable Guardian',
        subtitle: 'INFRASTRUCTURE DESTROYER',
        quote: '"I am the foundation. I am the END."',
        layer: 1,

        health: 30,
        speed: 0.8,
        size: 100,
        points: 5000,

        movement: {
            type: 'multi_phase',
            phases: [
                { type: 'slow_descent', stopAtY: 150, speed: 0.5 },
                { type: 'circular_orbit', radius: 80, speed: 0.002 },
                { type: 'aggressive_chase', speed: 2.0 }
            ]
        },

        attacks: [
            {
                name: 'power_surge',
                type: 'screen_flash',
                cooldown: 8000,
                chargeTime: 1500,
                flashDamage: 30,
                warningColor: '#ffff00'
            },
            {
                name: 'cable_whip',
                type: 'sweeping_beam',
                cooldown: 3000,
                beamLength: 250,
                beamWidth: 15,
                sweepSpeed: 0.05,
                sweepAngle: 180,
                damage: 20,
                beamColor: '#ffcc00'
            },
            {
                name: 'em_pulse',
                type: 'expanding_ring',
                cooldown: 5000,
                rings: 3,
                ringDelay: 400,
                ringSpeed: 5,
                ringWidth: 20,
                damage: 15,
                ringColor: '#ff8800'
            },
            {
                name: 'infrastructure_collapse',
                type: 'falling_debris',
                cooldown: 6000,
                debrisCount: 15,
                debrisSpeed: 3,
                debrisSize: 25,
                damage: 12,
                spreadWidth: 400
            }
        ],

        phases: [
            { threshold: 0.7, phaseIndex: 1, enrageText: 'INITIATING DEFENSIVE PROTOCOLS...' },
            { threshold: 0.4, phaseIndex: 2, shieldActive: true, shieldHealth: 80, attackCooldownMultiplier: 0.7 },
            { threshold: 0.15, phaseIndex: 2, speedMultiplier: 2.5, attackCooldownMultiplier: 0.4, enrageText: 'FINAL PROTOCOL: ANNIHILATION!' }
        ],

        color: '#ff8800',
        glowColor: 'rgba(255, 136, 0, 0.6)',
        shape: 'tower'
    }
};

/**
 * Boss Behavior Controller
 * Handles state, attacks, and phase transitions for boss enemies
 */
export class BossBehaviorController {
    constructor(bossConfig, canvasWidth, canvasHeight) {
        this.config = bossConfig;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // State
        this.currentPhase = 0;
        this.phaseTriggered = [];
        this.attackTimers = {};
        this.activeAttacks = [];
        this.projectiles = [];
        this.hazards = [];
        this.clones = [];

        // Movement state
        this.movementTimer = 0;
        this.reachedPosition = false;
        this.teleportTimer = 0;
        this.dashActive = false;
        this.dashTimer = 0;
        this.dashDirection = { x: 0, y: 0 };

        // Shield state
        this.shieldActive = false;
        this.shieldHealth = 0;
        this.shieldAngle = 0;

        // Invisibility state
        this.invisible = false;
        this.invisibilityTimer = 0;
        this.invisibilityCooldown = 0;

        // Enrage state
        this.enraged = false;
        this.enrageText = null;
        this.enrageTextTimer = 0;

        // Initialize attack timers
        if (this.config.attacks) {
            this.config.attacks.forEach(attack => {
                this.attackTimers[attack.name] = attack.cooldown * 0.5; // Start halfway through cooldown
            });
        }
    }

    /**
     * Update boss behavior
     * @param {number} deltaTime - Time since last frame
     * @param {object} enemy - The enemy entity
     * @param {object} player - The player entity
     * @returns {object} - Updates to apply and projectiles spawned
     */
    update(deltaTime, enemy, player) {
        const result = {
            projectiles: [],
            hazards: [],
            clones: [],
            screenEffect: null,
            enrageText: null
        };

        // Check phase transitions
        this.checkPhaseTransitions(enemy, result);

        // Update timers
        this.movementTimer += deltaTime;
        this.enrageTextTimer -= deltaTime;

        // Update invisibility
        this.updateInvisibility(deltaTime, enemy);

        // Update shield
        this.updateShield(deltaTime);

        // Handle movement
        this.updateMovement(deltaTime, enemy, player);

        // Handle attacks
        this.updateAttacks(deltaTime, enemy, player, result);

        // Update active projectiles
        this.updateProjectiles(deltaTime, result);

        // Update hazards
        this.updateHazards(deltaTime, result);

        return result;
    }

    /**
     * Check and trigger phase transitions based on health
     */
    checkPhaseTransitions(enemy, result) {
        if (!this.config.phases) return;

        const healthPercent = enemy.health / enemy.maxHealth;

        this.config.phases.forEach((phase, index) => {
            if (healthPercent <= phase.threshold && !this.phaseTriggered[index]) {
                this.phaseTriggered[index] = true;
                this.currentPhase = index + 1;
                this.applyPhase(phase, enemy, result);
            }
        });
    }

    /**
     * Apply phase effects
     */
    applyPhase(phase, enemy, result) {
        // Speed multiplier
        if (phase.speedMultiplier) {
            enemy.speed = enemy.baseSpeed * phase.speedMultiplier;
        }

        // Attack cooldown multiplier
        if (phase.attackCooldownMultiplier) {
            Object.keys(this.attackTimers).forEach(key => {
                this.attackTimers[key] *= phase.attackCooldownMultiplier;
            });
        }

        // Shield activation
        if (phase.shieldActive) {
            this.shieldActive = true;
            this.shieldHealth = phase.shieldHealth;
        }

        // Spawn minions
        if (phase.spawnMinions) {
            // Will be handled by WaveManager
            result.spawnMinions = {
                type: phase.minionType,
                count: phase.minionCount
            };
        }

        // Clone spawn
        if (phase.cloneCount) {
            result.spawnClones = phase.cloneCount;
        }

        // Invisibility
        if (phase.invisibilityEnabled) {
            this.invisibilityEnabled = true;
            this.invisibilityDuration = phase.invisibilityDuration;
            this.invisibilityCooldownMax = phase.invisibilityCooldown;
        }

        // Movement phase
        if (phase.phaseIndex !== undefined) {
            this.movementPhaseIndex = phase.phaseIndex;
        }

        // Enrage text
        if (phase.enrageText) {
            result.enrageText = phase.enrageText;
            this.enrageTextTimer = 2000;
            this.enraged = true;
        }
    }

    /**
     * Update movement based on movement type
     */
    updateMovement(deltaTime, enemy, player) {
        const movement = this.config.movement;
        if (!movement) return;

        // Handle dash movement
        if (this.dashActive) {
            enemy.x += this.dashDirection.x * movement.dashSpeed;
            enemy.y += this.dashDirection.y * movement.dashSpeed;
            this.dashTimer -= deltaTime;
            if (this.dashTimer <= 0) {
                this.dashActive = false;
            }
            return;
        }

        switch (movement.type) {
            case 'pendulum':
                this.movePendulum(deltaTime, enemy, movement);
                break;

            case 'figure_eight':
                this.moveFigureEight(deltaTime, enemy, movement);
                break;

            case 'teleport_dash':
                this.moveTeleportDash(deltaTime, enemy, player, movement);
                break;

            case 'static_with_shield':
                this.moveStaticWithShield(deltaTime, enemy, movement);
                break;

            case 'mirror_player':
                this.moveMirrorPlayer(deltaTime, enemy, player, movement);
                break;

            case 'erratic_jump':
                this.moveErraticJump(deltaTime, enemy, movement);
                break;

            case 'multi_phase':
                this.moveMultiPhase(deltaTime, enemy, player, movement);
                break;
        }

        // Keep in bounds
        const padding = enemy.size / 2 + 20;
        enemy.x = Math.max(padding, Math.min(this.canvasWidth - padding, enemy.x));
    }

    movePendulum(deltaTime, enemy, movement) {
        if (!this.reachedPosition && enemy.y < movement.stopAtY) {
            enemy.y += movement.verticalSpeed;
        } else {
            this.reachedPosition = true;
            const centerX = this.canvasWidth / 2;
            enemy.x = centerX + Math.sin(this.movementTimer * movement.frequency) * movement.amplitude;
        }
    }

    moveFigureEight(deltaTime, enemy, movement) {
        if (!this.reachedPosition && enemy.y < movement.stopAtY) {
            enemy.y += movement.verticalSpeed;
        } else {
            this.reachedPosition = true;
            const t = this.movementTimer * movement.frequency;
            const centerX = this.canvasWidth / 2;
            enemy.x = centerX + Math.sin(t) * movement.amplitude;
            enemy.y = movement.stopAtY + Math.sin(t * 2) * (movement.amplitude * 0.3);
        }
    }

    moveTeleportDash(deltaTime, enemy, player, movement) {
        if (!this.reachedPosition && enemy.y < movement.stopAtY) {
            enemy.y += movement.verticalSpeed;
        } else {
            this.reachedPosition = true;
            this.teleportTimer -= deltaTime;

            if (this.teleportTimer <= 0) {
                // Teleport to random position
                const oldX = enemy.x;
                enemy.x = 100 + Math.random() * (this.canvasWidth - 200);

                // Start dash towards player
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0) {
                    this.dashDirection = { x: dx / dist, y: dy / dist };
                    this.dashActive = true;
                    this.dashTimer = movement.dashDuration;
                }

                this.teleportTimer = movement.teleportCooldown *
                    (this.phaseTriggered[0] ? 0.7 : 1) *
                    (this.phaseTriggered[1] ? 0.7 : 1);
            }
        }
    }

    moveStaticWithShield(deltaTime, enemy, movement) {
        if (!this.reachedPosition && enemy.y < movement.stopAtY) {
            enemy.y += movement.verticalSpeed;
        } else {
            this.reachedPosition = true;
            this.shieldAngle += movement.shieldRotationSpeed;
        }
    }

    moveMirrorPlayer(deltaTime, enemy, player, movement) {
        // Mirror player X position with delay
        const targetX = this.canvasWidth - player.x;
        const diff = targetX - enemy.x;
        enemy.x += diff * 0.02; // Smooth follow

        // Vertical oscillation
        enemy.y = movement.stopAtY || 100;
        enemy.y += Math.sin(this.movementTimer * movement.oscillationSpeed) * movement.verticalOscillation;
    }

    moveErraticJump(deltaTime, enemy, movement) {
        if (!this.reachedPosition && enemy.y < movement.stopAtY) {
            enemy.y += movement.verticalSpeed;
        } else {
            this.reachedPosition = true;

            // Random jumps
            this.teleportTimer -= deltaTime;
            if (this.teleportTimer <= 0) {
                enemy.x += (Math.random() - 0.5) * movement.jumpDistance * 2;
                enemy.y += (Math.random() - 0.5) * movement.jumpDistance * 0.5;
                this.teleportTimer = movement.jumpCooldown;
            }

            // Slow drift
            enemy.y += Math.sin(this.movementTimer * 0.002) * 0.3;
        }
    }

    moveMultiPhase(deltaTime, enemy, player, movement) {
        const phaseIndex = this.movementPhaseIndex || 0;
        const phase = movement.phases[Math.min(phaseIndex, movement.phases.length - 1)];

        switch (phase.type) {
            case 'slow_descent':
                if (enemy.y < phase.stopAtY) {
                    enemy.y += phase.speed;
                }
                break;

            case 'circular_orbit':
                const centerX = this.canvasWidth / 2;
                const centerY = 150;
                enemy.x = centerX + Math.cos(this.movementTimer * phase.speed) * phase.radius;
                enemy.y = centerY + Math.sin(this.movementTimer * phase.speed) * phase.radius * 0.5;
                break;

            case 'aggressive_chase':
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 50) {
                    enemy.x += (dx / dist) * phase.speed;
                    enemy.y += (dy / dist) * phase.speed * 0.3;
                }
                // Keep above player
                if (enemy.y > player.y - 100) {
                    enemy.y = player.y - 100;
                }
                break;
        }
    }

    /**
     * Update attacks
     */
    updateAttacks(deltaTime, enemy, player, result) {
        if (!this.config.attacks || !this.reachedPosition) return;

        this.config.attacks.forEach(attack => {
            this.attackTimers[attack.name] -= deltaTime;

            if (this.attackTimers[attack.name] <= 0) {
                this.executeAttack(attack, enemy, player, result);

                // Reset timer with phase modifier
                let cooldown = attack.cooldown;
                this.config.phases?.forEach((phase, idx) => {
                    if (this.phaseTriggered[idx] && phase.attackCooldownMultiplier) {
                        cooldown *= phase.attackCooldownMultiplier;
                    }
                });
                this.attackTimers[attack.name] = cooldown;
            }
        });
    }

    /**
     * Execute a specific attack
     */
    executeAttack(attack, enemy, player, result) {
        switch (attack.type) {
            case 'projectile_burst':
                this.attackProjectileBurst(attack, enemy, player, result);
                break;

            case 'projectile_spread':
                this.attackProjectileSpread(attack, enemy, player, result);
                break;

            case 'projectile_aimed':
                this.attackProjectileAimed(attack, enemy, player, result);
                break;

            case 'rapid_fire':
                this.attackRapidFire(attack, enemy, player, result);
                break;

            case 'circular_wave':
                this.attackCircularWave(attack, enemy, result);
                break;

            case 'homing_projectile':
                this.attackHomingProjectile(attack, enemy, player, result);
                break;

            case 'area_drain':
                this.attackAreaDrain(attack, enemy, result);
                break;

            case 'ground_hazard':
                this.attackGroundHazard(attack, enemy, result);
                break;

            case 'projectile_rain':
                this.attackProjectileRain(attack, enemy, result);
                break;

            case 'screen_flash':
                this.attackScreenFlash(attack, enemy, result);
                break;

            case 'sweeping_beam':
                this.attackSweepingBeam(attack, enemy, result);
                break;

            case 'expanding_ring':
                this.attackExpandingRing(attack, enemy, result);
                break;

            case 'falling_debris':
                this.attackFallingDebris(attack, enemy, result);
                break;

            case 'spawn_minions':
                result.spawnMinions = {
                    type: attack.minionType,
                    count: attack.minionCount,
                    pattern: attack.spawnPattern
                };
                break;

            case 'confusion_field':
                result.screenEffect = {
                    type: attack.effectType,
                    duration: attack.duration
                };
                break;
        }
    }

    attackProjectileBurst(attack, enemy, player, result) {
        const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        const spreadRad = (attack.spreadAngle * Math.PI) / 180;
        const startAngle = angleToPlayer - spreadRad / 2;
        const angleStep = spreadRad / (attack.projectiles - 1);

        for (let i = 0; i < attack.projectiles; i++) {
            const angle = startAngle + angleStep * i;
            result.projectiles.push({
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(angle) * attack.projectileSpeed,
                vy: Math.sin(angle) * attack.projectileSpeed,
                size: attack.projectileSize,
                color: attack.projectileColor,
                damage: attack.damage,
                type: 'burst'
            });
        }
    }

    attackProjectileSpread(attack, enemy, player, result) {
        const spreadRad = (attack.spreadAngle * Math.PI) / 180;
        const startAngle = Math.PI / 2 - spreadRad / 2;
        const angleStep = spreadRad / (attack.projectiles - 1);

        for (let i = 0; i < attack.projectiles; i++) {
            const angle = startAngle + angleStep * i;
            result.projectiles.push({
                x: enemy.x,
                y: enemy.y + enemy.size / 2,
                vx: Math.cos(angle) * attack.projectileSpeed,
                vy: Math.sin(angle) * attack.projectileSpeed,
                size: attack.projectileSize,
                color: attack.projectileColor,
                damage: attack.damage,
                type: 'spread'
            });
        }
    }

    attackProjectileAimed(attack, enemy, player, result) {
        // Predict player position
        const predX = player.x + (player.vx || 0) * attack.aimPrediction * 10;
        const predY = player.y + (player.vy || 0) * attack.aimPrediction * 10;

        const angle = Math.atan2(predY - enemy.y, predX - enemy.x);

        result.projectiles.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * attack.projectileSpeed,
            vy: Math.sin(angle) * attack.projectileSpeed,
            size: attack.projectileSize,
            color: attack.projectileColor,
            damage: attack.damage,
            type: 'aimed'
        });
    }

    attackRapidFire(attack, enemy, player, result) {
        // Queue burst shots
        for (let i = 0; i < attack.burstCount; i++) {
            setTimeout(() => {
                if (this.activeAttacks) {
                    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                    const spread = (Math.random() - 0.5) * 0.2;

                    this.projectiles.push({
                        x: enemy.x,
                        y: enemy.y,
                        vx: Math.cos(angle + spread) * attack.projectileSpeed,
                        vy: Math.sin(angle + spread) * attack.projectileSpeed,
                        size: attack.projectileSize,
                        color: attack.projectileColor,
                        damage: attack.damage,
                        type: 'rapid'
                    });
                }
            }, i * attack.cooldown);
        }
    }

    attackCircularWave(attack, enemy, result) {
        for (let wave = 0; wave < attack.waveCount; wave++) {
            setTimeout(() => {
                const angleStep = (Math.PI * 2) / attack.projectilesPerWave;
                for (let i = 0; i < attack.projectilesPerWave; i++) {
                    const angle = angleStep * i + (wave * 0.2);
                    result.projectiles.push({
                        x: enemy.x,
                        y: enemy.y,
                        vx: Math.cos(angle) * attack.projectileSpeed,
                        vy: Math.sin(angle) * attack.projectileSpeed,
                        size: attack.projectileSize,
                        color: attack.projectileColor,
                        damage: attack.damage,
                        type: 'wave'
                    });
                }
            }, wave * attack.waveDelay);
        }
    }

    attackHomingProjectile(attack, enemy, player, result) {
        result.projectiles.push({
            x: enemy.x,
            y: enemy.y,
            vx: 0,
            vy: attack.projectileSpeed * 0.5,
            size: attack.projectileSize,
            color: attack.projectileColor,
            damage: attack.damage,
            type: 'homing',
            homingStrength: attack.homingStrength,
            target: player
        });
    }

    attackAreaDrain(attack, enemy, result) {
        result.hazards.push({
            x: enemy.x,
            y: enemy.y,
            radius: 0,
            maxRadius: attack.radius,
            duration: attack.duration,
            damagePerTick: attack.damagePerTick,
            tickInterval: attack.tickInterval,
            lastTick: 0,
            type: 'drain',
            color: enemy.color
        });
    }

    attackGroundHazard(attack, enemy, result) {
        for (let i = 0; i < attack.hazardCount; i++) {
            result.hazards.push({
                x: 80 + Math.random() * (this.canvasWidth - 160),
                y: this.canvasHeight - 60,
                radius: attack.hazardRadius,
                duration: attack.hazardDuration,
                damagePerSecond: attack.damagePerSecond,
                type: 'ground',
                color: attack.hazardColor
            });
        }
    }

    attackProjectileRain(attack, enemy, result) {
        const startX = enemy.x - attack.spreadWidth / 2;
        for (let i = 0; i < attack.dropCount; i++) {
            result.projectiles.push({
                x: startX + (attack.spreadWidth / attack.dropCount) * i + Math.random() * 20,
                y: -20,
                vx: 0,
                vy: attack.dropSpeed,
                size: attack.dropSize,
                color: attack.dropColor,
                damage: attack.damage,
                type: 'rain'
            });
        }
    }

    attackScreenFlash(attack, enemy, result) {
        result.screenEffect = {
            type: 'flash_warning',
            chargeTime: attack.chargeTime,
            damage: attack.flashDamage,
            color: attack.warningColor
        };
    }

    attackSweepingBeam(attack, enemy, result) {
        this.activeAttacks.push({
            type: 'beam',
            x: enemy.x,
            y: enemy.y,
            length: attack.beamLength,
            width: attack.beamWidth,
            angle: -Math.PI / 2 - (attack.sweepAngle * Math.PI / 180) / 2,
            targetAngle: -Math.PI / 2 + (attack.sweepAngle * Math.PI / 180) / 2,
            sweepSpeed: attack.sweepSpeed,
            damage: attack.damage,
            color: attack.beamColor,
            active: true
        });
    }

    attackExpandingRing(attack, enemy, result) {
        for (let i = 0; i < attack.rings; i++) {
            setTimeout(() => {
                this.activeAttacks.push({
                    type: 'ring',
                    x: enemy.x,
                    y: enemy.y,
                    radius: 0,
                    speed: attack.ringSpeed,
                    width: attack.ringWidth,
                    damage: attack.damage,
                    color: attack.ringColor,
                    maxRadius: this.canvasWidth,
                    active: true
                });
            }, i * attack.ringDelay);
        }
    }

    attackFallingDebris(attack, enemy, result) {
        for (let i = 0; i < attack.debrisCount; i++) {
            result.projectiles.push({
                x: enemy.x - attack.spreadWidth / 2 + Math.random() * attack.spreadWidth,
                y: -50 - Math.random() * 100,
                vx: (Math.random() - 0.5) * 2,
                vy: attack.debrisSpeed + Math.random(),
                size: attack.debrisSize,
                color: enemy.color,
                damage: attack.damage,
                type: 'debris',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }

    /**
     * Update invisibility state
     */
    updateInvisibility(deltaTime, enemy) {
        if (!this.invisibilityEnabled) return;

        if (this.invisible) {
            this.invisibilityTimer -= deltaTime;
            if (this.invisibilityTimer <= 0) {
                this.invisible = false;
                this.invisibilityCooldown = this.invisibilityCooldownMax;
            }
        } else {
            this.invisibilityCooldown -= deltaTime;
            if (this.invisibilityCooldown <= 0) {
                this.invisible = true;
                this.invisibilityTimer = this.invisibilityDuration;
            }
        }
    }

    /**
     * Update shield
     */
    updateShield(deltaTime) {
        if (this.shieldActive && this.config.movement?.shieldRotationSpeed) {
            this.shieldAngle += this.config.movement.shieldRotationSpeed * deltaTime / 16;
        }
    }

    /**
     * Update projectiles
     */
    updateProjectiles(deltaTime, result) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];

            // Homing behavior
            if (p.type === 'homing' && p.target) {
                const dx = p.target.x - p.x;
                const dy = p.target.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    p.vx += (dx / dist) * p.homingStrength * deltaTime;
                    p.vy += (dy / dist) * p.homingStrength * deltaTime;

                    // Normalize velocity
                    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                    if (speed > 8) {
                        p.vx = (p.vx / speed) * 8;
                        p.vy = (p.vy / speed) * 8;
                    }
                }
            }

            // Debris rotation
            if (p.rotationSpeed) {
                p.rotation += p.rotationSpeed;
            }

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Remove if off screen
            if (p.y > this.canvasHeight + 50 || p.y < -100 ||
                p.x < -50 || p.x > this.canvasWidth + 50) {
                this.projectiles.splice(i, 1);
            }
        }

        // Add to result
        result.projectiles = result.projectiles.concat(this.projectiles.map(p => ({...p})));
    }

    /**
     * Update hazards
     */
    updateHazards(deltaTime, result) {
        for (let i = this.hazards.length - 1; i >= 0; i--) {
            const h = this.hazards[i];
            h.duration -= deltaTime;

            // Expand drain areas
            if (h.type === 'drain' && h.radius < h.maxRadius) {
                h.radius += 2;
            }

            if (h.duration <= 0) {
                this.hazards.splice(i, 1);
            }
        }

        result.hazards = result.hazards.concat(this.hazards.map(h => ({...h})));
    }

    /**
     * Take damage (handle shield)
     * @returns {number} Actual damage dealt
     */
    takeDamage(amount) {
        if (this.shieldActive && this.shieldHealth > 0) {
            const shieldDamage = Math.min(this.shieldHealth, amount);
            this.shieldHealth -= shieldDamage;

            if (this.shieldHealth <= 0) {
                this.shieldActive = false;
            }

            return amount - shieldDamage;
        }
        return amount;
    }

    /**
     * Check if boss is currently invisible
     */
    isInvisible() {
        return this.invisible;
    }

    /**
     * Get visual alpha for rendering
     */
    getAlpha() {
        if (this.invisible) {
            return 0.15;
        }
        return 1;
    }

    /**
     * Draw boss-specific effects
     */
    drawEffects(ctx, enemy) {
        // Draw shield
        if (this.shieldActive && this.shieldHealth > 0) {
            this.drawShield(ctx, enemy);
        }

        // Draw active attacks (beams, rings)
        this.activeAttacks.forEach(attack => {
            if (!attack.active) return;

            if (attack.type === 'beam') {
                this.drawBeam(ctx, attack);
            } else if (attack.type === 'ring') {
                this.drawRing(ctx, attack);
            }
        });

        // Draw hazards
        this.hazards.forEach(hazard => {
            this.drawHazard(ctx, hazard);
        });
    }

    drawShield(ctx, enemy) {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(this.shieldAngle);

        const radius = enemy.size * 0.8;
        const shieldPercent = this.shieldHealth / (this.config.phases?.find(p => p.shieldHealth)?.shieldHealth || 50);

        // Shield glow
        ctx.strokeStyle = this.config.color;
        ctx.shadowColor = this.config.glowColor;
        ctx.shadowBlur = 20;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.6;

        // Draw shield segments
        const segments = 6;
        const gap = 0.1;
        const arcLength = (Math.PI * 2 / segments) - gap;

        for (let i = 0; i < segments; i++) {
            if (i / segments < shieldPercent) {
                const startAngle = (Math.PI * 2 / segments) * i;
                ctx.beginPath();
                ctx.arc(0, 0, radius, startAngle, startAngle + arcLength);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    drawBeam(ctx, beam) {
        ctx.save();
        ctx.translate(beam.x, beam.y);
        ctx.rotate(beam.angle);

        // Beam glow
        ctx.shadowColor = beam.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = beam.color;
        ctx.globalAlpha = 0.8;

        ctx.fillRect(0, -beam.width / 2, beam.length, beam.width);

        // Inner bright line
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(0, -beam.width / 6, beam.length, beam.width / 3);

        ctx.restore();
    }

    drawRing(ctx, ring) {
        ctx.save();
        ctx.strokeStyle = ring.color;
        ctx.shadowColor = ring.color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = ring.width;
        ctx.globalAlpha = 0.6;

        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    drawHazard(ctx, hazard) {
        ctx.save();

        if (hazard.type === 'drain') {
            // Expanding drain circle
            ctx.strokeStyle = hazard.color;
            ctx.shadowColor = hazard.color;
            ctx.shadowBlur = 15;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.4;

            ctx.beginPath();
            ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner pulses
            for (let r = 20; r < hazard.radius; r += 40) {
                ctx.globalAlpha = 0.2;
                ctx.beginPath();
                ctx.arc(hazard.x, hazard.y, r, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else if (hazard.type === 'ground') {
            // Ground hazard
            ctx.fillStyle = hazard.color;
            ctx.shadowColor = hazard.color;
            ctx.shadowBlur = 20;
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.2;

            ctx.beginPath();
            ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Draw projectiles
     */
    drawProjectiles(ctx) {
        this.projectiles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);

            if (p.rotation !== undefined) {
                ctx.rotate(p.rotation);
            }

            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;

            if (p.type === 'debris') {
                // Square debris
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            } else if (p.type === 'homing') {
                // Triangle homing
                ctx.beginPath();
                ctx.moveTo(0, -p.size / 2);
                ctx.lineTo(p.size / 2, p.size / 2);
                ctx.lineTo(-p.size / 2, p.size / 2);
                ctx.closePath();
                ctx.fill();
            } else {
                // Circle default
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });
    }

    /**
     * Get all active attacks for collision detection
     */
    getActiveAttacks() {
        return this.activeAttacks.filter(a => a.active);
    }

    /**
     * Get all projectiles for collision detection
     */
    getProjectiles() {
        return this.projectiles;
    }

    /**
     * Get all hazards for collision detection
     */
    getHazards() {
        return this.hazards;
    }

    /**
     * Clean up completed attacks
     */
    cleanup() {
        // Update and remove completed beam attacks
        for (let i = this.activeAttacks.length - 1; i >= 0; i--) {
            const attack = this.activeAttacks[i];

            if (attack.type === 'beam') {
                attack.angle += attack.sweepSpeed;
                if (attack.angle >= attack.targetAngle) {
                    this.activeAttacks.splice(i, 1);
                }
            } else if (attack.type === 'ring') {
                attack.radius += attack.speed;
                if (attack.radius >= attack.maxRadius) {
                    this.activeAttacks.splice(i, 1);
                }
            }
        }
    }
}

/**
 * Get boss behavior config by ID
 */
export function getBossBehavior(bossId) {
    return BOSS_BEHAVIORS[bossId] || null;
}

/**
 * Get all boss IDs
 */
export function getAllBossIds() {
    return Object.keys(BOSS_BEHAVIORS);
}
