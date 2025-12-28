// ============================================
// INTRO SEQUENCE - NetDefender
// Cinematic intro when clicking the floating packet
// ============================================

import { PORTFOLIO_COLORS } from '../config/gameConfig.js';

// Particle class for intro effects
class IntroParticle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.targetX = options.targetX ?? x;
        this.targetY = options.targetY ?? y;

        this.color = options.color ?? PORTFOLIO_COLORS.neonCyan;
        this.size = options.size ?? 3;
        this.life = 1;
        this.decay = options.decay ?? 0;

        // Velocity for explosion phase
        const angle = options.angle ?? Math.random() * Math.PI * 2;
        const speed = options.speed ?? 0;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.friction = options.friction ?? 0.98;
        this.converging = false;
        this.convergeSpeed = 0.08;
        this.arrived = false;

        // For letter formation
        this.finalX = options.finalX ?? x;
        this.finalY = options.finalY ?? y;
    }

    update() {
        if (this.converging) {
            // Move towards target
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 2) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.arrived = true;
            } else {
                this.x += dx * this.convergeSpeed;
                this.y += dy * this.convergeSpeed;
            }
        } else {
            // Explosion movement
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= this.friction;
            this.vy *= this.friction;
        }

        if (this.decay > 0) {
            this.life -= this.decay;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;

        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Ship preview for intro
class IntroShip {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = canvas.width / 2;
        this.y = canvas.height + 100;
        this.targetY = canvas.height * 0.75;
        this.width = 50;
        this.height = 50;
        this.visible = false;
        this.opacity = 0;
        this.bobPhase = 0;
    }

    update() {
        if (this.visible) {
            // Move towards target Y
            this.y += (this.targetY - this.y) * 0.03;
            this.opacity = Math.min(1, this.opacity + 0.02);
            this.bobPhase += 0.05;
        }
    }

    draw(ctx) {
        if (!this.visible || this.opacity <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        const bobOffset = Math.sin(this.bobPhase) * 3;
        const x = this.x;
        const y = this.y + bobOffset;
        const w = this.width;
        const h = this.height;

        // Main body
        ctx.fillStyle = PORTFOLIO_COLORS.neonCyan;
        ctx.shadowColor = PORTFOLIO_COLORS.neonCyan;
        ctx.shadowBlur = 20;

        ctx.beginPath();
        ctx.moveTo(x, y - h / 2);
        ctx.lineTo(x + w / 3, y + h / 3);
        ctx.lineTo(x, y + h / 6);
        ctx.lineTo(x - w / 3, y + h / 3);
        ctx.closePath();
        ctx.fill();

        // Wings
        ctx.fillStyle = PORTFOLIO_COLORS.neonMagenta;
        ctx.shadowColor = PORTFOLIO_COLORS.neonMagenta;

        // Left wing
        ctx.beginPath();
        ctx.moveTo(x - w / 4, y);
        ctx.lineTo(x - w / 2, y + h / 3);
        ctx.lineTo(x - w / 4, y + h / 4);
        ctx.closePath();
        ctx.fill();

        // Right wing
        ctx.beginPath();
        ctx.moveTo(x + w / 4, y);
        ctx.lineTo(x + w / 2, y + h / 3);
        ctx.lineTo(x + w / 4, y + h / 4);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y - h / 6, 5, 0, Math.PI * 2);
        ctx.fill();

        // Thruster glow
        ctx.fillStyle = PORTFOLIO_COLORS.neonCyan;
        ctx.shadowColor = PORTFOLIO_COLORS.neonCyan;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = this.opacity * (0.5 + Math.sin(this.bobPhase * 3) * 0.3);
        ctx.beginPath();
        ctx.ellipse(x, y + h / 2, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Letter definitions for "NETDEFENDER"
const LETTER_POINTS = {
    'N': [[0,1],[0,0],[0.5,0.5],[1,0],[1,1]],
    'E': [[1,0],[0,0],[0,0.5],[0.7,0.5],[0,0.5],[0,1],[1,1]],
    'T': [[0,0],[1,0],[0.5,0],[0.5,1]],
    'D': [[0,0],[0,1],[0.7,1],[1,0.5],[0.7,0],[0,0]],
    'F': [[1,0],[0,0],[0,0.5],[0.7,0.5],[0,0.5],[0,1]],
    'R': [[0,1],[0,0],[0.7,0],[1,0.25],[0.7,0.5],[0,0.5],[0.7,0.5],[1,1]]
};

export class IntroSequence {
    constructor(canvas, onComplete) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onComplete = onComplete;

        this.width = canvas.width;
        this.height = canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        // Phases: idle, flash, glitch, converge, title, menu
        this.phase = 'idle';
        this.timer = 0;
        this.phaseStartTime = 0;

        // Particles
        this.particles = [];

        // Ship
        this.ship = new IntroShip(canvas);

        // Flash effect
        this.flashIntensity = 0;

        // Glitch effect
        this.glitchIntensity = 0;
        this.glitchOffset = 0;
        this.scanlineOffset = 0;

        // Title
        this.titleOpacity = 0;
        this.titleY = this.centerY;
        this.titleScale = 1;

        // Menu elements
        this.menuOpacity = 0;

        // Packet starting position (set when start() is called)
        this.packetX = this.centerX;
        this.packetY = this.centerY;

        // Animation frame
        this.animationId = null;
        this.lastTime = 0;
        this.running = false;

        // Screen shake
        this.shakeIntensity = 0;
        this.shakeX = 0;
        this.shakeY = 0;
    }

    resize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.ship.canvas = this.canvas;
        this.ship.x = this.centerX;
    }

    start(packetScreenX, packetScreenY) {
        // Convert screen position to canvas position
        const rect = this.canvas.getBoundingClientRect();
        this.packetX = packetScreenX ?? this.centerX;
        this.packetY = packetScreenY ?? this.centerY;

        this.phase = 'flash';
        this.timer = 0;
        this.phaseStartTime = 0;
        this.particles = [];
        this.running = true;

        // Create explosion particles
        this.createExplosion();

        // Start animation loop
        this.lastTime = performance.now();
        this.animate();
    }

    createExplosion() {
        const colors = [
            PORTFOLIO_COLORS.neonCyan,
            PORTFOLIO_COLORS.neonMagenta,
            '#ffffff'
        ];

        // Central burst
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 15;
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push(new IntroParticle(this.packetX, this.packetY, {
                angle,
                speed,
                color,
                size: 2 + Math.random() * 4,
                decay: 0.005 + Math.random() * 0.005
            }));
        }

        // Ring particles
        for (let i = 0; i < 24; i++) {
            const angle = (Math.PI * 2 / 24) * i;
            this.particles.push(new IntroParticle(this.packetX, this.packetY, {
                angle,
                speed: 12,
                color: PORTFOLIO_COLORS.neonCyan,
                size: 4,
                decay: 0.01
            }));
        }
    }

    createTitleParticles() {
        const text = 'NETDEFENDER';
        const letterWidth = 50;
        const letterHeight = 60;
        const totalWidth = text.length * letterWidth;
        const startX = this.centerX - totalWidth / 2 + letterWidth / 2;
        const baseY = this.centerY - 50;

        // Clear some particles and repurpose others
        this.particles = this.particles.filter(p => p.life > 0.5).slice(0, 100);

        // Add more particles for each letter position
        for (let i = 0; i < text.length; i++) {
            const letterX = startX + i * letterWidth;
            const letterY = baseY;

            // Create particles that will form this letter area
            for (let j = 0; j < 8; j++) {
                const offsetX = (Math.random() - 0.5) * letterWidth * 0.8;
                const offsetY = (Math.random() - 0.5) * letterHeight * 0.8;

                const particle = new IntroParticle(
                    this.centerX + (Math.random() - 0.5) * 200,
                    this.centerY + (Math.random() - 0.5) * 200,
                    {
                        targetX: letterX + offsetX,
                        targetY: letterY + offsetY,
                        color: i < 3 ? PORTFOLIO_COLORS.neonCyan : '#ffffff',
                        size: 3 + Math.random() * 2,
                        decay: 0
                    }
                );
                particle.converging = true;
                this.particles.push(particle);
            }
        }
    }

    animate() {
        if (!this.running) return;

        const now = performance.now();
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.update(dt);
        this.draw();

        if (this.phase !== 'complete') {
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }

    update(dt) {
        this.timer += dt;
        const phaseTime = this.timer - this.phaseStartTime;

        // Update screen shake
        if (this.shakeIntensity > 0) {
            this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= 0.9;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }

        switch (this.phase) {
            case 'flash':
                this.updateFlash(phaseTime);
                break;
            case 'glitch':
                this.updateGlitch(phaseTime);
                break;
            case 'converge':
                this.updateConverge(phaseTime);
                break;
            case 'title':
                this.updateTitle(phaseTime);
                break;
            case 'menu':
                this.updateMenu(phaseTime);
                break;
        }

        // Update particles
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => !p.isDead());

        // Update ship
        this.ship.update();
    }

    updateFlash(time) {
        // Initial flash
        this.flashIntensity = Math.max(0, 1 - time * 4);
        this.shakeIntensity = Math.max(0, 15 - time * 30);

        if (time > 0.3) {
            this.phase = 'glitch';
            this.phaseStartTime = this.timer;
        }
    }

    updateGlitch(time) {
        // Glitch effect
        this.glitchIntensity = 0.5 + Math.random() * 0.5;
        this.glitchOffset = Math.random() > 0.7 ? (Math.random() - 0.5) * 20 : 0;
        this.scanlineOffset += 2;

        if (time > 0.5) {
            this.phase = 'converge';
            this.phaseStartTime = this.timer;
            this.glitchIntensity = 0;
            this.createTitleParticles();
            this.ship.visible = true;
        }
    }

    updateConverge(time) {
        // Make remaining particles converge
        this.particles.forEach(p => {
            if (!p.converging) {
                p.converging = true;
                p.targetX = this.centerX + (Math.random() - 0.5) * 100;
                p.targetY = this.centerY - 50 + (Math.random() - 0.5) * 50;
            }
        });

        // Gradually reduce glitch
        this.glitchIntensity = Math.max(0, 0.3 - time * 0.5);

        if (time > 0.7) {
            this.phase = 'title';
            this.phaseStartTime = this.timer;
        }
    }

    updateTitle(time) {
        // Fade in title
        this.titleOpacity = Math.min(1, time * 2);

        // Occasional subtle glitch
        this.glitchIntensity = Math.random() > 0.95 ? 0.2 : 0;

        if (time > 1.0) {
            this.phase = 'menu';
            this.phaseStartTime = this.timer;
        }
    }

    updateMenu(time) {
        // Slide title up
        const targetTitleY = this.height * 0.2;
        this.titleY = this.lerp(this.centerY - 50, targetTitleY, Math.min(1, time * 2));

        // Fade in menu
        this.menuOpacity = Math.min(1, (time - 0.3) * 2);

        // Move ship to final position
        this.ship.targetY = this.height * 0.55;

        if (time > 1.0 && this.menuOpacity >= 1) {
            this.phase = 'complete';
            this.running = false;
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }

    draw() {
        const ctx = this.ctx;
        ctx.save();

        // Apply screen shake
        ctx.translate(this.shakeX, this.shakeY);

        // Clear
        ctx.fillStyle = '#000000';
        ctx.fillRect(-10, -10, this.width + 20, this.height + 20);

        // Draw grid background
        this.drawGrid(ctx);

        // Draw scanlines
        this.drawScanlines(ctx);

        // Draw particles
        this.particles.forEach(p => p.draw(ctx));

        // Draw ship
        this.ship.draw(ctx);

        // Draw title
        if (this.titleOpacity > 0) {
            this.drawTitle(ctx);
        }

        // Draw glitch effect
        if (this.glitchIntensity > 0) {
            this.drawGlitch(ctx);
        }

        // Draw flash overlay
        if (this.flashIntensity > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashIntensity})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        // Draw menu elements
        if (this.menuOpacity > 0) {
            this.drawMenuHints(ctx);
        }

        // Draw intercepted text during glitch phase
        if (this.phase === 'glitch') {
            this.drawInterceptedText(ctx);
        }

        ctx.restore();
    }

    drawGrid(ctx) {
        const gridSize = 30;
        const opacity = 0.03;

        ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= this.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= this.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    }

    drawScanlines(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        for (let y = this.scanlineOffset % 4; y < this.height; y += 4) {
            ctx.fillRect(0, y, this.width, 2);
        }
    }

    drawGlitch(ctx) {
        if (Math.random() > 0.5) {
            // Horizontal slice displacement
            const sliceY = Math.random() * this.height;
            const sliceHeight = 10 + Math.random() * 30;

            ctx.drawImage(
                this.canvas,
                0, sliceY, this.width, sliceHeight,
                this.glitchOffset, sliceY, this.width, sliceHeight
            );
        }

        // RGB split effect
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = this.glitchIntensity * 0.3;

        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.fillRect(2, 0, this.width, this.height);

        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.fillRect(-2, 0, this.width, this.height);

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
    }

    drawTitle(ctx) {
        ctx.save();

        const y = this.titleY;

        // Title glow
        ctx.shadowColor = PORTFOLIO_COLORS.neonCyan;
        ctx.shadowBlur = 30 * this.titleOpacity;

        // "NET" part
        ctx.font = `bold ${80 * this.titleScale}px "Bebas Neue", sans-serif`;
        ctx.fillStyle = PORTFOLIO_COLORS.neonCyan;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const netWidth = ctx.measureText('NET').width;
        const defenderWidth = ctx.measureText('DEFENDER').width;
        const totalWidth = netWidth + defenderWidth;

        ctx.globalAlpha = this.titleOpacity;
        ctx.fillText('NET', this.centerX - defenderWidth / 2, y);

        // "DEFENDER" part
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.fillText('DEFENDER', this.centerX + netWidth / 2, y);

        // Subtitle
        if (this.phase === 'menu' || this.phase === 'complete') {
            ctx.font = '16px "Space Mono", monospace';
            ctx.fillStyle = PORTFOLIO_COLORS.neonGreen;
            ctx.shadowColor = PORTFOLIO_COLORS.neonGreen;
            ctx.shadowBlur = 10;
            ctx.letterSpacing = '0.3em';
            ctx.globalAlpha = this.menuOpacity;
            ctx.fillText('O S I   L A Y E R   D E F E N S E   P R O T O C O L', this.centerX, y + 50);
        }

        ctx.restore();
    }

    drawInterceptedText(ctx) {
        ctx.save();

        ctx.font = 'bold 24px "Space Mono", monospace';
        ctx.fillStyle = PORTFOLIO_COLORS.neonMagenta;
        ctx.shadowColor = PORTFOLIO_COLORS.neonMagenta;
        ctx.shadowBlur = 20;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glitchy text position
        const offsetX = (Math.random() - 0.5) * 10 * this.glitchIntensity;
        const offsetY = (Math.random() - 0.5) * 10 * this.glitchIntensity;

        ctx.globalAlpha = 0.8 + Math.random() * 0.2;
        ctx.fillText('[ PACKET INTERCEPTED ]', this.centerX + offsetX, this.centerY + offsetY);

        ctx.restore();
    }

    drawMenuHints(ctx) {
        ctx.save();
        ctx.globalAlpha = this.menuOpacity;

        // "Press START" hint
        const pulseAlpha = 0.6 + Math.sin(this.timer * 4) * 0.4;
        ctx.font = '14px "Space Mono", monospace';
        ctx.fillStyle = `rgba(0, 255, 255, ${pulseAlpha})`;
        ctx.textAlign = 'center';
        ctx.fillText('PRESS START TO INITIALIZE DEFENSE', this.centerX, this.height * 0.85);

        // High score
        const highScore = localStorage.getItem('netdefender_highscore') || 0;
        ctx.fillStyle = 'rgba(136, 136, 136, 0.8)';
        ctx.fillText(`HIGH SCORE: ${highScore}`, this.centerX, this.height * 0.9);

        ctx.restore();
    }

    lerp(a, b, t) {
        return a + (b - a) * Math.min(1, Math.max(0, t));
    }

    stop() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    isComplete() {
        return this.phase === 'complete';
    }
}

// Export for use
window.IntroSequence = IntroSequence;
