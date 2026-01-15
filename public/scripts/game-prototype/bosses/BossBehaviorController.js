// ============================================
// BOSS BEHAVIOR CONTROLLER
// Handles state, attacks, and phase transitions
// V4.27 - Added modular behaviors system
// ============================================

import { executeAttack } from './attacks/index.js';
import { executeBehavior, behaviorStateManager } from './behaviors/index.js';

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

        // Behavior state
        this.behaviorResult = null;
        this.behaviorInvincible = false;

        // Initialize attack timers
        if (this.config.attacks) {
            this.config.attacks.forEach(attack => {
                this.attackTimers[attack.name] = attack.cooldown * 0.5;
            });
        }
    }

    /**
     * Update boss behavior
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

        // Update behaviors (new modular system)
        this.updateBehaviors(deltaTime, enemy, player, result);

        // Handle movement (may be overridden by behavior)
        if (!this.behaviorResult?.overrideMovement) {
            this.updateMovement(deltaTime, enemy, player);
        }

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
        if (phase.speedMultiplier) {
            enemy.speed = enemy.baseSpeed * phase.speedMultiplier;
        }

        if (phase.attackCooldownMultiplier) {
            Object.keys(this.attackTimers).forEach(key => {
                this.attackTimers[key] *= phase.attackCooldownMultiplier;
            });
        }

        if (phase.shieldActive) {
            this.shieldActive = true;
            this.shieldHealth = phase.shieldHealth;
        }

        if (phase.spawnMinions) {
            result.spawnMinions = {
                type: phase.minionType,
                count: phase.minionCount
            };
        }

        if (phase.cloneCount) {
            result.spawnClones = phase.cloneCount;
        }

        if (phase.invisibilityEnabled) {
            this.invisibilityEnabled = true;
            this.invisibilityDuration = phase.invisibilityDuration;
            this.invisibilityCooldownMax = phase.invisibilityCooldown;
        }

        if (phase.phaseIndex !== undefined) {
            this.movementPhaseIndex = phase.phaseIndex;
        }

        if (phase.enrageText) {
            result.enrageText = phase.enrageText;
            this.enrageTextTimer = 2000;
            this.enraged = true;
        }

        if (phase.activateAttack && this.config.phaseAttacks) {
            const newAttack = this.config.phaseAttacks[phase.activateAttack];
            if (newAttack && !this.config.attacks.find(a => a.name === newAttack.name)) {
                this.config.attacks.push(newAttack);
                this.attackTimers[newAttack.name] = newAttack.cooldown * 0.3;
            }
        }

        // ============================================
        // BOSS TRANSFORMATION (e.g., Bill Gates → Azure Cloud)
        // ============================================
        if (phase.transform && phase.transformTo && this.config[phase.transformTo]) {
            this.applyTransformation(enemy, phase.transformTo, result);
        }
    }

    /**
     * Apply visual and gameplay transformation to boss
     * Used for multi-phase bosses like Bill Gates → Azure Cloud
     */
    applyTransformation(enemy, phaseKey, result) {
        const phase2 = this.config[phaseKey];
        if (!phase2) return;

        console.log(`[BossBehavior] TRANSFORMATION: ${this.config.name} → ${phase2.name}`);

        // Update enemy visuals
        if (phase2.name) {
            enemy.displayName = phase2.name;
            enemy.displayName2 = phase2.name2 || '';
        }
        if (phase2.subtitle) {
            enemy.subtitle = phase2.subtitle;
        }
        if (phase2.color) {
            enemy.color = phase2.color;
            this.config.color = phase2.color;
        }
        if (phase2.glowColor) {
            enemy.glowColor = phase2.glowColor;
            this.config.glowColor = phase2.glowColor;
        }
        if (phase2.shape) {
            enemy.bossShape = phase2.shape;
        }
        if (phase2.portrait) {
            enemy.portrait = phase2.portrait;
        }

        // Update name for display
        if (phase2.name) {
            enemy.name = phase2.name;
        }

        // Replace attacks with phase 2 attacks
        if (phase2.attacks && phase2.attacks.length > 0) {
            // Clear old attack timers
            this.attackTimers = {};

            // Replace attacks array
            this.config.attacks = [...phase2.attacks];

            // Initialize new attack timers
            phase2.attacks.forEach(attack => {
                this.attackTimers[attack.name] = attack.cooldown * 0.5;
            });

            console.log(`[BossBehavior] New attacks: ${phase2.attacks.map(a => a.name).join(', ')}`);
        }

        // Signal transformation for visual effects
        result.transformation = {
            newName: phase2.name,
            newSubtitle: phase2.subtitle,
            newColor: phase2.color,
            newShape: phase2.shape,
            quote: phase2.quote
        };

        // Mark as transformed
        this.transformed = true;
        this.transformedPhase = phaseKey;
    }

    /**
     * Update movement based on movement type
     */
    updateMovement(deltaTime, enemy, player) {
        const movement = this.config.movement;
        if (!movement) return;

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
            case 'figure_eight_with_teleport':
                this.moveFigureEightWithTeleport(deltaTime, enemy, movement);
                break;
            case 'weave':
                this.moveWeave(deltaTime, enemy, movement);
                break;
            case 'horizontal_sweep':
                this.moveHorizontalSweep(deltaTime, enemy, movement);
                break;
            case 'slow_descent':
                this.moveSlowDescent(deltaTime, enemy, movement);
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

    moveFigureEightWithTeleport(deltaTime, enemy, movement) {
        if (!this.reachedPosition && enemy.y < movement.stopAtY) {
            enemy.y += movement.verticalSpeed;
            return;
        }
        this.reachedPosition = true;

        if (this.explorerTeleportTimer === undefined) {
            this.explorerTeleportTimer = movement.teleportCooldownMin +
                Math.random() * (movement.teleportCooldownMax - movement.teleportCooldownMin);
            this.isGlitching = false;
            this.glitchTimer = 0;
            this.teleportTargetX = enemy.x;
            this.hasJustTeleported = false;
        }

        this.explorerTeleportTimer -= deltaTime;

        if (this.explorerTeleportTimer <= 0 && !this.isGlitching) {
            this.isGlitching = true;
            this.glitchTimer = movement.teleportGlitchDuration;
            this.teleportTargetX = 100 + Math.random() * (this.canvasWidth - 200);
            this.hasJustTeleported = false;
        }

        if (this.isGlitching) {
            this.glitchTimer -= deltaTime;
            if (this.glitchTimer <= movement.teleportGlitchDuration / 2 && !this.hasJustTeleported) {
                enemy.x = this.teleportTargetX;
                this.hasJustTeleported = true;
            }
            if (this.glitchTimer <= 0) {
                this.isGlitching = false;
                this.explorerTeleportTimer = movement.teleportCooldownMin +
                    Math.random() * (movement.teleportCooldownMax - movement.teleportCooldownMin);
            }
            return;
        }

        const t = this.movementTimer * movement.frequency;
        const centerX = this.canvasWidth / 2;
        enemy.x = centerX + Math.sin(t) * movement.amplitude;
        enemy.y = movement.stopAtY + Math.sin(t * 2) * (movement.amplitude * 0.3);
    }

    moveTeleportDash(deltaTime, enemy, player, movement) {
        if (!this.reachedPosition && enemy.y < movement.stopAtY) {
            enemy.y += movement.verticalSpeed;
        } else {
            this.reachedPosition = true;
            this.teleportTimer -= deltaTime;

            if (this.teleportTimer <= 0) {
                enemy.x = 100 + Math.random() * (this.canvasWidth - 200);

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
        const targetX = this.canvasWidth - player.x;
        const diff = targetX - enemy.x;
        enemy.x += diff * 0.02;

        enemy.y = movement.stopAtY || 100;
        enemy.y += Math.sin(this.movementTimer * movement.oscillationSpeed) * movement.verticalOscillation;
    }

    moveErraticJump(deltaTime, enemy, movement) {
        if (!this.reachedPosition && enemy.y < movement.stopAtY) {
            enemy.y += movement.verticalSpeed;
        } else {
            this.reachedPosition = true;

            this.teleportTimer -= deltaTime;
            if (this.teleportTimer <= 0) {
                enemy.x += (Math.random() - 0.5) * movement.jumpDistance * 2;
                enemy.y += (Math.random() - 0.5) * movement.jumpDistance * 0.5;
                this.teleportTimer = movement.jumpCooldown;
            }

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
                if (enemy.y > player.y - 100) {
                    enemy.y = player.y - 100;
                }
                break;
        }
    }

    /**
     * Weave movement - serpentine horizontal motion (MSN Messenger)
     */
    moveWeave(deltaTime, enemy, movement) {
        // Descente initiale
        if (!this.reachedPosition && enemy.y < movement.stopAtY) {
            enemy.y += movement.verticalSpeed || 1;
        } else {
            this.reachedPosition = true;
            // Mouvement en serpentin horizontal
            const centerX = this.canvasWidth / 2;
            const t = this.movementTimer * movement.frequency;
            enemy.x = centerX + Math.sin(t) * movement.amplitude;
            // Légère oscillation verticale
            enemy.y = movement.stopAtY + Math.sin(t * 2) * 20;
        }
    }

    /**
     * Horizontal sweep - scanning left to right (Norton, Windows Update)
     */
    moveHorizontalSweep(deltaTime, enemy, movement) {
        // Descente initiale
        if (!this.reachedPosition && enemy.y < movement.stopAtY) {
            enemy.y += movement.verticalSpeed || 1;
        } else {
            this.reachedPosition = true;
            // Mouvement de balayage horizontal
            const centerX = this.canvasWidth / 2;
            const t = this.movementTimer * movement.frequency;
            // Mouvement linéaire de gauche à droite (triangle wave)
            const phase = (t % (Math.PI * 2)) / (Math.PI * 2);
            const zigzag = phase < 0.5 ? phase * 2 : 2 - phase * 2;
            enemy.x = (this.canvasWidth * 0.15) + zigzag * (this.canvasWidth * 0.7);
        }
    }

    /**
     * Slow descent - gradual downward movement (Bill Gates Phase 1)
     */
    moveSlowDescent(deltaTime, enemy, movement) {
        if (enemy.y < movement.stopAtY) {
            enemy.y += movement.speed || 0.5;
        } else {
            this.reachedPosition = true;
            // Une fois en position, léger mouvement horizontal
            const centerX = this.canvasWidth / 2;
            enemy.x = centerX + Math.sin(this.movementTimer * 0.001) * 50;
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
                executeAttack(this, attack, enemy, player, result);

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
     * Update behaviors (modular behavior system)
     */
    updateBehaviors(deltaTime, enemy, player, result) {
        if (!this.config.behavior) {
            this.behaviorResult = null;
            this.behaviorInvincible = false;
            return;
        }

        this.behaviorResult = executeBehavior(
            this,
            this.config.behavior,
            enemy,
            player,
            deltaTime,
            result
        );

        // Handle behavior effects
        if (this.behaviorResult) {
            // Invincibility from behavior
            this.behaviorInvincible = this.behaviorResult.isInvincible || false;

            // Behavior effect text
            if (result.behaviorEffect) {
                result.enrageText = result.behaviorEffect.text;
            }

            // Player damage from behavior (e.g., quarantine)
            if (result.playerDamage) {
                result.behaviorDamage = result.playerDamage;
            }

            // Quarantine bubble visual
            if (result.quarantineBubble) {
                result.specialEffects = result.specialEffects || [];
                result.specialEffects.push({
                    type: 'quarantine_bubble',
                    ...result.quarantineBubble
                });
            }

            // Quarantine target visual
            if (result.quarantineTarget) {
                result.specialEffects = result.specialEffects || [];
                result.specialEffects.push({
                    type: 'quarantine_target',
                    ...result.quarantineTarget
                });
            }
        }
    }

    /**
     * Update projectiles
     */
    updateProjectiles(deltaTime, result) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];

            if (p.type === 'homing' && p.target) {
                const dx = p.target.x - p.x;
                const dy = p.target.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    p.vx += (dx / dist) * p.homingStrength * deltaTime;
                    p.vy += (dy / dist) * p.homingStrength * deltaTime;

                    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                    if (speed > 8) {
                        p.vx = (p.vx / speed) * 8;
                        p.vy = (p.vy / speed) * 8;
                    }
                }
            }

            if (p.rotationSpeed) {
                p.rotation += p.rotationSpeed;
            }

            p.x += p.vx;
            p.y += p.vy;

            if (p.y > this.canvasHeight + 50 || p.y < -100 ||
                p.x < -50 || p.x > this.canvasWidth + 50) {
                this.projectiles.splice(i, 1);
            }
        }

        result.projectiles = result.projectiles.concat(this.projectiles.map(p => ({...p})));
    }

    /**
     * Update hazards
     */
    updateHazards(deltaTime, result) {
        for (let i = this.hazards.length - 1; i >= 0; i--) {
            const h = this.hazards[i];
            h.duration -= deltaTime;

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
     * Take damage (handle shield and behavior invincibility)
     */
    takeDamage(amount) {
        // Check behavior invincibility first
        if (this.behaviorInvincible) {
            return 0; // No damage during behavior invincibility
        }

        // Then check shield
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
     * Check if boss is currently invincible (from any source)
     */
    isInvincible() {
        return this.behaviorInvincible || (this.shieldActive && this.shieldHealth > 0);
    }

    isInvisible() {
        return this.invisible;
    }

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
        if (this.shieldActive && this.shieldHealth > 0) {
            this.drawShield(ctx, enemy);
        }

        this.activeAttacks.forEach(attack => {
            if (!attack.active) return;

            if (attack.type === 'beam') {
                this.drawBeam(ctx, attack);
            } else if (attack.type === 'ring') {
                this.drawRing(ctx, attack);
            }
        });

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

        // OPTIMISATION V4.28: shadowBlur retiré
        ctx.strokeStyle = this.config.color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.7; // Légèrement plus opaque pour compenser

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

        // OPTIMISATION V4.28: shadowBlur retiré
        ctx.fillStyle = beam.color;
        ctx.globalAlpha = 0.8;

        ctx.fillRect(0, -beam.width / 2, beam.length, beam.width);

        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(0, -beam.width / 6, beam.length, beam.width / 3);

        ctx.restore();
    }

    drawRing(ctx, ring) {
        ctx.save();
        // OPTIMISATION V4.28: shadowBlur retiré
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.width;
        ctx.globalAlpha = 0.7; // Légèrement plus opaque

        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    drawHazard(ctx, hazard) {
        ctx.save();

        // OPTIMISATION V4.28: shadowBlur désactivé, utilise alpha pour simuler le glow
        if (hazard.type === 'drain') {
            ctx.strokeStyle = hazard.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.4;

            ctx.beginPath();
            ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Réduit les cercles internes (de r += 40 à r += 60)
            for (let r = 20; r < hazard.radius; r += 60) {
                ctx.globalAlpha = 0.2;
                ctx.beginPath();
                ctx.arc(hazard.x, hazard.y, r, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else if (hazard.type === 'ground') {
            ctx.fillStyle = hazard.color;
            // OPTIMISATION: Utilise pulsePhase au lieu de Date.now()
            const pulse = hazard.pulsePhase !== undefined ? hazard.pulsePhase : 0;
            ctx.globalAlpha = 0.5 + Math.sin(pulse) * 0.2;

            ctx.beginPath();
            ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (hazard.type === 'slow_field') {
            // OPTIMISATION: Slow field simplifié - sans shadowBlur
            this.drawSlowField(ctx, hazard);
        }

        ctx.restore();
    }

    /**
     * OPTIMISATION V4.28: Rendu simplifié du slow_field
     * Évite shadowBlur coûteux, utilise des cercles concentriques
     */
    drawSlowField(ctx, hazard) {
        const pulse = hazard.pulsePhase !== undefined ? Math.sin(hazard.pulsePhase) * 0.1 : 0;
        const radius = hazard.radius * (1 + pulse);

        // Fond principal semi-transparent
        ctx.fillStyle = hazard.color;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(hazard.x, hazard.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Cercle extérieur plus visible
        ctx.strokeStyle = hazard.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(hazard.x, hazard.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Un seul cercle interne (au lieu de plusieurs)
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hazard.x, hazard.y, radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        // Texte d'avertissement (optionnel, une seule fois)
        if (hazard.warningText) {
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.8;
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(hazard.warningText, hazard.x, hazard.y);
        }
    }

    /**
     * Draw projectiles - OPTIMISATION V4.28: shadowBlur retiré
     */
    drawProjectiles(ctx) {
        this.projectiles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);

            if (p.rotation !== undefined) {
                ctx.rotate(p.rotation);
            }

            ctx.fillStyle = p.color;
            // OPTIMISATION: shadowBlur retiré (10 → 0)

            if (p.type === 'debris') {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            } else if (p.type === 'homing') {
                ctx.beginPath();
                ctx.moveTo(0, -p.size / 2);
                ctx.lineTo(p.size / 2, p.size / 2);
                ctx.lineTo(-p.size / 2, p.size / 2);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });
    }

    getActiveAttacks() {
        return this.activeAttacks.filter(a => a.active);
    }

    getProjectiles() {
        return this.projectiles;
    }

    getHazards() {
        return this.hazards;
    }

    /**
     * Clean up completed attacks
     */
    cleanup() {
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
