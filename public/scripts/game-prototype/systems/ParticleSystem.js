// ============================================
// PARTICLE SYSTEM - NetDefender
// Portfolio-style explosion particles
// V4.24 - Object pooling + swap-and-pop optimization
// ============================================

import { PORTFOLIO_COLORS } from '../config/gameConfig.js';

class Particle {
    constructor() {
        this.reset(0, 0, '#fff');
    }

    reset(x, y, color, options = {}) {
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

        // Visual - glow disabled by default for perf
        this.glow = options.glow ?? false;
        this.shape = options.shape ?? 'square'; // 'square', 'circle', 'line'

        // Pool tracking
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.life -= this.decay;

        if (this.life <= 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;

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
            default: // square - fastest
                ctx.fillRect(this.x - size / 2, this.y - size / 2, size, size);
        }
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.pool = [];
        this.maxParticles = 300;
        this.poolSize = 200;

        // Pre-allocate pool
        for (let i = 0; i < this.poolSize; i++) {
            this.pool.push(new Particle());
        }
    }

    /**
     * Get a particle from pool or create new one
     */
    _getParticle(x, y, color, options) {
        let particle;
        if (this.pool.length > 0) {
            particle = this.pool.pop();
        } else {
            particle = new Particle();
        }
        particle.reset(x, y, color, options);
        return particle;
    }

    /**
     * Return particle to pool
     */
    _returnToPool(particle) {
        particle.active = false;
        this.pool.push(particle);
    }

    // Standard explosion
    createExplosion(x, y, color, count = 20) {
        const available = this.maxParticles - this.particles.length;
        count = Math.min(count, available);
        if (count <= 0) return;

        for (let i = 0; i < count; i++) {
            this.particles.push(this._getParticle(x, y, color, {
                speed: 4 + Math.random() * 6,
                size: 2 + Math.random() * 4,
                decay: 0.02 + Math.random() * 0.02,
                shape: 'square'
            }));
        }
    }

    // Big boss explosion (optimized: 40 particles instead of 71)
    createBossExplosion(x, y, color) {
        const available = this.maxParticles - this.particles.length;
        if (available < 20) return;

        // Central burst (20 particles)
        for (let i = 0; i < 20; i++) {
            this.particles.push(this._getParticle(x, y, color, {
                speed: 6 + Math.random() * 10,
                size: 3 + Math.random() * 6,
                decay: 0.015 + Math.random() * 0.015,
                shape: 'square'
            }));
        }

        // White core flash (8 particles)
        for (let i = 0; i < 8; i++) {
            this.particles.push(this._getParticle(x, y, '#ffffff', {
                speed: 8 + Math.random() * 8,
                size: 4 + Math.random() * 4,
                decay: 0.035 + Math.random() * 0.02,
                shape: 'circle'
            }));
        }

        // Ring of particles (12 particles)
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            this.particles.push(this._getParticle(x, y, color, {
                angle: angle,
                speed: 12,
                size: 5,
                decay: 0.025,
                shape: 'square'
            }));
        }
    }

    // Bullet hit spark
    createSpark(x, y, color, direction = 'up') {
        const available = this.maxParticles - this.particles.length;
        if (available < 8) return;

        const baseAngle = direction === 'up' ? -Math.PI / 2 : Math.PI / 2;

        for (let i = 0; i < 8; i++) {
            const angle = baseAngle + (Math.random() - 0.5) * Math.PI * 0.8;
            this.particles.push(this._getParticle(x, y, color, {
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
        const count = isPositive ? 15 : 10;
        const available = this.maxParticles - this.particles.length;
        if (available < count) return;

        for (let i = 0; i < count; i++) {
            this.particles.push(this._getParticle(x, y, color, {
                speed: 3 + Math.random() * 5,
                size: 3 + Math.random() * 3,
                decay: 0.025 + Math.random() * 0.02,
                shape: isPositive ? 'circle' : 'square'
            }));
        }

        // Inner white flash (6 particles)
        for (let i = 0; i < 6; i++) {
            this.particles.push(this._getParticle(x, y, '#ffffff', {
                speed: 2 + Math.random() * 3,
                size: 2 + Math.random() * 2,
                decay: 0.05,
                shape: 'circle'
            }));
        }
    }

    // Player damage effect
    createDamageEffect(x, y) {
        const available = this.maxParticles - this.particles.length;
        if (available < 12) return;

        // Red warning particles
        for (let i = 0; i < 12; i++) {
            this.particles.push(this._getParticle(x, y, PORTFOLIO_COLORS.neonMagenta, {
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
        if (this.particles.length >= this.maxParticles) return;

        this.particles.push(this._getParticle(x, y, PORTFOLIO_COLORS.neonCyan, {
            angle: Math.PI / 2 + (Math.random() - 0.5) * 0.3,
            speed: 1 + Math.random() * 2,
            size: 2 + Math.random() * 2,
            decay: 0.05 + Math.random() * 0.03,
            shape: 'circle'
        }));
    }

    // Wave complete celebration (reduced particle count)
    createWaveCompleteEffect(canvasWidth, canvasHeight) {
        const colors = [
            PORTFOLIO_COLORS.neonCyan,
            PORTFOLIO_COLORS.neonMagenta,
            PORTFOLIO_COLORS.neonGreen,
            PORTFOLIO_COLORS.neonYellow
        ];

        // Burst from 3 points instead of 5
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * canvasWidth;
            const y = canvasHeight * 0.3 + Math.random() * canvasHeight * 0.4;
            const color = colors[Math.floor(Math.random() * colors.length)];

            // 10 particles per point instead of 15
            for (let j = 0; j < 10; j++) {
                if (this.particles.length >= this.maxParticles) return;

                this.particles.push(this._getParticle(x, y, color, {
                    speed: 4 + Math.random() * 8,
                    size: 3 + Math.random() * 4,
                    decay: 0.015 + Math.random() * 0.015,
                    gravity: 0.05,
                    shape: 'square'
                }));
            }
        }
    }

    /**
     * Update all particles with swap-and-pop removal
     * O(n) instead of O(n²) with splice
     */
    update() {
        let writeIdx = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.update();

            if (p.active) {
                // Keep particle, write to current position
                this.particles[writeIdx++] = p;
            } else {
                // Return to pool
                this._returnToPool(p);
            }
        }

        // Truncate array in O(1)
        this.particles.length = writeIdx;
    }

    /**
     * Batch draw all particles
     */
    draw(ctx) {
        if (this.particles.length === 0) return;

        ctx.save();

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].draw(ctx);
        }

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    /**
     * Clear all particles and return to pool
     */
    clear() {
        while (this.particles.length > 0) {
            this._returnToPool(this.particles.pop());
        }
    }

    /**
     * Get current stats for debugging
     */
    getStats() {
        return {
            active: this.particles.length,
            pooled: this.pool.length,
            max: this.maxParticles
        };
    }
}
