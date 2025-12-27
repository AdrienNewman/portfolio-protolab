// ============================================
// ENEMY CLASS - NetDefender
// OSI-themed cyber threats
// ============================================

import { OSI_COLORS, PORTFOLIO_COLORS } from '../config/gameConfig.js';

export class Enemy {
    constructor(config, layerLevel, x, y, canvasWidth) {
        this.x = x;
        this.y = y;
        this.canvasWidth = canvasWidth;

        // From config
        this.type = config.type;
        this.name = config.name;
        this.maxHealth = config.health;
        this.health = config.health;
        this.baseSpeed = config.speed;
        this.speed = config.speed;
        this.points = config.points;
        this.behavior = config.behavior;
        this.size = config.size || 30;

        // Layer styling
        this.layerLevel = layerLevel;
        this.layerConfig = OSI_COLORS[layerLevel];
        this.color = this.layerConfig.color;
        this.glowColor = this.layerConfig.glow;

        // Behavior state
        this.angle = Math.random() * Math.PI * 2;
        this.phaseVisible = true;
        this.phaseTimer = 0;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.teleportCooldown = 0;

        // Visual state
        this.rotation = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.damageFlash = 0;

        // Slow-mo effect from powerup
        this.slowMoMultiplier = 1;
    }

    update(deltaTime) {
        this.angle += 0.05;
        this.rotation += 0.02;
        this.pulsePhase += 0.1;

        if (this.damageFlash > 0) {
            this.damageFlash -= deltaTime;
        }

        const effectiveSpeed = this.speed * this.slowMoMultiplier;

        switch (this.behavior) {
            case 'zigzag':
                this.y += effectiveSpeed;
                this.x += Math.sin(this.angle * 3) * 3;
                break;

            case 'fast':
                this.y += effectiveSpeed * 1.2;
                break;

            case 'diagonal':
                this.y += effectiveSpeed;
                this.x += effectiveSpeed * 0.8 * this.direction;
                if (this.x < 50 || this.x > this.canvasWidth - 50) {
                    this.direction *= -1;
                }
                break;

            case 'boss':
                this.y += effectiveSpeed * 0.6;
                this.x += Math.sin(this.angle * 0.5) * 2.5;
                break;

            case 'phase':
                this.y += effectiveSpeed;
                this.phaseTimer++;
                if (this.phaseTimer > 60) {
                    this.phaseVisible = !this.phaseVisible;
                    this.phaseTimer = 0;
                }
                break;

            case 'teleport':
                this.y += effectiveSpeed;
                this.teleportCooldown--;
                if (this.teleportCooldown <= 0 && Math.random() < 0.01) {
                    this.x = 80 + Math.random() * (this.canvasWidth - 160);
                    this.teleportCooldown = 60;
                }
                break;

            case 'swarm':
                this.y += effectiveSpeed;
                this.x += Math.sin(this.angle * 5 + this.waveOffset) * 2;
                break;

            case 'wave':
                this.y += effectiveSpeed * 0.8;
                this.x += Math.sin(this.angle * 2 + this.waveOffset) * 4;
                break;

            case 'erratic':
                this.y += effectiveSpeed;
                this.x += (Math.random() - 0.5) * 8;
                // Keep in bounds
                this.x = Math.max(50, Math.min(this.canvasWidth - 50, this.x));
                break;

            case 'slow_tank':
                this.y += effectiveSpeed * 0.7;
                break;

            case 'heavy':
                this.y += effectiveSpeed * 0.8;
                this.x += Math.sin(this.angle) * 1.5;
                break;

            default:
                this.y += effectiveSpeed;
        }
    }

    takeDamage(amount = 1) {
        this.health -= amount;
        this.damageFlash = 150; // Flash duration in ms
        return this.health <= 0;
    }

    draw(ctx) {
        // Phase enemies can be invisible
        if (!this.phaseVisible && this.behavior === 'phase') {
            // Draw faint outline when phased
            ctx.globalAlpha = 0.2;
            this.drawBody(ctx);
            ctx.globalAlpha = 1;
            return;
        }

        this.drawBody(ctx);
    }

    drawBody(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Damage flash effect
        const flashActive = this.damageFlash > 0 && Math.floor(this.damageFlash / 30) % 2 === 0;
        const displayColor = flashActive ? '#ffffff' : this.color;
        const displayGlow = flashActive ? 'rgba(255, 255, 255, 0.8)' : this.glowColor;

        // Pulsing glow
        const pulseIntensity = Math.sin(this.pulsePhase) * 5 + 20;
        ctx.shadowColor = displayGlow;
        ctx.shadowBlur = pulseIntensity;

        // Draw based on enemy type
        if (this.behavior === 'boss') {
            this.drawBoss(ctx, displayColor);
        } else if (this.behavior === 'slow_tank' || this.behavior === 'heavy') {
            this.drawTank(ctx, displayColor);
        } else if (this.behavior === 'swarm') {
            this.drawSwarm(ctx, displayColor);
        } else {
            this.drawStandard(ctx, displayColor);
        }

        // Reset rotation for text
        ctx.rotate(-this.rotation);

        // Draw health bar for multi-hit enemies
        if (this.maxHealth > 1) {
            this.drawHealthBar(ctx);
        }

        // Draw name label
        this.drawLabel(ctx);

        ctx.restore();
    }

    drawStandard(ctx, color) {
        // Diamond shape
        const half = this.size / 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -half);
        ctx.lineTo(half, 0);
        ctx.lineTo(0, half);
        ctx.lineTo(-half, 0);
        ctx.closePath();
        ctx.fill();

        // Inner dark core
        ctx.fillStyle = PORTFOLIO_COLORS.black;
        ctx.beginPath();
        const inner = half * 0.5;
        ctx.moveTo(0, -inner);
        ctx.lineTo(inner, 0);
        ctx.lineTo(0, inner);
        ctx.lineTo(-inner, 0);
        ctx.closePath();
        ctx.fill();

        // Center dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBoss(ctx, color) {
        // Hexagon boss shape
        const radius = this.size / 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const px = radius * Math.cos(angle);
            const py = radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Inner hexagon
        ctx.fillStyle = PORTFOLIO_COLORS.black;
        const innerRadius = radius * 0.6;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const px = innerRadius * Math.cos(angle);
            const py = innerRadius * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Glowing core
        ctx.fillStyle = color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Corner accents
        ctx.fillStyle = color;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const px = (radius + 5) * Math.cos(angle);
            const py = (radius + 5) * Math.sin(angle);
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawTank(ctx, color) {
        // Square tank shape
        const half = this.size / 2;
        ctx.fillStyle = color;
        ctx.fillRect(-half, -half, this.size, this.size);

        // Inner square
        ctx.fillStyle = PORTFOLIO_COLORS.black;
        const innerHalf = half * 0.6;
        ctx.fillRect(-innerHalf, -innerHalf, innerHalf * 2, innerHalf * 2);

        // Corner accents
        ctx.fillStyle = color;
        const cornerSize = 8;
        ctx.fillRect(-half, -half, cornerSize, cornerSize);
        ctx.fillRect(half - cornerSize, -half, cornerSize, cornerSize);
        ctx.fillRect(-half, half - cornerSize, cornerSize, cornerSize);
        ctx.fillRect(half - cornerSize, half - cornerSize, cornerSize, cornerSize);

        // Health cores (visual indicator)
        const coreCount = Math.min(this.health, 5);
        const coreSpacing = 8;
        const startX = -((coreCount - 1) * coreSpacing) / 2;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        for (let i = 0; i < coreCount; i++) {
            ctx.beginPath();
            ctx.arc(startX + i * coreSpacing, 0, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawSwarm(ctx, color) {
        // Small triangle swarm unit
        const half = this.size / 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -half);
        ctx.lineTo(half * 0.7, half * 0.7);
        ctx.lineTo(-half * 0.7, half * 0.7);
        ctx.closePath();
        ctx.fill();
    }

    drawHealthBar(ctx) {
        const barWidth = this.size + 10;
        const barHeight = 4;
        const barY = this.size / 2 + 8;

        // Background
        ctx.fillStyle = PORTFOLIO_COLORS.grayMid;
        ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

        // Health fill
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 5;
        ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);
    }

    drawLabel(ctx) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 9px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.name.substring(0, 14), 0, this.size / 2 + 22);
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

    isCollidable() {
        // Phase enemies are not collidable when invisible
        if (this.behavior === 'phase' && !this.phaseVisible) {
            return false;
        }
        return true;
    }
}
