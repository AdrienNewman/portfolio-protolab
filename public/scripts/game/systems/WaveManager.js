// ============================================
// WAVE MANAGER - NetDefender
// OSI Layer-based wave system
// ============================================

import { OSI_LAYERS, OSI_COLORS } from '../config/gameConfig.js';
import { Enemy } from '../entities/Enemy.js';

export class WaveManager {
    constructor(canvas) {
        this.canvas = canvas;
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

        // Build spawn queue
        this.buildSpawnQueue();

        return true;
    }

    buildSpawnQueue() {
        const layer = this.currentLayer;
        const spawnCount = layer.spawnCount;
        const enemies = layer.enemies;

        for (let i = 0; i < spawnCount; i++) {
            // Select enemy type (weighted towards non-boss)
            let enemyConfig;
            if (i === spawnCount - 1) {
                // Last enemy is boss type if available
                enemyConfig = enemies.find(e => e.behavior === 'boss') || enemies[0];
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
                delay: i * layer.spawnDelay
            });
        }
    }

    update(deltaTime) {
        if (!this.waveActive) return;

        // Handle spawning
        this.spawnTimer += deltaTime;

        while (this.spawnQueue.length > 0 && this.spawnTimer >= this.spawnQueue[0].delay) {
            const spawn = this.spawnQueue.shift();
            const enemy = new Enemy(
                spawn.config,
                this.currentLayer.level,
                spawn.x,
                -50, // Start above screen
                this.canvas.width
            );
            this.enemies.push(enemy);
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].update(deltaTime);

            // Remove off-screen enemies
            if (this.enemies[i].isOffScreen(this.canvas.height)) {
                this.enemies.splice(i, 1);
            }
        }

        // Check wave completion
        if (this.spawnQueue.length === 0 && this.enemies.length === 0) {
            this.waveComplete = true;
            this.waveActive = false;
        }
    }

    removeEnemy(index) {
        const enemy = this.enemies[index];
        this.enemies.splice(index, 1);
        return enemy;
    }

    startTransition() {
        this.transitioning = true;
        this.transitionProgress = 0;
    }

    updateTransition(deltaTime) {
        if (!this.transitioning) return false;

        this.transitionProgress += deltaTime / this.transitionDuration;

        if (this.transitionProgress >= 1) {
            this.transitioning = false;
            return true; // Transition complete
        }

        return false;
    }

    drawTransition(ctx) {
        if (!this.transitioning) return;

        const progress = this.transitionProgress;
        const eased = this.easeOutCubic(progress);

        // Calculate alpha for fade in/out
        let alpha;
        if (progress < 0.3) {
            alpha = eased * 3.33; // Fade in
        } else if (progress > 0.7) {
            alpha = (1 - eased) * 3.33; // Fade out
        } else {
            alpha = 1; // Full visibility
        }

        // Dark overlay
        ctx.fillStyle = `rgba(0, 0, 0, ${0.95 * alpha})`;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid pattern (portfolio style)
        const gridAlpha = alpha * 0.05;
        ctx.strokeStyle = `rgba(0, 255, 255, ${gridAlpha})`;
        ctx.lineWidth = 1;

        for (let x = 0; x <= this.canvas.width; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= this.canvas.height; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }

        // Get next wave info
        const nextWaveIndex = this.currentWaveIndex + 1;
        const nextLayer = this.layers[nextWaveIndex];

        if (!nextLayer) return;

        const layerColor = OSI_COLORS[nextLayer.level].color;

        // Wave number with glow
        ctx.textAlign = 'center';
        ctx.shadowColor = layerColor;
        ctx.shadowBlur = 30 * alpha;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.font = '5rem "Bebas Neue", sans-serif';
        ctx.fillText(`WAVE ${nextWaveIndex + 1}`, this.canvas.width / 2, this.canvas.height / 2 - 40);

        // Layer name
        ctx.font = '1.5rem "Space Mono", monospace';
        ctx.fillStyle = layerColor.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        ctx.fillText(
            `LAYER ${nextLayer.level}: ${nextLayer.name}`,
            this.canvas.width / 2,
            this.canvas.height / 2 + 20
        );

        // Enemy preview
        ctx.font = '0.9rem "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(136, 136, 136, ${alpha})`;
        const enemyNames = nextLayer.enemies.map(e => e.name).slice(0, 3).join(' • ');
        ctx.fillText(enemyNames, this.canvas.width / 2, this.canvas.height / 2 + 60);
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
}
