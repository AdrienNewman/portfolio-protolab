// ============================================
// NETDEFENDER - Main Game Class
// OSI Layer Defense Game for Portfolio
// ============================================

import { CONFIG, PORTFOLIO_COLORS, POWERUPS, DEV_MODE } from './config/gameConfig.js';
import { Player } from './entities/Player.js';
import { Bullet } from './entities/Bullet.js';
import { PowerUp } from './entities/PowerUp.js';
import { InputHandler } from './systems/InputHandler.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { WaveManager } from './systems/WaveManager.js';
import { AudioManager } from './systems/AudioManager.js';
import { ScreenShake } from './effects/ScreenShake.js';
import { GridBackground } from './effects/GridBackground.js';

// Les Sages du Libre - Système Roguelike
import { playerStateManager } from './systems/PlayerStateManager.js';
import { LayerTransitionScreen } from './screens/LayerTransitionScreen.js';
// SageScreen + TransitionScreen fusionnés dans LayerTransitionScreen (v4.26)
import { getSageForBoss, getIntroSage } from './sages/index.js';
// Legacy SageScreen pour intro uniquement
import { SageScreen } from './screens/SageScreen.js';

// OSI Stack HUD - Symmetric "Poupee Russe" health system
import { OSIStackHUD } from './ui/index.js';

// Exposer playerStateManager globalement pour les dev tools (skipToLayer)
window.playerStateManager = playerStateManager;

// Exposer DEV_MODE pour activation rapide via console
window.DEV_MODE = DEV_MODE;

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
        this.state = 'start'; // start, playing, paused, gameover, victory, transition, layer_transition
        this.score = 0;
        this.highScore = this.loadHighScore();

        // Core systems
        this.inputHandler = new InputHandler(this.canvas);
        this.particleSystem = new ParticleSystem();
        this.audioManager = new AudioManager();
        this.waveManager = new WaveManager(this.canvas, this.audioManager);

        // Effects
        this.screenShake = new ScreenShake();
        this.gridBackground = new GridBackground(this.canvas);

        // Les Sages du Libre - Écrans
        this.sageScreen = new SageScreen(this.canvas, this.audioManager); // Legacy pour intro
        this.sageScreen.powerBadgeRenderer.preloadIcons(); // Précharge les icônes au démarrage
        this.defeatedBossId = null; // Track le boss vaincu pour la séquence sage
        this.layerTransitionScreen = null; // Initialisé après OSIStackHUD

        // OSI Stack HUD - Symmetric health display (left side)
        this.osiStackHUD = new OSIStackHUD(this);

        // LayerTransitionScreen - Écran unifié post-boss (Phase A/B/C)
        // Initialisé après OSIStackHUD car il a besoin de la référence pour addLayer()
        this.layerTransitionScreen = new LayerTransitionScreen(
            this.canvas,
            this.audioManager,
            this.osiStackHUD
        );

        // Entities
        this.player = null;
        this.bullets = [];
        this.powerUps = [];

        // OPTIMISATION: Cache bounds pour éviter allocations dans checkCollisions()
        this._boundsCache = {
            bullet: { x: 0, y: 0, width: 0, height: 0 },
            enemy: { x: 0, y: 0, width: 0, height: 0 },
            player: { x: 0, y: 0, width: 0, height: 0 },
            powerUp: { x: 0, y: 0, width: 0, height: 0 },
            projectile: { x: 0, y: 0, width: 0, height: 0 }
        };

        // Timing
        this.lastTime = 0;
        this.powerUpSpawnTimer = 0;

        // DEBUG: FPS counter pour mesurer les optimisations
        this._fpsFrames = 0;
        this._fpsTime = 0;
        this._fpsDisplay = 60;
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
        this.bullets = [];
        this.powerUps = [];
        this.powerUpSpawnTimer = 0;
        this.slowMoActive = false;
        this.defeatedBossId = null;

        // Reset Les Sages du Libre
        playerStateManager.reset();

        // Reset OSI Stack HUD
        this.osiStackHUD.reset();

        // Initialize player
        this.player = new Player(this.canvas);

        // Ajouter les propriétés de base pour les modifiers
        this.player.baseSpeed = this.player.speed;
        this.player.baseShootCooldown = this.player.shootCooldown;
        this.player.baseMaxHealth = this.player.maxHealth;
        this.player.hitboxMultiplier = 1.0;
        this.player.multiShot = { active: false, projectiles: 1, spreadAngle: 0 };
        this.player.activeModifiers = null;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 100;

        // Préparer la première vague (mais ne pas encore l'activer)
        this.waveManager.resetWaveStats();
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

        // Vérifier si un sage d'intro existe
        const introSage = getIntroSage();
        if (introSage) {
            console.log(`[NetDefender] Intro Sage: ${introSage.name}`);
            this.startIntroSageSequence(introSage);
        } else {
            // Pas de sage intro - démarrer directement le jeu
            this.startActualGame();
        }

        console.log('NetDefender: Game started');
    }

    /**
     * Lance la séquence d'introduction avec le Sage (avant le premier niveau)
     */
    startIntroSageSequence(sage) {
        this.state = 'intro-sage';

        // Configurer le SageScreen pour l'intro (écran unifié sage + choix pouvoir)
        this.sageScreen.onComplete = (completedSage) => {
            if (completedSage) {
                playerStateManager.recordSageMet(completedSage.id);
            }
            this.startActualGame();
        };

        // Callback pour le pouvoir sélectionné
        this.sageScreen.onPowerSelected = (power) => {
            console.log(`[NetDefender] Pouvoir intro: ${power?.name || 'aucun'}`);
        };

        // Afficher le dialogue d'intro du sage (la phase choice est intégrée)
        this.sageScreen.show(sage, true); // true = intro dialogue
    }

    /**
     * Démarre vraiment le gameplay (après l'intro sage si présent)
     */
    startActualGame() {
        this.state = 'playing';
        this.waveManager.startWave(1);
        console.log('[NetDefender] Gameplay actif - Vague 1');
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // DEBUG: FPS counter
        this._fpsFrames++;
        this._fpsTime += deltaTime;
        if (this._fpsTime >= 1000) {
            this._fpsDisplay = this._fpsFrames;
            this._fpsFrames = 0;
            this._fpsTime = 0;
        }

        // Handle pause toggle
        if (this.inputHandler.consumePause() && this.state === 'playing') {
            this.pause();
        }

        // Handle screen skip with ENTER during screens
        // Only skip if the current screen allows it (generic canSkip interface)
        if (this.waveManager.isScreenActive() && this.waveManager.canSkipScreen()) {
            if (this.inputHandler.consumeEnter()) {
                this.waveManager.skipScreen();
            }
        }

        // Update game state
        if (this.state === 'playing') {
            this.update(deltaTime);
        } else if (this.state === 'transition') {
            this.updateTransition(deltaTime);
        } else if (this.state === 'layer_transition') {
            this.updateLayerTransition(deltaTime);
        } else if (this.state === 'sage-sequence' || this.state === 'intro-sage') {
            this.updateSageSequence(deltaTime);
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

        // Update Les Sages du Libre (effets temporels)
        playerStateManager.update(deltaTime, this.player);
        playerStateManager.applyToPlayer(this.player);

        // Update OSI Stack HUD animations
        this.osiStackHUD.update(deltaTime);

        // Player shooting (avec support multi-shot)
        if (this.inputHandler.shoot) {
            const bulletPos = this.player.shoot();
            if (bulletPos) {
                // Vérifier si multi-shot est actif
                const multiShot = this.player.multiShot;
                if (multiShot && multiShot.active && multiShot.projectiles > 1) {
                    // Créer plusieurs projectiles en éventail
                    const angleStep = multiShot.spreadAngle / (multiShot.projectiles - 1);
                    const startAngle = -multiShot.spreadAngle / 2;

                    for (let i = 0; i < multiShot.projectiles; i++) {
                        const angle = startAngle + (angleStep * i);
                        const radians = (angle * Math.PI) / 180;
                        const bullet = new Bullet(bulletPos.x, bulletPos.y);
                        // Modifier la direction du bullet
                        bullet.velocityX = Math.sin(radians) * 3;
                        bullet.velocityY = -Math.abs(Math.cos(radians)) * CONFIG.BULLET.SPEED;
                        this.bullets.push(bullet);
                    }
                } else {
                    // Tir normal
                    this.bullets.push(new Bullet(bulletPos.x, bulletPos.y));
                }

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

        // Update bullets - OPTIMISATION: swap-and-pop O(1) au lieu de splice O(n)
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].isOffScreen()) {
                this.bullets[i] = this.bullets[this.bullets.length - 1];
                this.bullets.pop();
            }
        }

        // Update wave manager (enemies) - pass player for boss targeting
        this.waveManager.update(effectiveDelta, this.player);

        // Update power-ups - OPTIMISATION: swap-and-pop O(1)
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].update();
            if (this.powerUps[i].isOffScreen(this.canvas.height)) {
                this.powerUps[i] = this.powerUps[this.powerUps.length - 1];
                this.powerUps.pop();
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
                this.waveManager.resetWaveStats(); // Reset stats for new wave
                this.updateUI();
            } else {
                // All waves complete - victory!
                this.victory();
            }
        }
    }

    checkCollisions() {
        const enemies = this.waveManager.enemies;
        const bc = this._boundsCache; // Référence locale pour performance

        // Bullets vs Enemies - OPTIMISATION: réutilise les objets bounds
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            this._fillBounds(bc.bullet, bullet);

            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];

                if (!enemy.isCollidable()) continue;

                this._fillBounds(bc.enemy, enemy);

                if (this.intersects(bc.bullet, bc.enemy)) {
                    // Hit!
                    this.particleSystem.createSpark(bullet.x, bullet.y, enemy.color, 'up');
                    // OPTIMISATION: swap-and-pop O(1)
                    this.bullets[i] = this.bullets[this.bullets.length - 1];
                    this.bullets.pop();

                    // Track shot hit for accuracy
                    this.waveManager.recordShot(true);

                    // Vérifier instant kill (Sudo Kill power)
                    const instantKill = enemy.behavior !== 'boss' && playerStateManager.onEnemyHit(enemy);
                    const killed = instantKill || enemy.takeDamage();

                    if (killed) {
                        // Enemy destroyed - track for stats
                        this.waveManager.recordEnemyDefeated();

                        // Appliquer multiplicateur de score
                        const modifiers = playerStateManager.calculateModifiers();
                        const basePoints = enemy.points;
                        const finalPoints = Math.round(basePoints * modifiers.scoreMultiplier);
                        this.score += finalPoints;

                        if (enemy.behavior === 'boss') {
                            this.particleSystem.createBossExplosion(enemy.x, enemy.y, enemy.color);
                            this.screenShake.triggerHeavy();
                            this.audioManager.playExplosion(true);
                            // Stocker le boss vaincu pour la séquence Sage
                            this.defeatedBossId = enemy.bossId || enemy.id || 'boss_unknown';

                            // ===== OSI EVOLUTION =====
                            // Notifie le joueur pour débloquer la couche suivante
                            console.log(`[NetDefender] Boss defeated! bossId="${this.defeatedBossId}", enemy.bossId="${enemy.bossId}"`);
                            const evolutionResult = this.player.onBossDefeated(this.defeatedBossId);
                            console.log(`[NetDefender] Evolution result:`, evolutionResult);
                            if (evolutionResult.unlocked) {
                                console.log(`[NetDefender] Layer ${evolutionResult.layerNumber} unlocked!`);
                            } else {
                                console.log(`[NetDefender] Layer NOT unlocked. Check BOSS_TO_LAYER mapping.`);
                            }

                            // NOTE: osiStackHUD.addLayer() est maintenant appelé dans LayerTransitionScreen
                            // Phase B (animation OSI) - synchronisé avec l'animation du paquet
                            // L'ancien appel direct a été supprimé pour éviter l'affichage prématuré
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
        this._fillBounds(bc.player, this.player);

        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];

            if (enemy.isOffScreen(this.canvas.height)) {
                // Enemy passed - damage player via OSI Stack HUD
                const isDead = this.osiStackHUD.handleDamage(10);
                this.particleSystem.createDamageEffect(this.player.x, this.player.y);
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
                this._fillBounds(bc.enemy, enemy);

                if (this.intersects(bc.player, bc.enemy)) {
                    // Collision damage via OSI Stack HUD
                    const isDead = this.osiStackHUD.handleDamage(15);
                    this.particleSystem.createDamageEffect(this.player.x, this.player.y);
                    this.particleSystem.createExplosion(enemy.x, enemy.y, enemy.color);
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

        // PowerUps vs Player - OPTIMISATION: cache bounds
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            this._fillBounds(bc.powerUp, powerUp);

            if (this.intersects(bc.player, bc.powerUp)) {
                this.applyPowerUp(powerUp);
                // OPTIMISATION: swap-and-pop O(1)
                this.powerUps[i] = this.powerUps[this.powerUps.length - 1];
                this.powerUps.pop();
            }
        }

        // Boss Projectiles vs Player - OPTIMISATION: cache bounds
        const bossProjectiles = this.waveManager.getBossProjectiles();
        for (let i = bossProjectiles.length - 1; i >= 0; i--) {
            const proj = bossProjectiles[i];
            this._fillBounds(bc.projectile, proj);

            if (this.intersects(bc.player, bc.projectile)) {
                // Hit by boss projectile - damage via OSI Stack HUD
                const isDead = this.osiStackHUD.handleDamage(proj.damage);
                this.particleSystem.createDamageEffect(this.player.x, this.player.y);
                this.particleSystem.createSpark(proj.x, proj.y, proj.color, 'down');
                this.audioManager.playDamage();
                this.waveManager.removeBossProjectile(i);
                this.updateUI();

                if (isDead) {
                    this.gameOver();
                    return;
                }
            }
        }

        // Boss Hazards vs Player
        const bossHazards = this.waveManager.getBossHazards();
        for (let i = 0; i < bossHazards.length; i++) {
            const hazard = bossHazards[i];

            if (hazard.containsPoint(this.player.x, this.player.y)) {
                // Player is in hazard zone - damage via OSI Stack HUD
                if (hazard.canDamage()) {
                    const damage = hazard.getDamage();
                    const isDead = this.osiStackHUD.handleDamage(damage);
                    this.particleSystem.createDamageEffect(this.player.x, this.player.y);
                    this.updateUI();

                    if (isDead) {
                        this.gameOver();
                        return;
                    }
                }
            }
        }

        // Handle screen effects (like reverse controls)
        const screenEffect = this.waveManager.getScreenEffect();
        if (screenEffect && screenEffect.type === 'reverse_controls') {
            if (!this.player.isReversed) {
                this.player.activateReverse(screenEffect.duration);
            }
        }
    }

    intersects(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    /**
     * OPTIMISATION: Remplit un objet bounds existant avec les données de l'entité
     * Évite la création d'un nouvel objet à chaque appel getBounds()
     */
    _fillBounds(target, entity) {
        const bounds = entity.getBounds();
        target.x = bounds.x;
        target.y = bounds.y;
        target.width = bounds.width;
        target.height = bounds.height;
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
                // Malware power-up - damage via OSI Stack HUD
                const isDead = this.osiStackHUD.handleDamage(effect.value);
                this.particleSystem.createDamageEffect(this.player.x, this.player.y);
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

        const isLastWave = this.waveManager.getCurrentWaveNumber() >= this.waveManager.getTotalWaves();

        if (this.defeatedBossId) {
            // Boss vaincu → LayerTransitionScreen (Phase A/B/C)
            this.startLayerTransition(isLastWave);
        } else if (isLastWave) {
            // Pas de boss et dernière vague → victoire directe
            this.victory();
        } else {
            // Pas de boss et pas dernière vague → transition simple (ne devrait pas arriver)
            this.state = 'transition';
            this.waveManager.startTransition();
        }
    }

    /**
     * Lance le LayerTransitionScreen (3 phases : A=sage+pouvoir, B=OSI anim, C=intro suivant)
     * @param {boolean} triggerVictory - Si true, appelle victory() après la séquence
     */
    startLayerTransition(triggerVictory = false) {
        this.state = 'layer_transition';
        this.layerTransitionTriggerVictory = triggerVictory;

        // Configurer les callbacks
        this.layerTransitionScreen.onComplete = (result) => {
            if (result.sage) {
                playerStateManager.recordSageMet(result.sage.id);
            }

            this.defeatedBossId = null;

            if (this.layerTransitionTriggerVictory) {
                this.layerTransitionTriggerVictory = false;
                this.victory();
            } else {
                // Démarrer la vague suivante
                const nextWave = this.waveManager.getCurrentWaveNumber() + 1;
                const started = this.waveManager.startWave(nextWave);

                if (started) {
                    this.state = 'playing';
                    this.gridBackground.setLayerColor(this.waveManager.currentLayer.level);
                    this.waveManager.resetWaveStats();
                    this.updateUI();
                } else {
                    this.victory();
                }
            }
        };

        this.layerTransitionScreen.onPowerSelected = (power) => {
            console.log(`[NetDefender] Pouvoir choisi: ${power?.name || 'aucun'}`);
        };

        // Lancer le LayerTransitionScreen
        this.layerTransitionScreen.show(
            this.defeatedBossId,
            this.waveManager.currentWaveIndex,
            {
                enemiesDefeated: this.waveManager.waveStats?.enemiesDefeated || 0,
                accuracy: this.waveManager.getAccuracy ? this.waveManager.getAccuracy() : 0
            }
        );
    }

    /**
     * Update LayerTransitionScreen
     */
    updateLayerTransition(deltaTime) {
        if (this.layerTransitionScreen.isActive()) {
            this.layerTransitionScreen.update(deltaTime);
        }
    }

    /**
     * Lance la séquence Sage LEGACY (pour intro uniquement)
     * @param {Object} sage - Configuration du sage
     * @param {boolean} triggerVictory - Si true, appelle victory() après la séquence
     */
    startSageSequence(sage, triggerVictory = false) {
        this.state = 'sage-sequence';
        this.sageSequenceTriggerVictory = triggerVictory;

        // Configurer le SageScreen (écran unifié sage + choix pouvoir)
        this.sageScreen.onComplete = (completedSage) => {
            if (completedSage) {
                playerStateManager.recordSageMet(completedSage.id);
            }
            this.endSageSequence();
        };

        // Callback pour le pouvoir sélectionné
        this.sageScreen.onPowerSelected = (power) => {
            console.log(`[NetDefender] Pouvoir choisi: ${power?.name || 'aucun'}`);
        };

        // Lancer l'affichage du sage (la phase choice est intégrée)
        this.sageScreen.show(sage, false);
    }

    /**
     * Termine la séquence Sage LEGACY et lance la transition ou la victoire
     */
    endSageSequence() {
        this.defeatedBossId = null;

        if (this.sageSequenceTriggerVictory) {
            this.sageSequenceTriggerVictory = false;
            this.victory();
        } else {
            this.state = 'transition';
            this.waveManager.startTransition();
        }
    }

    /**
     * Update pendant la séquence Sage LEGACY (écran unifié)
     */
    updateSageSequence(deltaTime) {
        if (this.sageScreen.active) {
            this.sageScreen.update(deltaTime);
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = PORTFOLIO_COLORS.black;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply screen shake
        this.ctx.save();
        this.screenShake.apply(this.ctx);

        // Draw background (skip during sage/transition screens for cleaner overlay)
        if (this.state !== 'sage-sequence' && this.state !== 'intro-sage' && this.state !== 'layer_transition') {
            this.gridBackground.draw(this.ctx);
        }

        // Draw game objects
        if (this.state === 'playing' || this.state === 'transition' || this.state === 'paused') {
            // Power-ups
            this.powerUps.forEach(p => p.draw(this.ctx));

            // Bullets
            this.bullets.forEach(b => b.draw(this.ctx));

            // Boss hazards (draw below enemies)
            this.waveManager.drawBossHazards(this.ctx);

            // Enemies
            this.waveManager.enemies.forEach(e => e.draw(this.ctx));

            // Boss projectiles (draw above enemies)
            this.waveManager.drawBossProjectiles(this.ctx);

            // Boss attack effects (beams, rings)
            this.waveManager.drawBossAttackEffects(this.ctx);

            // Player
            if (this.player) {
                this.player.draw(this.ctx);
            }

            // Particles (on top)
            this.particleSystem.draw(this.ctx);

            // Screen effects from boss attacks
            this.waveManager.drawScreenEffect(this.ctx);

            // OSI Stack HUD (left side, above game objects)
            this.osiStackHUD.render();
        }

        // Reset screen shake
        this.screenShake.reset(this.ctx);
        this.ctx.restore();

        // Draw wave transition overlay (legacy)
        if (this.state === 'transition') {
            this.waveManager.drawTransition(this.ctx);
        }

        // Draw LayerTransitionScreen (Phase A/B/C après boss)
        if (this.state === 'layer_transition') {
            if (this.layerTransitionScreen.isActive()) {
                this.layerTransitionScreen.render();
            }
        }

        // Draw Les Sages du Libre screens LEGACY (intro uniquement)
        // Rendu écran sage unifié (dialogue + choix pouvoir)
        if (this.state === 'sage-sequence' || this.state === 'intro-sage') {
            if (this.sageScreen.active) {
                this.sageScreen.render();
            }
        }

        // Draw boss intro overlay (can appear during playing state)
        if (this.waveManager.bossIntro.isActive()) {
            this.waveManager.bossIntro.draw();
        }

        // Draw slow-mo indicator
        if (this.slowMoActive) {
            this.drawSlowMoIndicator();
        }

        // Draw active powers HUD (petit rappel des pouvoirs actifs)
        if (this.state === 'playing' && playerStateManager.activePowers.length > 0) {
            this.drawActivePowersHUD();
        }

        // DEBUG: FPS counter (coin supérieur droit)
        this.ctx.save();
        this.ctx.fillStyle = this._fpsDisplay >= 55 ? '#00ff88' : this._fpsDisplay >= 40 ? '#ffff00' : '#ff4444';
        this.ctx.font = 'bold 14px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${this._fpsDisplay} FPS`, this.canvas.width - 10, 20);
        this.ctx.restore();
    }

    /**
     * Affiche les icônes des pouvoirs actifs en bas à droite
     */
    drawActivePowersHUD() {
        const powers = playerStateManager.getActivePowersSummary();
        const iconSize = 30;
        const padding = 5;
        const startX = this.canvas.width - (powers.length * (iconSize + padding)) - 20;
        const y = this.canvas.height - iconSize - 15;

        this.ctx.save();
        this.ctx.globalAlpha = 0.8;

        for (let i = 0; i < powers.length; i++) {
            const power = powers[i];
            const x = startX + i * (iconSize + padding);

            // Background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, iconSize, iconSize, 5);
            this.ctx.fill();

            // Icon
            this.ctx.font = `${iconSize - 8}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(power.icon, x + iconSize / 2, y + iconSize / 2);
        }

        this.ctx.restore();
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
        if (this.onHealthUpdate) {
            // Use OSI Stack HUD health values
            this.onHealthUpdate(this.osiStackHUD.getTotalHealth(), this.osiStackHUD.getMaxHealth());
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
        this.sageScreen.destroy();
    }
}

// Make available globally for non-module contexts
window.NetDefender = NetDefender;
