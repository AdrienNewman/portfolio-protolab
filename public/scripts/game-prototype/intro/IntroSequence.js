// ============================================
// INTRO SEQUENCE - Le Retour d'UNIX
// Cinematic intro Star Wars style
// Flow: explosion → starfield → crawl → title → complete
// ============================================

import { PORTFOLIO_COLORS } from '../config/gameConfig.js';
import { SCENARIO_DATA } from '../data/ScenarioData.js';
import { StarWarsCrawl } from './StarWarsCrawl.js';

// Particle class for explosion effect
class IntroParticle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;

        this.color = options.color ?? PORTFOLIO_COLORS.neonCyan;
        this.size = options.size ?? 3;
        this.life = 1;
        this.decay = options.decay ?? 0.01;

        // Velocity for explosion
        const angle = options.angle ?? Math.random() * Math.PI * 2;
        const speed = options.speed ?? 0;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.friction = options.friction ?? 0.98;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;

        if (this.decay > 0) {
            this.life -= this.decay;
        }
    }

    draw(ctx) {
        if (this.life <= 0) return;

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

// Star class for starfield
class Star {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.z = Math.random() * 1000; // Profondeur
        this.size = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 0.5 + 0.2;
    }

    update(deltaTime) {
        // Les étoiles avancent vers nous (z diminue)
        this.z -= this.speed * deltaTime * 100;

        if (this.z <= 0) {
            this.reset();
            this.z = 1000;
        }
    }

    draw(ctx) {
        // Projection perspective
        const factor = 200 / this.z;
        const screenX = (this.x - this.canvas.width / 2) * factor + this.canvas.width / 2;
        const screenY = (this.y - this.canvas.height / 2) * factor + this.canvas.height / 2;
        const screenSize = this.size * factor;

        // Opacité basée sur la profondeur
        const opacity = Math.min(1, (1000 - this.z) / 500);

        if (screenX < 0 || screenX > this.canvas.width || screenY < 0 || screenY > this.canvas.height) {
            return;
        }

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(0.5, screenSize), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class IntroSequence {
    constructor(canvas, onComplete) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onComplete = onComplete;

        this.width = canvas.width;
        this.height = canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        // Phases: idle, explosion, starfield, crawl, title, complete
        this.phase = 'idle';
        this.timer = 0;
        this.phaseStartTime = 0;

        // Particles (explosion)
        this.particles = [];

        // Starfield
        this.stars = [];
        this.initStarfield();

        // Star Wars Crawl
        this.crawl = new StarWarsCrawl(canvas);

        // Title
        this.titleOpacity = 0;
        this.subtitleOpacity = 0;

        // Flash effect
        this.flashIntensity = 0;

        // Screen shake
        this.shakeIntensity = 0;
        this.shakeX = 0;
        this.shakeY = 0;

        // Packet position
        this.packetX = this.centerX;
        this.packetY = this.centerY;

        // Animation
        this.animationId = null;
        this.lastTime = 0;
        this.running = false;

        // Skip intro controls
        this.canSkip = false;
        this.waitingForInput = false;  // Écran titre attend ESPACE
        this.keyHandler = null;

        // Intro music
        this.introMusic = null;
        this.musicVolume = 0.6;
        this.musicReady = false;
        this.musicError = false;
        this.initMusic();
    }

    initMusic() {
        this.introMusic = new Audio('/audio/game/Star-wars-theme.mp3');
        this.introMusic.volume = 0;
        this.introMusic.loop = false;
        this.introMusic.preload = 'auto';

        // Écouter quand l'audio est prêt
        this.introMusic.addEventListener('canplaythrough', () => {
            this.musicReady = true;
            console.log('Intro music ready to play');
        }, { once: true });

        // Gérer les erreurs de chargement
        this.introMusic.addEventListener('error', (e) => {
            this.musicError = true;
            console.error('Intro music failed to load:', e);
        });

        // Forcer le chargement immédiat
        this.introMusic.load();
    }

    initStarfield() {
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            this.stars.push(new Star(this.canvas));
        }
    }

    resize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.crawl.resize(this.width, this.height);
    }

    start(packetScreenX, packetScreenY) {
        this.packetX = packetScreenX ?? this.centerX;
        this.packetY = packetScreenY ?? this.centerY;

        this.phase = 'explosion';
        this.timer = 0;
        this.phaseStartTime = 0;
        this.particles = [];
        this.running = true;

        // Create explosion
        this.createExplosion();

        // Start animation
        this.lastTime = performance.now();
        this.animate();

        // Start intro music
        this.playMusic();

        // Skip intro on ESC (crawl) or SPACE (title screen)
        this.keyHandler = (e) => {
            if (e.key === 'Escape' && this.canSkip && this.phase === 'crawl') {
                e.preventDefault();
                this.skipToTitle();
            }
            if (e.key === ' ' && this.waitingForInput && this.phase === 'title') {
                e.preventDefault();
                this.confirmStart();
            }
        };
        window.addEventListener('keydown', this.keyHandler);
    }

    createExplosion() {
        const colors = [
            PORTFOLIO_COLORS.neonCyan,
            PORTFOLIO_COLORS.neonMagenta,
            '#ffffff',
            '#FFE81F' // Jaune Star Wars
        ];

        // Central burst
        for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 20;
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push(new IntroParticle(this.packetX, this.packetY, {
                angle,
                speed,
                color,
                size: 2 + Math.random() * 5,
                decay: 0.008 + Math.random() * 0.008
            }));
        }

        // Ring particles
        for (let i = 0; i < 32; i++) {
            const angle = (Math.PI * 2 / 32) * i;
            this.particles.push(new IntroParticle(this.packetX, this.packetY, {
                angle,
                speed: 15,
                color: '#FFE81F',
                size: 4,
                decay: 0.015
            }));
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

        // Update particles
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => !p.isDead());

        // Update stars (always)
        this.stars.forEach(star => star.update(dt));

        switch (this.phase) {
            case 'explosion':
                this.updateExplosion(phaseTime);
                break;
            case 'starfield':
                this.updateStarfield(phaseTime);
                break;
            case 'crawl':
                this.updateCrawl(dt);
                break;
            case 'title':
                this.updateTitle(phaseTime);
                break;
        }
    }

    updateExplosion(time) {
        // Flash initial
        this.flashIntensity = Math.max(0, 1 - time * 3);
        this.shakeIntensity = Math.max(0, 20 - time * 40);

        // Lancer le crawl directement après 1 seconde
        if (time > 1.0) {
            this.phase = 'crawl';
            this.phaseStartTime = this.timer;
            this.crawl.start();
        }
    }

    updateCrawl(dt) {
        this.canSkip = true;  // Permettre le skip pendant le crawl
        const isComplete = this.crawl.update(dt);

        if (isComplete) {
            this.phase = 'title';
            this.phaseStartTime = this.timer;
            this.canSkip = false;
        }
    }

    updateTitle(time) {
        // Fade in du titre
        this.titleOpacity = Math.min(1, time * 1.5);

        // Fade in du sous-titre (décalé)
        this.subtitleOpacity = Math.min(1, (time - 0.5) * 1.5);

        // Activer l'attente d'input après 1.5s (titre visible)
        if (time > 1.5) {
            this.waitingForInput = true;
        }

        // NE PLUS terminer automatiquement - attendre ESPACE
    }

    draw() {
        const ctx = this.ctx;
        ctx.save();

        // Apply screen shake
        ctx.translate(this.shakeX, this.shakeY);

        // Clear - fond noir
        ctx.fillStyle = '#000000';
        ctx.fillRect(-10, -10, this.width + 20, this.height + 20);

        // Draw starfield (toujours visible après explosion)
        if (this.phase !== 'explosion' || this.timer > 0.3) {
            this.drawStarfield(ctx);
        }

        // Draw particles (explosion)
        this.particles.forEach(p => p.draw(ctx));

        // Draw crawl
        if (this.phase === 'crawl') {
            this.crawl.draw(ctx);

            // Skip hint
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(this.timer * 3) * 0.2;
            ctx.font = '14px "Space Mono", monospace';
            ctx.fillStyle = '#666666';
            ctx.textAlign = 'center';
            ctx.fillText('[ÉCHAP] Passer', this.centerX, this.height - 30);
            ctx.restore();
        }

        // Draw title
        if (this.phase === 'title' || this.phase === 'complete') {
            this.drawTitle(ctx);
        }

        // Draw flash overlay
        if (this.flashIntensity > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashIntensity})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        ctx.restore();
    }

    drawStarfield(ctx) {
        this.stars.forEach(star => star.draw(ctx));
    }

    drawTitle(ctx) {
        ctx.save();

        const title = SCENARIO_DATA.title;
        const subtitle = SCENARIO_DATA.subtitle;

        // Titre principal - "LE RETOUR D'UNIX"
        ctx.globalAlpha = this.titleOpacity;
        ctx.font = 'bold 72px "Bebas Neue", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glow jaune Star Wars
        ctx.shadowColor = '#FFE81F';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#FFE81F';

        ctx.fillText(title, this.centerX, this.centerY - 30);

        // Sous-titre - "Épisode IV : Un Nouvel Hyperviseur"
        ctx.globalAlpha = this.subtitleOpacity;
        ctx.font = '24px "Space Mono", monospace';
        ctx.shadowBlur = 15;
        ctx.fillStyle = PORTFOLIO_COLORS.neonCyan;
        ctx.shadowColor = PORTFOLIO_COLORS.neonCyan;

        ctx.fillText(subtitle, this.centerX, this.centerY + 40);

        // "PRESS SPACE" style arcade rétro (pulse)
        if (this.waitingForInput) {
            const pulseAlpha = 0.6 + Math.sin(this.timer * 4) * 0.4;
            ctx.globalAlpha = pulseAlpha;
            ctx.font = 'bold 20px "Space Mono", monospace';
            ctx.fillStyle = '#FFE81F';  // Jaune Star Wars
            ctx.shadowColor = '#FFE81F';
            ctx.shadowBlur = 15;
            ctx.fillText('- PRESS SPACE -', this.centerX, this.height - 80);
        }

        ctx.restore();
    }

    stop() {
        this.running = false;
        this.cleanup();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        // Stop music immediately if stop() is called
        if (this.introMusic) {
            this.introMusic.pause();
            this.introMusic.currentTime = 0;
        }
    }

    skipToTitle() {
        // Passer directement à l'écran titre
        this.phase = 'title';
        this.phaseStartTime = this.timer;
        this.canSkip = false;
        this.crawl.stop();
    }

    confirmStart() {
        // Appelé quand l'utilisateur appuie sur ESPACE sur l'écran titre
        this.phase = 'complete';
        this.running = false;
        this.cleanup();
        if (this.onComplete) {
            this.onComplete();
        }
    }

    cleanup() {
        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }
        // Fade out music
        this.fadeOutMusic();
    }

    playMusic() {
        if (!this.introMusic) return;

        // Si erreur de chargement, abandonner
        if (this.musicError) {
            console.log('Music not available (load error)');
            return;
        }

        // Reset position
        this.introMusic.currentTime = 0;
        this.introMusic.volume = 0;

        // Si déjà prêt, jouer immédiatement
        if (this.musicReady || this.introMusic.readyState >= 3) {
            this.tryPlayMusic();
        } else {
            // Sinon attendre que ce soit prêt
            console.log('Waiting for music to be ready...');
            const onReady = () => {
                this.introMusic.removeEventListener('canplaythrough', onReady);
                this.tryPlayMusic();
            };
            this.introMusic.addEventListener('canplaythrough', onReady);
        }
    }

    tryPlayMusic() {
        const playPromise = this.introMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Intro music started');
                this.fadeInMusic();
            }).catch(err => {
                // Le bouton "DÉMARRER L'INTRO" devrait avoir débloqué l'audio
                // Si on arrive ici, c'est un problème inattendu
                console.error('Intro music failed to play:', err.message);
            });
        }
    }

    fadeInMusic() {
        if (!this.introMusic) return;

        const fadeIn = setInterval(() => {
            if (this.introMusic.volume < this.musicVolume - 0.05) {
                this.introMusic.volume += 0.05;
            } else {
                this.introMusic.volume = this.musicVolume;
                clearInterval(fadeIn);
            }
        }, 50);
    }

    fadeOutMusic() {
        if (!this.introMusic) return;

        const fadeOut = setInterval(() => {
            if (this.introMusic.volume > 0.05) {
                this.introMusic.volume -= 0.05;
            } else {
                this.introMusic.volume = 0;
                this.introMusic.pause();
                clearInterval(fadeOut);
            }
        }, 30);
    }

    isComplete() {
        return this.phase === 'complete';
    }
}

// Export for window access
window.IntroSequence = IntroSequence;
