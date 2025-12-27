// ============================================
// PLAYER CLASS - NetDefender
// Portfolio-styled player ship
// ============================================

import { CONFIG, PORTFOLIO_COLORS } from '../config/gameConfig.js';

export class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = CONFIG.PLAYER.WIDTH;
        this.height = CONFIG.PLAYER.HEIGHT;
        this.x = canvas.width / 2;
        this.y = canvas.height - 100;
        this.speed = CONFIG.PLAYER.SPEED;
        this.baseSpeed = CONFIG.PLAYER.SPEED;

        // Health
        this.health = CONFIG.PLAYER.MAX_HEALTH;
        this.maxHealth = CONFIG.PLAYER.MAX_HEALTH;

        // Combat
        this.lastShot = 0;
        this.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN;
        this.rapidFire = false;

        // Status effects
        this.invincible = false;
        this.invincibleTimer = 0;
        this.shielded = false;
        this.shieldTimer = 0;
        this.reversedControls = false;
        this.slowedDown = false;

        // Visual
        this.color = PORTFOLIO_COLORS.neonCyan;
        this.glowColor = 'rgba(0, 255, 255, 0.6)';
        this.trailPositions = [];
        this.maxTrailLength = 5;

        // Animation
        this.thrusterFlicker = 0;
    }

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
            const factor = 0.707; // 1/sqrt(2)
            dx *= factor;
            dy *= factor;
        }

        // Apply speed (affected by slow effect)
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

        this.health -= amount;
        this.invincible = true;
        this.invincibleTimer = CONFIG.PLAYER.INVINCIBILITY_DURATION;

        if (this.health <= 0) {
            this.health = 0;
            return true; // Player is dead
        }
        return false;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

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

    draw(ctx) {
        ctx.save();

        // Draw motion trail
        this.drawTrail(ctx);

        // Invincibility/shield flash effect
        const shouldHide = this.invincible && Math.floor(Date.now() / 80) % 2 === 0;
        if (!shouldHide) {
            // Draw shield aura if active
            if (this.shielded) {
                this.drawShield(ctx);
            }

            // Draw player ship
            this.drawShip(ctx);

            // Draw thrusters
            this.drawThrusters(ctx);
        }

        ctx.restore();
    }

    drawTrail(ctx) {
        this.trailPositions.forEach((pos, i) => {
            const alpha = (i / this.maxTrailLength) * 0.3;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;

            // Simplified trail shape
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y - 10);
            ctx.lineTo(pos.x - 15, pos.y + 15);
            ctx.lineTo(pos.x + 15, pos.y + 15);
            ctx.closePath();
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    drawShip(ctx) {
        // Glow effect
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 25;
        ctx.fillStyle = this.color;

        // Main triangle body
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 2);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height / 3);
        ctx.lineTo(this.x - this.width / 4, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 4, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 3);
        ctx.closePath();
        ctx.fill();

        // Inner dark detail
        ctx.shadowBlur = 0;
        ctx.fillStyle = PORTFOLIO_COLORS.black;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 4);
        ctx.lineTo(this.x - this.width / 4, this.y + this.height / 6);
        ctx.lineTo(this.x + this.width / 4, this.y + this.height / 6);
        ctx.closePath();
        ctx.fill();

        // Cockpit glow
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.height / 8, 4, 0, Math.PI * 2);
        ctx.fill();

        // Wing accents
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x - this.width / 2 - 3, this.y + 5, 6, 15);
        ctx.fillRect(this.x + this.width / 2 - 3, this.y + 5, 6, 15);
    }

    drawThrusters(ctx) {
        const flickerOffset = this.thrusterFlicker < 5 ? 3 : 0;

        // Left thruster
        const gradient1 = ctx.createLinearGradient(
            this.x - 10, this.y + this.height / 2,
            this.x - 10, this.y + this.height / 2 + 20 + flickerOffset
        );
        gradient1.addColorStop(0, this.color);
        gradient1.addColorStop(0.5, PORTFOLIO_COLORS.neonMagenta);
        gradient1.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient1;
        ctx.shadowColor = PORTFOLIO_COLORS.neonMagenta;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(this.x - 15, this.y + this.height / 2);
        ctx.lineTo(this.x - 10, this.y + this.height / 2 + 20 + flickerOffset);
        ctx.lineTo(this.x - 5, this.y + this.height / 2);
        ctx.closePath();
        ctx.fill();

        // Right thruster
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
        // Pulsing shield effect
        const pulse = Math.sin(Date.now() / 150) * 0.3 + 0.7;
        const radius = this.width * 0.8;

        ctx.strokeStyle = PORTFOLIO_COLORS.neonCyan;
        ctx.lineWidth = 3;
        ctx.shadowColor = PORTFOLIO_COLORS.neonCyan;
        ctx.shadowBlur = 20;
        ctx.globalAlpha = pulse * 0.6;

        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        ctx.globalAlpha = pulse * 0.2;
        ctx.fillStyle = PORTFOLIO_COLORS.neonCyan;
        ctx.fill();

        ctx.globalAlpha = 1;
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}
