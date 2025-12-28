// ============================================
// BOSS PROJECTILE - NetDefender
// Projectiles fired by boss enemies
// ============================================

import { PORTFOLIO_COLORS } from '../config/gameConfig.js';

export class BossProjectile {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.vx = config.vx || 0;
        this.vy = config.vy || 3;
        this.size = config.size || 12;
        this.color = config.color || '#ff0080';
        this.damage = config.damage || 10;
        this.type = config.type || 'default';

        // Homing properties
        this.homingStrength = config.homingStrength || 0;
        this.target = config.target || null;

        // Rotation for debris type
        this.rotation = config.rotation || 0;
        this.rotationSpeed = config.rotationSpeed || 0;

        // Lifetime
        this.lifetime = config.lifetime || 10000;
        this.age = 0;

        // Trail effect
        this.trail = [];
        this.maxTrailLength = 8;

        // Pulse animation
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update(deltaTime, player = null) {
        this.age += deltaTime;
        this.pulsePhase += 0.15;
        this.rotation += this.rotationSpeed;

        // Add trail point
        if (this.type !== 'debris') {
            this.trail.unshift({ x: this.x, y: this.y });
            if (this.trail.length > this.maxTrailLength) {
                this.trail.pop();
            }
        }

        // Homing behavior
        if (this.homingStrength > 0 && player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                // Gradually turn towards player
                this.vx += (dx / dist) * this.homingStrength;
                this.vy += (dy / dist) * this.homingStrength;

                // Limit max speed
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const maxSpeed = 8;
                if (speed > maxSpeed) {
                    this.vx = (this.vx / speed) * maxSpeed;
                    this.vy = (this.vy / speed) * maxSpeed;
                }
            }
        }

        // Move
        this.x += this.vx;
        this.y += this.vy;

        return this.age < this.lifetime;
    }

    draw(ctx) {
        ctx.save();

        // Draw trail first
        this.drawTrail(ctx);

        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Pulse effect
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.15;
        const drawSize = this.size * pulse;

        // Glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.color;

        switch (this.type) {
            case 'debris':
                this.drawDebris(ctx, drawSize);
                break;

            case 'homing':
                this.drawHoming(ctx, drawSize);
                break;

            case 'burst':
            case 'spread':
            case 'aimed':
                this.drawBullet(ctx, drawSize);
                break;

            case 'wave':
                this.drawWave(ctx, drawSize);
                break;

            case 'rapid':
                this.drawRapid(ctx, drawSize);
                break;

            case 'rain':
                this.drawRain(ctx, drawSize);
                break;

            default:
                this.drawDefault(ctx, drawSize);
        }

        ctx.restore();
    }

    drawTrail(ctx) {
        if (this.trail.length < 2) return;

        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineCap = 'round';

        for (let i = 0; i < this.trail.length - 1; i++) {
            const alpha = (1 - i / this.trail.length) * 0.4;
            const width = (1 - i / this.trail.length) * this.size * 0.5;

            ctx.globalAlpha = alpha;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(this.trail[i].x, this.trail[i].y);
            ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawDefault(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawDebris(ctx, size) {
        // Irregular polygon debris
        ctx.beginPath();
        const points = 5 + Math.floor(Math.random() * 3);
        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 / points) * i;
            const radius = (size / 2) * (0.7 + Math.random() * 0.3);
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Outline
        ctx.strokeStyle = PORTFOLIO_COLORS.white;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
    }

    drawHoming(ctx, size) {
        // Triangle pointing in direction of movement
        const angle = Math.atan2(this.vy, this.vx);
        ctx.rotate(angle - Math.PI / 2 - this.rotation); // Undo base rotation, apply movement direction

        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(size / 3, size / 2);
        ctx.lineTo(-size / 3, size / 2);
        ctx.closePath();
        ctx.fill();

        // Glowing trail edge
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
    }

    drawBullet(ctx, size) {
        // Elongated bullet shape
        ctx.beginPath();
        ctx.ellipse(0, 0, size / 3, size / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bright tip
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(0, -size / 4, size / 6, 0, Math.PI * 2);
        ctx.fill();
    }

    drawWave(ctx, size) {
        // Concentric ring style
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRapid(ctx, size) {
        // Small, fast bullet
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRain(ctx, size) {
        // Raindrop shape
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.quadraticCurveTo(size / 2, 0, 0, size / 2);
        ctx.quadraticCurveTo(-size / 2, 0, 0, -size / 2);
        ctx.fill();
    }

    getBounds() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }

    isOffScreen(canvasWidth, canvasHeight) {
        return (
            this.y > canvasHeight + 50 ||
            this.y < -100 ||
            this.x < -50 ||
            this.x > canvasWidth + 50
        );
    }
}

/**
 * Boss Hazard - Ground-based damage zones
 */
export class BossHazard {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.radius = config.radius || 40;
        this.maxRadius = config.maxRadius || this.radius;
        this.duration = config.duration || 5000;
        this.age = 0;
        this.type = config.type || 'ground';
        this.color = config.color || '#ffff00';

        // Damage
        this.damagePerSecond = config.damagePerSecond || 10;
        this.damagePerTick = config.damagePerTick || 5;
        this.tickInterval = config.tickInterval || 200;
        this.lastDamageTick = 0;

        // Animation
        this.pulsePhase = 0;
    }

    update(deltaTime) {
        this.age += deltaTime;
        this.pulsePhase += 0.1;

        // Expand drain type
        if (this.type === 'drain' && this.radius < this.maxRadius) {
            this.radius += 2;
        }

        return this.age < this.duration;
    }

    canDamage() {
        if (this.age - this.lastDamageTick >= this.tickInterval) {
            this.lastDamageTick = this.age;
            return true;
        }
        return false;
    }

    getDamage() {
        if (this.type === 'drain') {
            return this.damagePerTick;
        }
        return (this.damagePerSecond / 1000) * this.tickInterval;
    }

    draw(ctx) {
        ctx.save();

        const fadeAlpha = Math.min(1, (this.duration - this.age) / 500);
        ctx.globalAlpha = fadeAlpha;

        if (this.type === 'drain') {
            this.drawDrain(ctx);
        } else {
            this.drawGround(ctx);
        }

        ctx.restore();
    }

    drawDrain(ctx) {
        // Expanding drain circle with pulses
        ctx.strokeStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.lineWidth = 3;
        ctx.globalAlpha *= 0.5;

        // Main circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner pulses
        const pulseCount = 3;
        for (let i = 0; i < pulseCount; i++) {
            const pulseRadius = (this.radius / pulseCount) * (i + 1);
            const pulseAlpha = 0.3 - (i * 0.1);
            ctx.globalAlpha = pulseAlpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, pulseRadius + Math.sin(this.pulsePhase + i) * 5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawGround(ctx) {
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.2;

        // Outer glow
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 30;
        ctx.globalAlpha *= 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Inner solid
        ctx.globalAlpha = 0.5;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Warning pattern
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        const segments = 8;
        for (let i = 0; i < segments; i += 2) {
            const startAngle = (Math.PI * 2 / segments) * i + this.pulsePhase * 0.5;
            const endAngle = startAngle + (Math.PI * 2 / segments);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.7, startAngle, endAngle);
            ctx.stroke();
        }
    }

    getBounds() {
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }

    containsPoint(px, py) {
        const dx = px - this.x;
        const dy = py - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }
}

/**
 * Boss Attack Effect - Visual effects for beam attacks, rings, etc.
 */
export class BossAttackEffect {
    constructor(config) {
        this.type = config.type; // 'beam', 'ring', 'flash'
        this.x = config.x;
        this.y = config.y;
        this.color = config.color || '#ff0080';
        this.damage = config.damage || 15;
        this.active = true;

        // Beam properties
        this.length = config.length || 200;
        this.width = config.width || 20;
        this.angle = config.angle || 0;
        this.targetAngle = config.targetAngle || 0;
        this.sweepSpeed = config.sweepSpeed || 0.05;

        // Ring properties
        this.radius = config.radius || 0;
        this.maxRadius = config.maxRadius || 500;
        this.speed = config.speed || 5;

        // Flash properties
        this.chargeTime = config.chargeTime || 1500;
        this.chargeProgress = 0;
        this.flashActive = false;
    }

    update(deltaTime, sourceX, sourceY) {
        this.x = sourceX;
        this.y = sourceY;

        if (this.type === 'beam') {
            this.angle += this.sweepSpeed;
            if (this.angle >= this.targetAngle) {
                this.active = false;
            }
        } else if (this.type === 'ring') {
            this.radius += this.speed;
            if (this.radius >= this.maxRadius) {
                this.active = false;
            }
        } else if (this.type === 'flash') {
            this.chargeProgress += deltaTime;
            if (this.chargeProgress >= this.chargeTime && !this.flashActive) {
                this.flashActive = true;
            }
            if (this.chargeProgress >= this.chargeTime + 200) {
                this.active = false;
            }
        }

        return this.active;
    }

    draw(ctx, canvasWidth, canvasHeight) {
        ctx.save();

        if (this.type === 'beam') {
            this.drawBeam(ctx);
        } else if (this.type === 'ring') {
            this.drawRing(ctx);
        } else if (this.type === 'flash') {
            this.drawFlash(ctx, canvasWidth, canvasHeight);
        }

        ctx.restore();
    }

    drawBeam(ctx) {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Beam glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(0, -this.width / 2, this.length, this.width);

        // Inner bright core
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(0, -this.width / 4, this.length, this.width / 2);

        // Tip glow
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(this.length, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRing(ctx) {
        ctx.strokeStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.lineWidth = 8;
        ctx.globalAlpha = Math.max(0, 1 - this.radius / this.maxRadius);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner ring
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha *= 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawFlash(ctx, canvasWidth, canvasHeight) {
        const progress = this.chargeProgress / this.chargeTime;

        if (!this.flashActive) {
            // Charging - warning pulses
            ctx.fillStyle = this.color;
            ctx.globalAlpha = Math.sin(progress * Math.PI * 8) * 0.3;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // Source glow
            ctx.globalAlpha = progress * 0.8;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 50 + progress * 50;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 30 + progress * 50, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Flash active
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.8 - ((this.chargeProgress - this.chargeTime) / 200) * 0.8;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
    }

    // Check collision with player
    checkCollision(playerBounds) {
        if (!this.active) return false;

        if (this.type === 'beam') {
            return this.checkBeamCollision(playerBounds);
        } else if (this.type === 'ring') {
            return this.checkRingCollision(playerBounds);
        } else if (this.type === 'flash' && this.flashActive) {
            return true; // Flash hits everything
        }

        return false;
    }

    checkBeamCollision(playerBounds) {
        // Simple box check for beam
        const beamEndX = this.x + Math.cos(this.angle) * this.length;
        const beamEndY = this.y + Math.sin(this.angle) * this.length;

        // Check if player center is within beam corridor
        const playerCenterX = playerBounds.x + playerBounds.width / 2;
        const playerCenterY = playerBounds.y + playerBounds.height / 2;

        // Line-point distance
        const dx = beamEndX - this.x;
        const dy = beamEndY - this.y;
        const t = Math.max(0, Math.min(1,
            ((playerCenterX - this.x) * dx + (playerCenterY - this.y) * dy) / (dx * dx + dy * dy)
        ));

        const nearestX = this.x + t * dx;
        const nearestY = this.y + t * dy;

        const distX = playerCenterX - nearestX;
        const distY = playerCenterY - nearestY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        return distance < (this.width / 2 + playerBounds.width / 2);
    }

    checkRingCollision(playerBounds) {
        const playerCenterX = playerBounds.x + playerBounds.width / 2;
        const playerCenterY = playerBounds.y + playerBounds.height / 2;

        const dx = playerCenterX - this.x;
        const dy = playerCenterY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if player is near the ring edge
        const ringWidth = 15;
        return Math.abs(distance - this.radius) < (ringWidth + playerBounds.width / 2);
    }
}
