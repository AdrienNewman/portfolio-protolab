// ============================================
// NETDEFENDER - Main Game Class
// OSI Layer Defense Game for Portfolio
// ============================================

import { CONFIG, PORTFOLIO_COLORS, POWERUPS } from './config/gameConfig.js';
import { Player } from './entities/Player.js';
import { Bullet } from './entities/Bullet.js';
import { PowerUp } from './entities/PowerUp.js';
import { InputHandler } from './systems/InputHandler.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { WaveManager } from './systems/WaveManager.js';
import { AudioManager } from './systems/AudioManager.js';
import { ScreenShake } from './effects/ScreenShake.js';
import { GridBackground } from './effects/GridBackground.js';

export class NetDefender {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('NetDefender: Canvas not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Game state
        this.state = 'start'; // start, playing, paused, gameover, victory, transition
        this.score = 0;
        this.highScore = this.loadHighScore();

        // Core systems
        this.inputHandler = new InputHandler(this.canvas);
        this.particleSystem = new ParticleSystem();
        this.waveManager = new WaveManager(this.canvas);
        this.audioManager = new AudioManager();

        // Effects
        this.screenShake = new ScreenShake();
        this.gridBackground = new GridBackground(this.canvas);

        // Entities
        this.player = null;
        this.bullets = [];
        this.powerUps = [];

        // Timing
        this.lastTime = 0;
        this.powerUpSpawnTimer = 0;
        this.powerUpSpawnInterval = 8000 + Math.random() * 5000;

        // Active effects
        this.slowMoActive = false;
        this.slowMoTimer = 0;

        // UI Callbacks (set by GameOverlay)
        this.onScoreUpdate = null;
        this.onHealthUpdate = null;
        this.onWaveUpdate = null;
        this.onGameOver = null;
        this.onVictory = null;
        this.onPause = null;

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);

        // Handle resize
        window.addEventListener('resize', () => this.resize());

        console.log('NetDefender: Initialized');
    }

    resize() {
        // Match canvas to container
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth || window.innerWidth;
            this.canvas.height = container.clientHeight || window.innerHeight;
        } else {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        if (this.gridBackground) {
            this.gridBackground.resize();
        }

        if (this.player) {
            // Keep player in bounds after resize
            this.player.x = Math.min(this.player.x, this.canvas.width - this.player.width / 2);
            this.player.y = Math.min(this.player.y, this.canvas.height - this.player.height / 2);
        }
    }

    start() {
        // Reset game state
        this.score = 0;
        this.state = 'playing';
        this.bullets = [];
        this.powerUps = [];
        this.powerUpSpawnTimer = 0;
        this.slowMoActive = false;

        // Initialize player
        this.player = new Player(this.canvas);
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 100;

        // Start first wave
        this.waveManager.startWave(1);
        this.gridBackground.setLayerColor(7);

        // Resume audio context
        this.audioManager.resume();

        // Update UI
        this.updateUI();

        // Start game loop if not running
        if (!this.animationId) {
            this.lastTime = performance.now();
            this.gameLoop(this.lastTime);
        }

        console.log('NetDefender: Game started');
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Handle pause toggle
        if (this.inputHandler.consumePause() && this.state === 'playing') {
            this.pause();
        }

        // Update game state
        if (this.state === 'playing') {
            this.update(deltaTime);
        } else if (this.state === 'transition') {
            this.updateTransition(deltaTime);
        }

        // Render
        this.render();

        // Continue loop
        this.animationId = requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        // Apply slow-mo effect
        const effectiveDelta = this.slowMoActive ? deltaTime * 0.4 : deltaTime;

        // Update slow-mo timer
        if (this.slowMoActive) {
            this.slowMoTimer -= deltaTime;
            if (this.slowMoTimer <= 0) {
                this.slowMoActive = false;
                this.waveManager.removeSlowMo();
            }
        }

        // Update systems
        this.screenShake.update();
        this.gridBackground.update();
        this.particleSystem.update();

        // Update player
        this.player.update(this.inputHandler, deltaTime);

        // Player shooting
        if (this.inputHandler.shoot) {
            const bulletPos = this.player.shoot();
            if (bulletPos) {
                this.bullets.push(new Bullet(bulletPos.x, bulletPos.y));
                this.audioManager.playShoot();

                // Thruster particles
                this.particleSystem.createThrusterParticle(
                    this.player.x - 10,
                    this.player.y + this.player.height / 2
                );
                this.particleSystem.createThrusterParticle(
                    this.player.x + 10,
                    this.player.y + this.player.height / 2
                );
            }
        }

        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].isOffScreen()) {
                this.bullets.splice(i, 1);
            }
        }

        // Update wave manager (enemies)
        this.waveManager.update(effectiveDelta);

        // Update power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].update();
            if (this.powerUps[i].isOffScreen(this.canvas.height)) {
                this.powerUps.splice(i, 1);
            }
        }

        // Spawn power-ups
        this.powerUpSpawnTimer += deltaTime;
        if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval) {
            this.spawnPowerUp();
            this.powerUpSpawnTimer = 0;
            this.powerUpSpawnInterval = 8000 + Math.random() * 5000;
        }

        // Check collisions
        this.checkCollisions();

        // Check wave completion
        if (this.waveManager.waveComplete) {
            this.onWaveComplete();
        }
    }

    updateTransition(deltaTime) {
        const complete = this.waveManager.updateTransition(deltaTime);
        if (complete) {
            // Start next wave
            const nextWave = this.waveManager.getCurrentWaveNumber() + 1;
            const started = this.waveManager.startWave(nextWave);

            if (started) {
                this.state = 'playing';
                this.gridBackground.setLayerColor(this.waveManager.currentLayer.level);
                this.updateUI();
            } else {
                // All waves complete - victory!
                this.victory();
            }
        }
    }

    checkCollisions() {
        const enemies = this.waveManager.enemies;

        // Bullets vs Enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            const bulletBounds = bullet.getBounds();

            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];

                if (!enemy.isCollidable()) continue;

                const enemyBounds = enemy.getBounds();

                if (this.intersects(bulletBounds, enemyBounds)) {
                    // Hit!
                    this.particleSystem.createSpark(bullet.x, bullet.y, enemy.color, 'up');
                    this.bullets.splice(i, 1);

                    const killed = enemy.takeDamage();

                    if (killed) {
                        // Enemy destroyed
                        this.score += enemy.points;

                        if (enemy.behavior === 'boss') {
                            this.particleSystem.createBossExplosion(enemy.x, enemy.y, enemy.color);
                            this.screenShake.triggerHeavy();
                            this.audioManager.playExplosion(true);
                        } else {
                            this.particleSystem.createExplosion(enemy.x, enemy.y, enemy.color);
                            this.screenShake.triggerMedium();
                            this.audioManager.playExplosion(false);
                        }

                        this.waveManager.removeEnemy(j);
                        this.updateUI();
                    } else {
                        this.screenShake.triggerLight();
                    }

                    break;
                }
            }
        }

        // Enemies reaching bottom (damage player)
        const playerBounds = this.player.getBounds();

        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];

            if (enemy.isOffScreen(this.canvas.height)) {
                // Enemy passed - damage player
                const isDead = this.player.takeDamage(10);
                this.particleSystem.createDamageEffect(this.player.x, this.player.y);
                this.screenShake.triggerMedium();
                this.audioManager.playDamage();
                this.updateUI();

                if (isDead) {
                    this.gameOver();
                    return;
                }

                this.waveManager.removeEnemy(i);
                continue;
            }

            // Direct collision with player
            if (enemy.isCollidable()) {
                const enemyBounds = enemy.getBounds();

                if (this.intersects(playerBounds, enemyBounds)) {
                    const isDead = this.player.takeDamage(15);
                    this.particleSystem.createDamageEffect(this.player.x, this.player.y);
                    this.particleSystem.createExplosion(enemy.x, enemy.y, enemy.color);
                    this.screenShake.triggerHeavy();
                    this.audioManager.playDamage();
                    this.waveManager.removeEnemy(i);
                    this.updateUI();

                    if (isDead) {
                        this.gameOver();
                        return;
                    }
                }
            }
        }

        // PowerUps vs Player
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            const powerUpBounds = powerUp.getBounds();

            if (this.intersects(playerBounds, powerUpBounds)) {
                this.applyPowerUp(powerUp);
                this.powerUps.splice(i, 1);
            }
        }
    }

    intersects(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    spawnPowerUp() {
        const isPositive = Math.random() > 0.35; // 65% positive
        const x = 60 + Math.random() * (this.canvas.width - 120);
        this.powerUps.push(new PowerUp(x, -30, isPositive));
    }

    applyPowerUp(powerUp) {
        const effect = powerUp.getEffect();

        // Visual feedback
        this.particleSystem.createPowerUpEffect(powerUp.x, powerUp.y, effect.color, effect.isPositive);
        this.audioManager.playPowerUp(effect.isPositive);

        // Apply effect
        switch (effect.type) {
            case 'heal':
                this.player.heal(effect.value);
                break;
            case 'shield':
                this.player.activateShield(effect.duration);
                break;
            case 'slowmo':
                this.slowMoActive = true;
                this.slowMoTimer = effect.duration;
                this.waveManager.applySlowMo(0.4);
                break;
            case 'rapid_fire':
                this.player.activateRapidFire(effect.duration);
                break;
            case 'damage':
                const isDead = this.player.takeDamage(effect.value);
                this.particleSystem.createDamageEffect(this.player.x, this.player.y);
                this.screenShake.triggerMedium();
                if (isDead) {
                    this.gameOver();
                    return;
                }
                break;
            case 'slow':
                this.player.activateSlow(effect.duration);
                break;
            case 'reverse':
                this.player.activateReverse(effect.duration);
                break;
        }

        this.updateUI();

        // Show notification (callback to UI)
        if (this.onPowerUpCollect) {
            this.onPowerUpCollect(effect.name, effect.color, effect.isPositive);
        }
    }

    onWaveComplete() {
        this.audioManager.playWaveComplete();
        this.particleSystem.createWaveCompleteEffect(this.canvas.width, this.canvas.height);

        // Check if all waves done
        if (this.waveManager.getCurrentWaveNumber() >= this.waveManager.getTotalWaves()) {
            this.victory();
        } else {
            // Start transition to next wave
            this.state = 'transition';
            this.waveManager.startTransition();
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = PORTFOLIO_COLORS.black;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply screen shake
        this.ctx.save();
        this.screenShake.apply(this.ctx);

        // Draw background
        this.gridBackground.draw(this.ctx);

        // Draw game objects
        if (this.state === 'playing' || this.state === 'transition' || this.state === 'paused') {
            // Power-ups
            this.powerUps.forEach(p => p.draw(this.ctx));

            // Bullets
            this.bullets.forEach(b => b.draw(this.ctx));

            // Enemies
            this.waveManager.enemies.forEach(e => e.draw(this.ctx));

            // Player
            if (this.player) {
                this.player.draw(this.ctx);
            }

            // Particles (on top)
            this.particleSystem.draw(this.ctx);
        }

        // Reset screen shake
        this.screenShake.reset(this.ctx);
        this.ctx.restore();

        // Draw wave transition overlay
        if (this.state === 'transition') {
            this.waveManager.drawTransition(this.ctx);
        }

        // Draw slow-mo indicator
        if (this.slowMoActive) {
            this.drawSlowMoIndicator();
        }
    }

    drawSlowMoIndicator() {
        const remaining = this.slowMoTimer / 4000; // Normalize to max duration
        const barWidth = 200;
        const barHeight = 6;
        const x = (this.canvas.width - barWidth) / 2;
        const y = this.canvas.height - 50;

        // Background
        this.ctx.fillStyle = PORTFOLIO_COLORS.grayMid;
        this.ctx.fillRect(x, y, barWidth, barHeight);

        // Fill
        this.ctx.fillStyle = PORTFOLIO_COLORS.neonYellow;
        this.ctx.shadowColor = PORTFOLIO_COLORS.neonYellow;
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(x, y, barWidth * remaining, barHeight);
        this.ctx.shadowBlur = 0;

        // Label
        this.ctx.fillStyle = PORTFOLIO_COLORS.neonYellow;
        this.ctx.font = '10px "Space Mono", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('RATE LIMITER ACTIVE', this.canvas.width / 2, y - 8);
    }

    updateUI() {
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.score);
        }
        if (this.onHealthUpdate && this.player) {
            this.onHealthUpdate(this.player.health, this.player.maxHealth);
        }
        if (this.onWaveUpdate) {
            const layerInfo = this.waveManager.getCurrentLayerInfo();
            this.onWaveUpdate(
                this.waveManager.getCurrentWaveNumber(),
                this.waveManager.getTotalWaves(),
                layerInfo
            );
        }
    }

    pause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            if (this.onPause) {
                this.onPause(true);
            }
        }
    }

    resume() {
        if (this.state === 'paused') {
            this.state = 'playing';
            if (this.onPause) {
                this.onPause(false);
            }
        }
    }

    gameOver() {
        this.state = 'gameover';
        this.saveHighScore();
        this.audioManager.playGameOver();

        if (this.onGameOver) {
            this.onGameOver(this.score, this.highScore);
        }

        console.log('NetDefender: Game Over - Score:', this.score);
    }

    victory() {
        this.state = 'victory';
        this.saveHighScore();

        if (this.onVictory) {
            this.onVictory(this.score, this.highScore);
        }

        console.log('NetDefender: Victory! - Score:', this.score);
    }

    loadHighScore() {
        return parseInt(localStorage.getItem('netdefender_highscore') || '0');
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('netdefender_highscore', this.score.toString());
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.inputHandler.reset();
    }

    destroy() {
        this.stop();
        this.inputHandler.destroy();
    }
}

// Make available globally for non-module contexts
window.NetDefender = NetDefender;
