// ============================================
// WAVE MANAGER - NetDefender
// OSI Layer-based wave system with narrative transitions
// ============================================

import { OSI_LAYERS, OSI_COLORS } from '../config/gameConfig.js';
import { Enemy } from '../entities/Enemy.js';
import { TransitionScreen } from '../screens/TransitionScreen.js';
import { BossIntro } from '../screens/BossIntro.js';
import { BossProjectile, BossHazard, BossAttackEffect } from '../entities/BossProjectile.js';
import { BOSS_BEHAVIORS } from '../behaviors/bossBehaviors.js';

// Boss ID mapping by layer level
const LAYER_BOSS_IDS = {
    7: 'boss_injection',      // Layer 7 - Application
    6: 'boss_heartbleed',     // Layer 6 - Presentation
    5: 'boss_cookie_theft',   // Layer 5 - Session
    4: 'boss_syn_flood',      // Layer 4 - Transport
    3: 'boss_ip_masquerade',  // Layer 3 - Network
    2: 'boss_arp_flood',      // Layer 2 - Data Link
    1: 'boss_guardian'        // Layer 1 - Physical (Final Boss)
};

export class WaveManager {
    constructor(canvas, audioManager = null) {
        this.canvas = canvas;
        this.audioManager = audioManager;
        this.layers = OSI_LAYERS;
        this.currentWaveIndex = 0;
        this.currentLayer = null;

        // Wave state
        this.enemies = [];
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.waveActive = false;
        this.waveComplete = false;
        this.allWavesComplete = false;

        // Transition state
        this.transitioning = false;
        this.transitionProgress = 0;
        this.transitionDuration = 2500; // ms

        // Screen systems (narrative transitions)
        this.transitionScreen = new TransitionScreen(canvas, audioManager);
        this.bossIntro = new BossIntro(canvas, audioManager);

        // Wave statistics tracking
        this.waveStats = {
            enemiesDefeated: 0,
            shotsHit: 0,
            shotsFired: 0,
            startTime: 0
        };

        // Boss detection
        this.bossIncoming = false;
        this.bossSpawned = false;
        this.pendingBossSpawn = null;
        this.bossIntroActive = false;

        // Boss projectiles and hazards (separate from enemies)
        this.bossProjectiles = [];
        this.bossHazards = [];
        this.bossAttackEffects = [];

        // Screen effects from bosses
        this.screenEffect = null;
        this.screenEffectTimer = 0;

        // Current active boss reference
        this.activeBoss = null;
    }

    startWave(waveNumber) {
        this.currentWaveIndex = waveNumber - 1;

        if (this.currentWaveIndex >= this.layers.length) {
            this.allWavesComplete = true;
            return false;
        }

        this.currentLayer = this.layers[this.currentWaveIndex];
        this.enemies = [];
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.waveActive = true;
        this.waveComplete = false;

        // Reset boss state
        this.bossProjectiles = [];
        this.bossHazards = [];
        this.bossAttackEffects = [];
        this.screenEffect = null;
        this.activeBoss = null;

        // Build spawn queue
        this.buildSpawnQueue();

        return true;
    }

    buildSpawnQueue() {
        const layer = this.currentLayer;
        const spawnCount = layer.spawnCount;
        const enemies = layer.enemies;

        // Reset boss detection
        this.bossIncoming = false;
        this.bossSpawned = false;
        this.pendingBossSpawn = null;

        for (let i = 0; i < spawnCount; i++) {
            // Select enemy type (weighted towards non-boss)
            let enemyConfig;
            let isBoss = false;

            if (i === spawnCount - 1) {
                // Last enemy is boss type if available
                enemyConfig = enemies.find(e => e.behavior === 'boss') || enemies[0];
                if (enemyConfig.behavior === 'boss') {
                    isBoss = true;
                    this.bossIncoming = true;
                    // Add bossId to config based on layer level
                    const bossId = LAYER_BOSS_IDS[layer.level];
                    if (bossId && BOSS_BEHAVIORS[bossId]) {
                        enemyConfig = { ...enemyConfig, bossId: bossId };
                    }
                }
            } else {
                // Random from non-boss enemies
                const nonBoss = enemies.filter(e => e.behavior !== 'boss');
                enemyConfig = nonBoss[Math.floor(Math.random() * nonBoss.length)];
            }

            // Random X position
            const x = 60 + Math.random() * (this.canvas.width - 120);

            this.spawnQueue.push({
                config: enemyConfig,
                x: x,
                delay: i * layer.spawnDelay,
                isBoss: isBoss
            });
        }
    }

    update(deltaTime, player = null) {
        // Update screen overlays
        this.updateScreens(deltaTime);

        // If boss intro is active, pause spawning
        if (this.bossIntroActive) return;

        if (!this.waveActive) return;

        // Handle spawning
        this.spawnTimer += deltaTime;

        while (this.spawnQueue.length > 0 && this.spawnTimer >= this.spawnQueue[0].delay) {
            const spawn = this.spawnQueue[0];

            // Check if this is a boss spawn
            if (spawn.isBoss && !this.bossSpawned) {
                // Store pending spawn and show boss intro
                this.pendingBossSpawn = this.spawnQueue.shift();
                this.bossSpawned = true;
                this.showBossIntro(this.pendingBossSpawn.config);
                break; // Pause spawning until boss intro completes
            }

            // Normal enemy spawn
            this.spawnQueue.shift();
            this.spawnEnemy(spawn);
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime, player);

            // Track active boss
            if (enemy.isBossEnemy() && enemy.bossController) {
                this.activeBoss = enemy;
            }

            // Process boss update results (projectiles, hazards, screen effects)
            if (enemy.isBossEnemy()) {
                this.processBossUpdateResult(enemy);
            }

            // Remove off-screen enemies
            if (enemy.isOffScreen(this.canvas.height)) {
                if (enemy === this.activeBoss) {
                    this.activeBoss = null;
                }
                this.enemies.splice(i, 1);
            }
        }

        // Update boss projectiles
        this.updateBossProjectiles(deltaTime, player);

        // Update boss hazards
        this.updateBossHazards(deltaTime);

        // Update boss attack effects
        this.updateBossAttackEffects(deltaTime);

        // Update screen effects
        this.updateScreenEffect(deltaTime);

        // Check wave completion
        if (this.spawnQueue.length === 0 && this.enemies.length === 0 && !this.pendingBossSpawn) {
            this.waveComplete = true;
            this.waveActive = false;
        }
    }

    /**
     * Process results from boss behavior updates
     */
    processBossUpdateResult(enemy) {
        const result = enemy.getBossUpdateResult();
        if (!result) return;

        // Add new projectiles
        if (result.projectiles && result.projectiles.length > 0) {
            result.projectiles.forEach(projData => {
                const projectile = new BossProjectile(projData);
                this.bossProjectiles.push(projectile);
            });
        }

        // Add new hazards
        if (result.hazards && result.hazards.length > 0) {
            result.hazards.forEach(hazardData => {
                const hazard = new BossHazard(hazardData);
                this.bossHazards.push(hazard);
            });
        }

        // Handle screen effects
        if (result.screenEffect) {
            this.screenEffect = result.screenEffect;
            this.screenEffectTimer = result.screenEffect.duration || 2000;
        }

        // Handle enrage text
        if (result.enrageText) {
            // Could trigger a visual alert here
            console.log('BOSS ENRAGE:', result.enrageText);
        }

        // Clear the result after processing
        enemy.clearBossUpdateResult();
    }

    /**
     * Update boss projectiles
     */
    updateBossProjectiles(deltaTime, player) {
        for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
            const proj = this.bossProjectiles[i];
            const alive = proj.update(deltaTime, player);

            if (!alive || proj.isOffScreen(this.canvas.width, this.canvas.height)) {
                this.bossProjectiles.splice(i, 1);
            }
        }
    }

    /**
     * Update boss hazards
     */
    updateBossHazards(deltaTime) {
        for (let i = this.bossHazards.length - 1; i >= 0; i--) {
            const hazard = this.bossHazards[i];
            const alive = hazard.update(deltaTime);

            if (!alive) {
                this.bossHazards.splice(i, 1);
            }
        }
    }

    /**
     * Update boss attack effects (beams, rings, etc.)
     */
    updateBossAttackEffects(deltaTime) {
        if (!this.activeBoss) return;

        for (let i = this.bossAttackEffects.length - 1; i >= 0; i--) {
            const effect = this.bossAttackEffects[i];
            const alive = effect.update(deltaTime, this.activeBoss.x, this.activeBoss.y);

            if (!alive) {
                this.bossAttackEffects.splice(i, 1);
            }
        }
    }

    /**
     * Update screen effect timer
     */
    updateScreenEffect(deltaTime) {
        if (this.screenEffect) {
            this.screenEffectTimer -= deltaTime;
            if (this.screenEffectTimer <= 0) {
                this.screenEffect = null;
            }
        }
    }

    /**
     * Spawn an enemy from spawn data
     */
    spawnEnemy(spawn) {
        const enemy = new Enemy(
            spawn.config,
            this.currentLayer.level,
            spawn.x,
            -50, // Start above screen
            this.canvas.width,
            this.canvas.height
        );
        this.enemies.push(enemy);

        // Track boss if this is a boss spawn
        if (spawn.isBoss || spawn.config.bossId) {
            this.activeBoss = enemy;
        }
    }

    /**
     * Show boss intro modal
     */
    showBossIntro(bossConfig) {
        this.bossIntroActive = true;
        this.bossIntro.show(bossConfig, this.currentLayer.level);

        this.bossIntro.onComplete = () => {
            this.bossIntroActive = false;

            // Spawn the boss after intro
            if (this.pendingBossSpawn) {
                this.spawnEnemy(this.pendingBossSpawn);
                this.pendingBossSpawn = null;
            }
        };
    }

    /**
     * Update screen overlays (transition and boss intro)
     */
    updateScreens(deltaTime) {
        if (this.transitionScreen.isActive()) {
            this.transitionScreen.update(deltaTime);
        }
        if (this.bossIntro.isActive()) {
            this.bossIntro.update(deltaTime);
        }
    }

    /**
     * Draw screen overlays
     */
    drawScreens(ctx) {
        if (this.transitionScreen.isActive()) {
            this.transitionScreen.draw();
        }
        if (this.bossIntro.isActive()) {
            this.bossIntro.draw();
        }
    }

    /**
     * Check if any screen overlay is active
     */
    isScreenActive() {
        return this.transitionScreen.isActive() || this.bossIntro.isActive();
    }

    /**
     * Skip current screen overlay
     */
    skipScreen() {
        if (this.transitionScreen.isActive()) {
            this.transitionScreen.skip();
        }
        if (this.bossIntro.isActive()) {
            this.bossIntro.skip();
        }
    }

    removeEnemy(index) {
        const enemy = this.enemies[index];
        this.enemies.splice(index, 1);
        return enemy;
    }

    /**
     * Record an enemy defeat for stats
     */
    recordEnemyDefeated() {
        this.waveStats.enemiesDefeated++;
    }

    /**
     * Record a shot for accuracy tracking
     */
    recordShot(hit) {
        this.waveStats.shotsFired++;
        if (hit) {
            this.waveStats.shotsHit++;
        }
    }

    /**
     * Reset wave stats for new wave
     */
    resetWaveStats() {
        this.waveStats = {
            enemiesDefeated: 0,
            shotsHit: 0,
            shotsFired: 0,
            startTime: Date.now()
        };
    }

    /**
     * Calculate current accuracy percentage
     */
    getAccuracy() {
        if (this.waveStats.shotsFired === 0) return 100;
        return Math.round((this.waveStats.shotsHit / this.waveStats.shotsFired) * 100);
    }

    startTransition() {
        this.transitioning = true;
        this.transitionProgress = 0;

        // Play transition sound
        if (this.audioManager && this.audioManager.playTransitionSwoosh) {
            this.audioManager.playTransitionSwoosh();
        }

        // Calculate stats for transition screen
        const stats = {
            enemiesDefeated: this.waveStats.enemiesDefeated,
            accuracy: this.getAccuracy(),
            scoreBonus: this.waveStats.enemiesDefeated * 10
        };

        // Show narrative transition screen
        this.transitionScreen.show(
            this.currentWaveIndex,
            this.currentWaveIndex + 1,
            stats
        );

        this.transitionScreen.onComplete = () => {
            this.transitioning = false;
        };
    }

    updateTransition(deltaTime) {
        if (!this.transitioning) return false;

        // Update transition screen
        if (this.transitionScreen.isActive()) {
            this.transitionScreen.update(deltaTime);
        }

        // Check if transition is complete
        if (!this.transitionScreen.isActive()) {
            this.transitioning = false;
            return true; // Transition complete
        }

        return false;
    }

    drawTransition(ctx) {
        if (!this.transitioning) return;

        // Use new TransitionScreen for drawing
        if (this.transitionScreen.isActive()) {
            this.transitionScreen.draw();
        }
    }

    easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    getCurrentWaveNumber() {
        return this.currentWaveIndex + 1;
    }

    getCurrentLayerInfo() {
        if (!this.currentLayer) return null;
        return {
            level: this.currentLayer.level,
            name: this.currentLayer.name,
            color: this.currentLayer.color
        };
    }

    getTotalWaves() {
        return this.layers.length;
    }

    applySlowMo(multiplier) {
        this.enemies.forEach(enemy => {
            enemy.slowMoMultiplier = multiplier;
        });
    }

    removeSlowMo() {
        this.enemies.forEach(enemy => {
            enemy.slowMoMultiplier = 1;
        });
    }

    /**
     * Draw boss projectiles
     */
    drawBossProjectiles(ctx) {
        this.bossProjectiles.forEach(proj => {
            proj.draw(ctx);
        });
    }

    /**
     * Draw boss hazards
     */
    drawBossHazards(ctx) {
        this.bossHazards.forEach(hazard => {
            hazard.draw(ctx);
        });
    }

    /**
     * Draw boss attack effects
     */
    drawBossAttackEffects(ctx) {
        this.bossAttackEffects.forEach(effect => {
            effect.draw(ctx, this.canvas.width, this.canvas.height);
        });
    }

    /**
     * Draw screen effect if active
     */
    drawScreenEffect(ctx) {
        if (!this.screenEffect) return;

        const { type, duration } = this.screenEffect;
        const progress = 1 - (this.screenEffectTimer / duration);

        ctx.save();

        switch (type) {
            case 'reverse_controls':
                // Subtle purple tint for confusion effect
                ctx.fillStyle = `rgba(128, 0, 255, ${0.15 * (1 - progress)})`;
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;

            case 'static_noise':
                // Static noise effect
                this.drawStaticNoise(ctx, 0.2 * (1 - progress));
                break;

            case 'flash_warning':
                // Flash warning (charging)
                if (progress < 0.8) {
                    const pulse = Math.sin(progress * Math.PI * 10) * 0.3;
                    ctx.fillStyle = `rgba(255, 255, 0, ${pulse})`;
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                } else {
                    // Flash!
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * (1 - (progress - 0.8) / 0.2)})`;
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                }
                break;
        }

        ctx.restore();
    }

    /**
     * Draw static noise effect
     */
    drawStaticNoise(ctx, intensity) {
        const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            if (Math.random() < intensity) {
                const noise = Math.random() * 128;
                data[i] = Math.min(255, data[i] + noise);
                data[i + 1] = Math.min(255, data[i + 1] + noise);
                data[i + 2] = Math.min(255, data[i + 2] + noise);
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Get all boss projectiles for collision detection
     */
    getBossProjectiles() {
        return this.bossProjectiles;
    }

    /**
     * Get all boss hazards for collision detection
     */
    getBossHazards() {
        return this.bossHazards;
    }

    /**
     * Get current screen effect
     */
    getScreenEffect() {
        return this.screenEffect;
    }

    /**
     * Get active boss enemy
     */
    getActiveBoss() {
        return this.activeBoss;
    }

    /**
     * Remove a boss projectile by index
     */
    removeBossProjectile(index) {
        if (index >= 0 && index < this.bossProjectiles.length) {
            this.bossProjectiles.splice(index, 1);
        }
    }

    /**
     * Check if boss fight is currently active
     */
    isBossFightActive() {
        return this.activeBoss !== null && this.activeBoss.health > 0;
    }
}
