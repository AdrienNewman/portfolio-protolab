// ============================================
// POWERUP CLASS - NetDefender
// Collectible bonuses and maluses
// ============================================

import { POWERUPS, PORTFOLIO_COLORS } from '../config/gameConfig.js';

export class PowerUp {
    constructor(x, y, isPositive = true) {
        this.x = x;
        this.y = y;
        this.size = 28;
        this.speed = 2.5;
        this.isPositive = isPositive;

        // Select random powerup of type
        const pool = isPositive ? POWERUPS.positive : POWERUPS.negative;
        this.config = pool[Math.floor(Math.random() * pool.length)];

        this.type = this.config.type;
        this.name = this.config.name;
        this.color = this.config.color;
        this.glowColor = this.config.glow;
        this.icon = this.config.icon;
        this.value = this.config.value;
        this.duration = this.config.duration;

        // Animation
        this.rotation = 0;
        this.pulsePhase = 0;
        this.floatOffset = 0;
    }

    update() {
        this.y += this.speed;
        this.rotation += 0.05;
        this.pulsePhase += 0.15;
        this.floatOffset = Math.sin(this.pulsePhase) * 3;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y + this.floatOffset);
        ctx.rotate(this.rotation);

        // Pulsing glow intensity
        const pulseScale = 1 + Math.sin(this.pulsePhase * 2) * 0.1;
        const glowIntensity = 15 + Math.sin(this.pulsePhase) * 10;

        // Outer glow
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = glowIntensity;

        // Diamond shape
        const half = (this.size / 2) * pulseScale;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -half);
        ctx.lineTo(half, 0);
        ctx.lineTo(0, half);
        ctx.lineTo(-half, 0);
        ctx.closePath();
        ctx.fill();

        // Inner diamond
        ctx.fillStyle = PORTFOLIO_COLORS.black;
        const innerHalf = half * 0.6;
        ctx.beginPath();
        ctx.moveTo(0, -innerHalf);
        ctx.lineTo(innerHalf, 0);
        ctx.lineTo(0, innerHalf);
        ctx.lineTo(-innerHalf, 0);
        ctx.closePath();
        ctx.fill();

        // Icon
        ctx.rotate(-this.rotation); // Counter-rotate for readable text
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 14px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);

        ctx.restore();

        // Draw name below (not rotating)
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 5;
        ctx.font = 'bold 8px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.name.substring(0, 12), this.x, this.y + this.size / 2 + 12);
        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }

    isOffScreen(canvasHeight) {
        return this.y > canvasHeight + this.size;
    }

    getEffect() {
        return {
            type: this.type,
            name: this.name,
            color: this.color,
            value: this.value,
            duration: this.duration,
            isPositive: this.isPositive
        };
    }
}
