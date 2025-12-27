// ============================================
// PARTICLE SYSTEM - NetDefender
// Portfolio-style explosion particles
// ============================================

import { PORTFOLIO_COLORS } from '../config/gameConfig.js';

class Particle {
    constructor(x, y, color, options = {}) {
        this.x = x;
        this.y = y;
        this.color = color;

        // Velocity with spread
        const angle = options.angle ?? Math.random() * Math.PI * 2;
        const speed = options.speed ?? (3 + Math.random() * 8);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        // Properties
        this.size = options.size ?? (2 + Math.random() * 4);
        this.life = 1;
        this.decay = options.decay ?? (0.015 + Math.random() * 0.02);
        this.friction = options.friction ?? 0.97;
        this.gravity = options.gravity ?? 0;

        // Visual
        this.glow = options.glow ?? true;
        this.shape = options.shape ?? 'square'; // 'square', 'circle', 'line'
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;

        if (this.glow) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10 * this.life;
        }

        const size = this.size * this.life;

        switch (this.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'line':
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
                ctx.stroke();
                break;
            default: // square
                ctx.fillRect(this.x - size / 2, this.y - size / 2, size, size);
        }

        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 600;
    }

    // Standard explosion
    createExplosion(x, y, color, count = 20) {
        if (this.particles.length >= this.maxParticles) return;

        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color, {
                speed: 4 + Math.random() * 6,
                size: 2 + Math.random() * 4,
                decay: 0.02 + Math.random() * 0.02,
                shape: 'square'
            }));
        }
    }

    // Big boss explosion
    createBossExplosion(x, y, color) {
        // Central burst
        for (let i = 0; i < 40; i++) {
            this.particles.push(new Particle(x, y, color, {
                speed: 6 + Math.random() * 10,
                size: 3 + Math.random() * 6,
                decay: 0.012 + Math.random() * 0.015,
                shape: 'square'
            }));
        }

        // White core flash
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(x, y, '#ffffff', {
                speed: 8 + Math.random() * 8,
                size: 4 + Math.random() * 4,
                decay: 0.03 + Math.random() * 0.02,
                shape: 'circle'
            }));
        }

        // Ring of particles
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 / 16) * i;
            this.particles.push(new Particle(x, y, color, {
                angle: angle,
                speed: 12,
                size: 5,
                decay: 0.02,
                shape: 'square'
            }));
        }
    }

    // Bullet hit spark
    createSpark(x, y, color, direction = 'up') {
        const baseAngle = direction === 'up' ? -Math.PI / 2 : Math.PI / 2;

        for (let i = 0; i < 8; i++) {
            const angle = baseAngle + (Math.random() - 0.5) * Math.PI * 0.8;
            this.particles.push(new Particle(x, y, color, {
                angle: angle,
                speed: 3 + Math.random() * 4,
                size: 2 + Math.random() * 2,
                decay: 0.04 + Math.random() * 0.03,
                shape: 'line'
            }));
        }
    }

    // Power-up collect effect
    createPowerUpEffect(x, y, color, isPositive) {
        const count = isPositive ? 20 : 15;

        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color, {
                speed: 3 + Math.random() * 5,
                size: 3 + Math.random() * 3,
                decay: 0.025 + Math.random() * 0.02,
                shape: isPositive ? 'circle' : 'square'
            }));
        }

        // Inner white flash
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, '#ffffff', {
                speed: 2 + Math.random() * 3,
                size: 2 + Math.random() * 2,
                decay: 0.05,
                shape: 'circle'
            }));
        }
    }

    // Player damage effect
    createDamageEffect(x, y) {
        // Red warning particles
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(x, y, PORTFOLIO_COLORS.neonMagenta, {
                speed: 5 + Math.random() * 7,
                size: 3 + Math.random() * 4,
                decay: 0.03 + Math.random() * 0.02,
                shape: 'square'
            }));
        }
    }

    // Thruster trail effect
    createThrusterParticle(x, y) {
        if (Math.random() > 0.3) return; // Throttle for performance

        this.particles.push(new Particle(x, y, PORTFOLIO_COLORS.neonCyan, {
            angle: Math.PI / 2 + (Math.random() - 0.5) * 0.3,
            speed: 1 + Math.random() * 2,
            size: 2 + Math.random() * 2,
            decay: 0.05 + Math.random() * 0.03,
            shape: 'circle',
            glow: true
        }));
    }

    // Wave complete celebration
    createWaveCompleteEffect(canvasWidth, canvasHeight) {
        const colors = [
            PORTFOLIO_COLORS.neonCyan,
            PORTFOLIO_COLORS.neonMagenta,
            PORTFOLIO_COLORS.neonGreen,
            PORTFOLIO_COLORS.neonYellow
        ];

        // Burst from multiple points
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * canvasWidth;
            const y = canvasHeight * 0.3 + Math.random() * canvasHeight * 0.4;
            const color = colors[Math.floor(Math.random() * colors.length)];

            for (let j = 0; j < 15; j++) {
                this.particles.push(new Particle(x, y, color, {
                    speed: 4 + Math.random() * 8,
                    size: 3 + Math.random() * 4,
                    decay: 0.015 + Math.random() * 0.015,
                    gravity: 0.05,
                    shape: 'square'
                }));
            }
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }

    clear() {
        this.particles = [];
    }
}
