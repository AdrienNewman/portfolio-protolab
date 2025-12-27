// ============================================
// BULLET CLASS - NetDefender
// Neon projectiles with trail effect
// ============================================

import { CONFIG, PORTFOLIO_COLORS } from '../config/gameConfig.js';

export class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.BULLET.WIDTH;
        this.height = CONFIG.BULLET.HEIGHT;
        this.speed = CONFIG.BULLET.SPEED;
        this.color = PORTFOLIO_COLORS.neonCyan;
        this.glowColor = 'rgba(0, 255, 255, 0.7)';

        // Trail effect
        this.trail = [];
        this.maxTrailLength = 6;
    }

    update() {
        // Store position for trail
        if (this.trail.length >= this.maxTrailLength) {
            this.trail.shift();
        }
        this.trail.push({ x: this.x, y: this.y });

        // Move upward
        this.y -= this.speed;
    }

    draw(ctx) {
        ctx.save();

        // Draw trail
        this.trail.forEach((pos, i) => {
            const alpha = (i / this.maxTrailLength) * 0.5;
            const size = (i / this.maxTrailLength) * this.width;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.fillRect(
                pos.x - size / 2,
                pos.y,
                size,
                this.height * 0.6
            );
        });

        ctx.globalAlpha = 1;

        // Main bullet glow
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15;

        // Outer bullet
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x - this.width / 2,
            this.y,
            this.width,
            this.height
        );

        // White core for intensity
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.fillRect(
            this.x - 1,
            this.y + 2,
            2,
            this.height - 4
        );

        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    isOffScreen() {
        return this.y < -this.height;
    }
}
