// ============================================
// PLAYER CLASS - NetDefender
// V5.0 - OSI Layer System "Poupée Russe"
//
// Le joueur est maintenant "OSI", une entité
// composée de 7 couches concentriques.
// Chaque couche = bouclier HP qui se débloque
// progressivement en battant les boss.
//
// Architecture modulaire :
// - OSIHealthSystem : Gestion HP multicouche
// - OSIRenderer     : Rendu visuel 7 anneaux
// - OSIEvolution    : Progression unlock
// ============================================

import { CONFIG, PORTFOLIO_COLORS } from '../config/gameConfig.js';
import { OSIHealthSystem } from './player/OSIHealthSystem.js';
import { OSIRenderer } from './player/OSIRenderer.js';
import { OSIEvolution } from './player/OSIEvolution.js';

// Feature flag pour rollback si nécessaire
const USE_OSI_SYSTEM = true;

export class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = CONFIG.PLAYER.WIDTH;
        this.height = CONFIG.PLAYER.HEIGHT;
        this.x = canvas.width / 2;
        this.y = canvas.height - 100;
        this.speed = CONFIG.PLAYER.SPEED;
        this.baseSpeed = CONFIG.PLAYER.SPEED;

        // ===== OSI MODULES =====
        if (USE_OSI_SYSTEM) {
            this.healthSystem = new OSIHealthSystem();
            this.osiRenderer = new OSIRenderer();
            this.evolution = new OSIEvolution();

            // Wire callbacks entre modules
            this.healthSystem.onLayerDestroyed = (layer) => {
                this.osiRenderer.triggerDestructionEffect(layer);
            };

            this.evolution.onLayerUnlocked = (layer, name) => {
                this.healthSystem.unlockLayer(layer);
                this.osiRenderer.triggerUnlockEffect(layer);
            };
        } else {
            // Legacy mode
            this._legacyHealth = CONFIG.PLAYER.MAX_HEALTH;
            this._legacyMaxHealth = CONFIG.PLAYER.MAX_HEALTH;
        }

        // Combat (inchangé)
        this.lastShot = 0;
        this.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN;
        this.rapidFire = false;

        // Status effects (inchangé)
        this.invincible = false;
        this.invincibleTimer = 0;
        this.shielded = false;
        this.shieldTimer = 0;
        this.reversedControls = false;
        this.slowedDown = false;

        // Visual (pour trail/thrusters - conservé)
        this.color = PORTFOLIO_COLORS.neonCyan;
        this.glowColor = 'rgba(0, 255, 255, 0.6)';
        this.trailPositions = [];
        this.maxTrailLength = 5;

        // Animation (inchangé)
        this.thrusterFlicker = 0;
    }

    // ============================================
    // BACKWARD COMPATIBLE GETTERS/SETTERS
    // Pour PlayerStateManager et autres systèmes
    // ============================================

    get health() {
        if (USE_OSI_SYSTEM) {
            return this.healthSystem.getTotalHealth();
        }
        return this._legacyHealth;
    }

    set health(value) {
        if (!USE_OSI_SYSTEM) {
            this._legacyHealth = value;
        }
        // En mode OSI, on ne peut pas setter directement
        // Les modifications passent par takeDamage/heal
    }

    get maxHealth() {
        if (USE_OSI_SYSTEM) {
            return this.healthSystem.getMaxHealth();
        }
        return this._legacyMaxHealth;
    }

    set maxHealth(value) {
        if (!USE_OSI_SYSTEM) {
            this._legacyMaxHealth = value;
        }
    }

    // ============================================
    // MOVEMENT & UPDATE (inchangé)
    // ============================================

    update(input, deltaTime) {
        // Store previous position for trail
        if (this.trailPositions.length >= this.maxTrailLength) {
            this.trailPositions.shift();
        }
        this.trailPositions.push({ x: this.x, y: this.y });

        // Calculate movement direction
        let dx = 0;
        let dy = 0;

        const leftPressed = this.reversedControls ? input.right : input.left;
        const rightPressed = this.reversedControls ? input.left : input.right;

        if (leftPressed) dx = -1;
        if (rightPressed) dx = 1;
        if (input.up) dy = -1;
        if (input.down) dy = 1;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            const factor = 0.707;
            dx *= factor;
            dy *= factor;
        }

        // Apply speed
        const currentSpeed = this.slowedDown ? this.speed * 0.5 : this.speed;
        this.x += dx * currentSpeed;
        this.y += dy * currentSpeed;

        // Boundaries
        this.x = Math.max(this.width / 2, Math.min(this.canvas.width - this.width / 2, this.x));
        this.y = Math.max(this.canvas.height * 0.4, Math.min(this.canvas.height - this.height / 2, this.y));

        // Update timers
        if (this.invincible) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }

        if (this.shielded) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) {
                this.shielded = false;
            }
        }

        // Thruster animation
        this.thrusterFlicker = (this.thrusterFlicker + 1) % 10;
    }

    // ============================================
    // COMBAT (délégué au OSIHealthSystem)
    // ============================================

    canShoot() {
        const now = Date.now();
        const cooldown = this.rapidFire ? this.shootCooldown / 2 : this.shootCooldown;
        return now - this.lastShot >= cooldown;
    }

    shoot() {
        if (this.canShoot()) {
            this.lastShot = Date.now();
            return {
                x: this.x,
                y: this.y - this.height / 2
            };
        }
        return null;
    }

    takeDamage(amount) {
        if (this.invincible || this.shielded) return false;

        let isDead = false;

        if (USE_OSI_SYSTEM) {
            const result = this.healthSystem.takeDamage(amount);
            isDead = result.isDead;
        } else {
            this._legacyHealth -= amount;
            if (this._legacyHealth <= 0) {
                this._legacyHealth = 0;
                isDead = true;
            }
        }

        // Invincibility frames
        this.invincible = true;
        this.invincibleTimer = CONFIG.PLAYER.INVINCIBILITY_DURATION;

        return isDead;
    }

    heal(amount) {
        if (USE_OSI_SYSTEM) {
            this.healthSystem.heal(amount);
        } else {
            this._legacyHealth = Math.min(this._legacyMaxHealth, this._legacyHealth + amount);
        }
    }

    // ============================================
    // OSI EVOLUTION API (nouveau)
    // ============================================

    /**
     * Appelé quand un boss est vaincu
     * @param {string} bossId - ID du boss
     * @returns {{ unlocked: boolean, layerNumber: number|null }}
     */
    onBossDefeated(bossId) {
        if (USE_OSI_SYSTEM && this.evolution) {
            return this.evolution.onBossDefeated(bossId);
        }
        return { unlocked: false, layerNumber: null };
    }

    /**
     * Retourne la progression d'évolution
     */
    getEvolutionProgress() {
        if (USE_OSI_SYSTEM && this.evolution) {
            return this.evolution.getEvolutionProgress();
        }
        return { current: 1, total: 7, percent: 14 };
    }

    /**
     * Retourne l'état de toutes les couches (pour UI)
     */
    getLayerStates() {
        if (USE_OSI_SYSTEM && this.healthSystem) {
            return this.healthSystem.getAllLayerStates();
        }
        return null;
    }

    // ============================================
    // STATUS EFFECTS (inchangé)
    // ============================================

    activateShield(duration) {
        this.shielded = true;
        this.shieldTimer = duration;
    }

    activateRapidFire(duration) {
        this.rapidFire = true;
        setTimeout(() => {
            this.rapidFire = false;
        }, duration);
    }

    activateSlow(duration) {
        this.slowedDown = true;
        setTimeout(() => {
            this.slowedDown = false;
        }, duration);
    }

    activateReverse(duration) {
        this.reversedControls = true;
        setTimeout(() => {
            this.reversedControls = false;
        }, duration);
    }

    // ============================================
    // DRAWING
    // ============================================

    draw(ctx) {
        ctx.save();

        // Motion trail (conservé)
        this.drawTrail(ctx);

        // Flash invincibility
        const shouldHide = this.invincible && Math.floor(Date.now() / 80) % 2 === 0;

        if (!shouldHide) {
            // Shield aura (conservé)
            if (this.shielded) {
                this.drawShield(ctx);
            }

            // ===== OSI LAYERS ou SHIP LEGACY =====
            if (USE_OSI_SYSTEM) {
                // Nouveau rendu : 7 anneaux concentriques
                const layerStates = this.healthSystem.getAllLayerStates();
                this.osiRenderer.draw(ctx, this.x, this.y, layerStates, 16.67);
            } else {
                // Legacy : vaisseau triangulaire
                this.drawShip(ctx);
            }

            // Thrusters (conservé)
            this.drawThrusters(ctx);
        }

        ctx.restore();
    }

    // ============================================
    // LEGACY DRAWING METHODS (conservés)
    // ============================================

    drawTrail(ctx) {
        for (let i = 0; i < this.trailPositions.length; i++) {
            const pos = this.trailPositions[i];
            const alpha = (i / this.maxTrailLength) * 0.3;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;

            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y - 10);
            ctx.lineTo(pos.x - 15, pos.y + 15);
            ctx.lineTo(pos.x + 15, pos.y + 15);
            ctx.closePath();
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    drawShip(ctx) {
        // LEGACY: Vaisseau triangulaire (pour rollback)
        const glowSize = 40;
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, glowSize
        );
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.25)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.08)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - glowSize, this.y - glowSize, glowSize * 2, glowSize * 2);

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 2);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height / 3);
        ctx.lineTo(this.x - this.width / 4, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 4, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 3);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = PORTFOLIO_COLORS.black;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 4);
        ctx.lineTo(this.x - this.width / 4, this.y + this.height / 6);
        ctx.lineTo(this.x + this.width / 4, this.y + this.height / 6);
        ctx.closePath();
        ctx.fill();

        const cockpitGlow = ctx.createRadialGradient(
            this.x, this.y - this.height / 8, 0,
            this.x, this.y - this.height / 8, 10
        );
        cockpitGlow.addColorStop(0, '#ffffff');
        cockpitGlow.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
        cockpitGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = cockpitGlow;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.height / 8, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width / 2 - 3, this.y + 5, 6, 15);
        ctx.fillRect(this.x + this.width / 2 - 3, this.y + 5, 6, 15);
    }

    drawThrusters(ctx) {
        const flickerOffset = this.thrusterFlicker < 5 ? 3 : 0;

        const gradient1 = ctx.createLinearGradient(
            this.x - 10, this.y + this.height / 2,
            this.x - 10, this.y + this.height / 2 + 20 + flickerOffset
        );
        gradient1.addColorStop(0, this.color);
        gradient1.addColorStop(0.5, PORTFOLIO_COLORS.neonMagenta);
        gradient1.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient1;
        ctx.beginPath();
        ctx.moveTo(this.x - 15, this.y + this.height / 2);
        ctx.lineTo(this.x - 10, this.y + this.height / 2 + 20 + flickerOffset);
        ctx.lineTo(this.x - 5, this.y + this.height / 2);
        ctx.closePath();
        ctx.fill();

        const gradient2 = ctx.createLinearGradient(
            this.x + 10, this.y + this.height / 2,
            this.x + 10, this.y + this.height / 2 + 20 + flickerOffset
        );
        gradient2.addColorStop(0, this.color);
        gradient2.addColorStop(0.5, PORTFOLIO_COLORS.neonMagenta);
        gradient2.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y + this.height / 2);
        ctx.lineTo(this.x + 10, this.y + this.height / 2 + 20 + flickerOffset);
        ctx.lineTo(this.x + 15, this.y + this.height / 2);
        ctx.closePath();
        ctx.fill();
    }

    drawShield(ctx) {
        const pulse = Math.sin(Date.now() / 150) * 0.3 + 0.7;
        const radius = this.width * 0.8;

        const shieldGlow = ctx.createRadialGradient(
            this.x, this.y, radius * 0.7,
            this.x, this.y, radius * 1.3
        );
        shieldGlow.addColorStop(0, 'transparent');
        shieldGlow.addColorStop(0.5, `rgba(0, 255, 255, ${0.15 * pulse})`);
        shieldGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = shieldGlow;
        ctx.fillRect(this.x - radius * 1.5, this.y - radius * 1.5, radius * 3, radius * 3);

        ctx.strokeStyle = PORTFOLIO_COLORS.neonCyan;
        ctx.lineWidth = 3;
        ctx.globalAlpha = pulse * 0.6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = pulse * 0.15;
        ctx.fillStyle = PORTFOLIO_COLORS.neonCyan;
        ctx.fill();

        ctx.globalAlpha = 1;
    }

    // ============================================
    // COLLISION
    // ============================================

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    // ============================================
    // RESET (pour nouvelle partie)
    // ============================================

    reset() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height - 100;
        this.invincible = false;
        this.shielded = false;
        this.reversedControls = false;
        this.slowedDown = false;
        this.rapidFire = false;
        this.trailPositions = [];

        if (USE_OSI_SYSTEM) {
            this.healthSystem.reset();
            this.osiRenderer.reset();
            this.evolution.reset();
        } else {
            this._legacyHealth = CONFIG.PLAYER.MAX_HEALTH;
        }
    }
}
