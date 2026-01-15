// ============================================
// LAYER TRANSITION SCREEN - Unified 3-Phase Screen
// Fusionne SageScreen + TransitionScreen + Intro
// V1.0 - Data-Driven Architecture
// ============================================

import { TRANSITION_CONFIG, getElementY } from '../config/TransitionConfig.js';
import { getReinforcementDialogue, getIntroDialogue } from '../data/DialogueDatabase.js';
import { getLayerInfo, getProtocolsForLayer } from '../data/OSILayerData.js';
import { getLayerData } from '../data/ScenarioData.js';
import { DialogueRenderer } from './renderers/DialogueRenderer.js';
import { PaginatedDialogueRenderer } from './renderers/PaginatedDialogueRenderer.js';
import {
    getBadgePositions,
    isPointInBadge,
    LAYOUT_CHOICE
} from './configs/SageScreenConfig.js';
import { getSageForBoss, getSageConfig } from '../sages/index.js';
import { getPowersForSage, getPowerConfig } from '../sages/powers/index.js';
import { playerStateManager } from '../systems/PlayerStateManager.js';

/**
 * LayerTransitionScreen - Écran unifié 3 phases
 *
 * Phase A: Reinforcement (sage portrait + dialogue + power choice)
 * Phase B: OSI Transition (packet animation + addLayer sync)
 * Phase C: Next Layer Intro (next sage + intro dialogue)
 *
 * POINT CRITIQUE: L'appel osiStackHUD.addLayer() est synchronisé
 * avec l'animation du paquet dans Phase B (pas à la mort du boss)
 */
export class LayerTransitionScreen {
    constructor(canvas, audioManager = null, osiStackHUD = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        this.osiStackHUD = osiStackHUD; // Référence pour addLayer()

        // Renderer dialogue paginé (support longs textes multi-pages)
        this.cinematicDialogue = new PaginatedDialogueRenderer(this.ctx, canvas);

        // Renderer portrait hologramme (réutilise DialogueRenderer de SageScreen)
        this.dialogueRenderer = new DialogueRenderer(this.ctx, canvas);

        // Power icons - préchargement PNG
        this._initPowerIcons();

        // État global
        this.active = false;
        this.glowPulse = 0;
        this.currentPhase = 'idle'; // 'idle', 'A', 'B', 'C'
        this.timer = 0;

        // Phase A state
        this.phaseA = {
            subPhase: 'idle', // fade-in, portrait, dialogue, choice, selected, fade-out
            timer: 0,
            fadeAlpha: 0,
            portraitScale: 0,
            portraitLoaded: false,
            portraitLoadFailed: false,
            portraitImage: null
        };

        // Phase B state
        this.phaseB = {
            subPhase: 'idle', // wipe-in, packet-anim, narrative, wipe-out
            timer: 0,
            autoSkipTimer: 0,
            wipeProgress: 0,
            packetProgress: 0,
            layerUnlocked: false, // Flag pour éviter double appel addLayer
            narrativeLines: [],
            stars: []
        };

        // Phase C state
        this.phaseC = {
            subPhase: 'idle', // fade-in, dialogue, fade-out
            timer: 0,
            fadeAlpha: 0,
            portraitLoaded: false,
            portraitLoadFailed: false,
            portraitImage: null
        };

        // Données contextuelles
        this.currentSage = null;
        this.nextSage = null;
        this.completedLayer = 0;
        this.nextLayer = 0;
        this.defeatedBossId = null;

        // Power selection
        this.powers = [];
        this.selectedPower = null;
        this.selectedIndex = -1;
        this.hoveredIndex = -1;
        this.badgePositions = [];

        // Particles
        this.particles = [];

        // Input handlers (bound)
        this._boundKeydown = this._handleKeydown.bind(this);
        this._boundMouseMove = this._handleMouseMove.bind(this);
        this._boundClick = this._handleClick.bind(this);
        this._eventsbound = false;

        // Callbacks
        this.onComplete = null;
        this.onPowerSelected = null;

        // Initialize stars for Phase B
        this._initStars();
    }

    // ============================================
    // PUBLIC API
    // ============================================

    /**
     * Démarre l'écran de transition après victoire sur un boss
     * @param {string} defeatedBossId - ID du boss vaincu
     * @param {number} completedWaveIndex - Index de la wave (0-6)
     * @param {object} stats - Statistiques optionnelles
     */
    show(defeatedBossId, completedWaveIndex, stats = {}) {
        this.active = true;
        this.defeatedBossId = defeatedBossId;
        this.completedLayer = 7 - completedWaveIndex;
        this.nextLayer = this.completedLayer - 1;
        this.timer = 0;

        // Récupérer les sages
        this.currentSage = getSageForBoss(defeatedBossId);
        this.nextSage = this.nextLayer > 0 ? this._getSageForLayer(this.nextLayer) : null;

        // Récupérer les pouvoirs du sage actuel
        this.powers = this.currentSage ? getPowersForSage(this.currentSage.id) : [];

        // Reset states
        this.selectedPower = null;
        this.selectedIndex = -1;
        this.hoveredIndex = -1;
        this.phaseB.layerUnlocked = false;

        // Calculer positions badges (via SageScreenConfig pour layout unifié)
        this.badgePositions = getBadgePositions(this.canvas.width, this.canvas.height);

        // Bind events
        this._bindEvents();

        // Log
        if (TRANSITION_CONFIG.debug.logStateChanges) {
            console.log(`[LayerTransitionScreen] Starting - Boss: ${defeatedBossId}, Layer: ${this.completedLayer} → ${this.nextLayer}`);
            console.log(`[LayerTransitionScreen] Current sage: ${this.currentSage?.name}, Next sage: ${this.nextSage?.name}`);
        }

        // Démarrer Phase A
        this._startPhaseA();
    }

    /**
     * Met à jour l'écran
     * @param {number} deltaTime - Temps écoulé en ms
     */
    update(deltaTime) {
        if (!this.active) return;

        this.timer += deltaTime;
        this.glowPulse += deltaTime * 0.003;

        switch (this.currentPhase) {
            case 'A':
                this._updatePhaseA(deltaTime);
                break;
            case 'B':
                this._updatePhaseB(deltaTime);
                break;
            case 'C':
                this._updatePhaseC(deltaTime);
                break;
        }

        // Update dialogue bubble
        this.cinematicDialogue.update(deltaTime);
    }

    /**
     * Rendu de l'écran
     */
    render() {
        if (!this.active) return;

        const ctx = this.ctx;

        switch (this.currentPhase) {
            case 'A':
                this._renderPhaseA(ctx);
                break;
            case 'B':
                this._renderPhaseB(ctx);
                break;
            case 'C':
                this._renderPhaseC(ctx);
                break;
        }
    }

    /**
     * Vérifie si l'écran est actif
     * @returns {boolean}
     */
    isActive() {
        return this.active;
    }

    /**
     * Détruit l'écran et nettoie les ressources
     */
    destroy() {
        this._unbindEvents();
        this.active = false;
        this.currentPhase = 'idle';
    }

    // ============================================
    // PHASE A: REINFORCEMENT
    // ============================================

    _startPhaseA() {
        this.currentPhase = 'A';
        this.phaseA.subPhase = 'fade-in';
        this.phaseA.timer = 0;
        this.phaseA.fadeAlpha = 0;
        this.phaseA.portraitScale = 0;
        this.phaseA.portraitLoaded = false;

        // Utiliser le dialogue post-boss du sage (narratif complet avec pagination)
        const dialogueText = this.currentSage?.postBossDialogue ||
            getReinforcementDialogue(this.currentSage?.id, {
                layer: this.completedLayer,
                layerName: getLayerInfo(this.completedLayer)?.name || 'Inconnu',
                bossName: getLayerData(this.completedLayer)?.bossName || 'Boss',
                sageName: this.currentSage?.name || 'Sage'
            });
        this.cinematicDialogue.setText(dialogueText, this.currentSage?.accentColor || '#00ffff');

        // Charger le portrait
        this._loadPortrait(this.currentSage, 'phaseA');

        // Initialiser particules
        this._initParticles();

        if (TRANSITION_CONFIG.debug.logStateChanges) {
            console.log('[LayerTransitionScreen] Phase A started');
        }
    }

    _updatePhaseA(deltaTime) {
        const cfg = TRANSITION_CONFIG.phaseA;
        this.phaseA.timer += deltaTime;

        switch (this.phaseA.subPhase) {
            case 'fade-in':
                this.phaseA.fadeAlpha = Math.min(1, this.phaseA.timer / cfg.fadeInDuration);
                if (this.phaseA.fadeAlpha >= 1) {
                    this.phaseA.subPhase = 'portrait';
                    this.phaseA.timer = 0;
                }
                break;

            case 'portrait':
                this.phaseA.portraitScale = this._easeOutBack(
                    Math.min(1, this.phaseA.timer / cfg.portraitAppearDuration)
                );
                if (this.phaseA.timer >= cfg.portraitAppearDuration) {
                    this.phaseA.subPhase = 'dialogue';
                    this.phaseA.timer = 0;
                }
                break;

            case 'dialogue':
                // Le passage à 'choice' est maintenant géré par _handlePhaseAKeydown
                // quand le PaginatedDialogueRenderer retourne 'complete' (toutes pages lues)
                // On ne fait rien ici - le joueur doit appuyer sur ENTRÉE pour naviguer
                break;

            case 'choice':
                // Géré par input handlers
                break;

            case 'selected':
                // Flash animation
                if (this.phaseA.timer >= cfg.selectionFlashDuration) {
                    this.phaseA.subPhase = 'fade-out';
                    this.phaseA.timer = 0;
                }
                break;

            case 'fade-out':
                this.phaseA.fadeAlpha = 1 - Math.min(1, this.phaseA.timer / cfg.fadeOutDuration);
                if (this.phaseA.fadeAlpha <= 0) {
                    this._startPhaseB();
                }
                break;
        }

        // Update particles
        this._updateParticles(deltaTime);
    }

    _renderPhaseA(ctx) {
        const cfg = TRANSITION_CONFIG.phaseA;

        // Fond avec vignette et fade
        this._renderVignetteBackground(ctx, this.phaseA.fadeAlpha, this.currentSage?.accentColor);

        // Particules ambiantes
        this._renderParticles(ctx, this.phaseA.fadeAlpha);

        // Portrait sage avec hologramme (via DialogueRenderer)
        if (this.currentSage) {
            this.dialogueRenderer.setMode('choice');
            const state = this._buildPortraitState('A');
            ctx.globalAlpha = this.phaseA.fadeAlpha;
            this.dialogueRenderer.renderPortrait(state, this.currentSage);
            ctx.globalAlpha = 1;
        }

        // Dialogue cinématique (sous le portrait) - seulement pendant phase dialogue
        if (this.phaseA.subPhase === 'dialogue') {
            ctx.globalAlpha = this.phaseA.fadeAlpha;
            this.cinematicDialogue.render({ glowPulse: this.glowPulse });
            ctx.globalAlpha = 1;
        }

        // Power badges (phase choice ou selected)
        if (this.phaseA.subPhase === 'choice' || this.phaseA.subPhase === 'selected') {
            this._renderPowerBadges(ctx, this.phaseA.fadeAlpha);

            // Prompt "Choisis une mise à jour OSI" dans la zone dialogue
            ctx.globalAlpha = this.phaseA.fadeAlpha;
            ctx.save();
            ctx.font = '18px "Space Mono", monospace';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.shadowColor = this.currentSage?.accentColor || '#00ffff';
            ctx.shadowBlur = 8;
            ctx.fillText(
                'Choisis une mise à jour OSI',
                this.canvas.width / 2,
                this.canvas.height * 0.68 + 15
            );
            ctx.restore();
        }

        // Instructions en bas (phase choice uniquement)
        if (this.phaseA.subPhase === 'choice') {
            ctx.globalAlpha = this.phaseA.fadeAlpha * 0.7;
            ctx.font = '14px "Space Mono", monospace';
            ctx.fillStyle = '#888888';
            ctx.textAlign = 'center';
            ctx.fillText(
                'Clique ou utilise ← → + ENTER pour choisir',
                this.canvas.width / 2,
                this.canvas.height - 40
            );
            ctx.globalAlpha = 1;
        }
    }

    // ============================================
    // PHASE B: OSI TRANSITION
    // POINT CRITIQUE: Synchronisation addLayer()
    // ============================================

    _startPhaseB() {
        this.currentPhase = 'B';
        this.phaseB.subPhase = 'wipe-in';
        this.phaseB.timer = 0;
        this.phaseB.autoSkipTimer = 0;
        this.phaseB.wipeProgress = 0;
        this.phaseB.packetProgress = 0;
        this.phaseB.layerUnlocked = false;

        // Préparer les lignes narratives depuis ScenarioData
        const layerData = getLayerData(this.completedLayer);
        this._prepareNarrativeLines(layerData);

        if (TRANSITION_CONFIG.debug.logStateChanges) {
            console.log('[LayerTransitionScreen] Phase B started');
        }
    }

    _updatePhaseB(deltaTime) {
        const cfg = TRANSITION_CONFIG.phaseB;
        this.phaseB.timer += deltaTime;
        this.phaseB.autoSkipTimer += deltaTime;

        switch (this.phaseB.subPhase) {
            case 'wipe-in':
                this.phaseB.wipeProgress = Math.min(1, this.phaseB.timer / cfg.wipeDuration);
                if (this.phaseB.wipeProgress >= 1) {
                    this.phaseB.subPhase = 'packet-anim';
                    this.phaseB.timer = 0;
                }
                break;

            case 'packet-anim':
                // Animation du paquet
                this.phaseB.packetProgress = Math.min(1, this.phaseB.timer / cfg.packetAnimDuration);

                // SYNCHRONISATION: Appeler addLayer() quand le paquet atteint la nouvelle couche
                if (!this.phaseB.layerUnlocked && this.phaseB.packetProgress >= cfg.layerUnlockTrigger) {
                    this._triggerLayerUnlock();
                }

                // Mise à jour des lignes narratives
                this._updateNarrativeLines(deltaTime);

                if (this.phaseB.packetProgress >= 1) {
                    this.phaseB.subPhase = 'wipe-out';
                    this.phaseB.timer = 0;
                }
                break;

            case 'wipe-out':
                this.phaseB.wipeProgress = 1 - Math.min(1, this.phaseB.timer / cfg.wipeDuration);
                if (this.phaseB.wipeProgress <= 0) {
                    this._startPhaseC();
                }
                break;
        }

        // Auto-skip
        if (cfg.allowManualSkip && this.phaseB.autoSkipTimer >= cfg.autoSkipDelay) {
            this._startPhaseC();
        }
    }

    /**
     * POINT CRITIQUE: Déclenche l'ajout de la couche dans le HUD OSI
     * Synchronisé avec l'animation du paquet (à 70% de progression)
     */
    _triggerLayerUnlock() {
        if (this.phaseB.layerUnlocked) return;
        this.phaseB.layerUnlocked = true;

        // Appeler addLayer sur le HUD
        if (this.osiStackHUD && this.defeatedBossId) {
            const success = this.osiStackHUD.addLayer(this.defeatedBossId);
            console.log(`[LayerTransitionScreen] OSI layer unlocked: ${success}`);
        }

        // Effet audio
        if (this.audioManager) {
            this.audioManager.play('powerup'); // Utiliser son existant
        }
    }

    _renderPhaseB(ctx) {
        const cfg = TRANSITION_CONFIG.phaseB;

        // Fond avec vignette subtile (cohérence visuelle)
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Vignette légère pour adoucir les bords
        const w = this.canvas.width;
        const h = this.canvas.height;
        const gradient = ctx.createRadialGradient(
            w / 2, h / 2, 0,
            w / 2, h / 2, Math.max(w, h) * 0.8
        );
        gradient.addColorStop(0, 'rgba(20, 20, 40, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Étoiles
        this._renderStars(ctx, this.phaseB.wipeProgress);

        // Titre
        ctx.font = '48px "Bebas Neue", Arial, sans-serif';
        ctx.fillStyle = '#FFE81F';
        ctx.textAlign = 'center';
        ctx.globalAlpha = this.phaseB.wipeProgress;
        ctx.fillText('ENCAPSULATION OSI', this.canvas.width / 2, 80);
        ctx.globalAlpha = 1;

        // Box layer complétée
        const completedLayerInfo = getLayerInfo(this.completedLayer);
        this._renderLayerBox(ctx, completedLayerInfo, TRANSITION_CONFIG.layout.osiPanel.completedLayerY, true);

        // Flèche
        ctx.font = '64px Arial';
        ctx.fillStyle = '#00ffff';
        ctx.textAlign = 'center';
        ctx.fillText('↓', this.canvas.width / 2, 320);

        // Paquet animé
        if (this.phaseB.subPhase === 'packet-anim') {
            this._renderPacket(ctx);
        }

        // Box layer suivante
        if (this.nextLayer > 0) {
            const nextLayerInfo = getLayerInfo(this.nextLayer);
            this._renderLayerBox(ctx, nextLayerInfo, TRANSITION_CONFIG.layout.osiPanel.nextLayerY, false);
        }

        // Lignes narratives
        this._renderNarrativeLines(ctx);

        // Skip hint
        if (cfg.showSkipHint && this.phaseB.autoSkipTimer >= cfg.skipHintDelay) {
            const remaining = Math.ceil((cfg.autoSkipDelay - this.phaseB.autoSkipTimer) / 1000);
            ctx.font = '14px "Space Mono", monospace';
            ctx.fillStyle = '#666666';
            ctx.textAlign = 'center';
            ctx.fillText(
                `ENTER pour continuer (auto dans ${remaining}s)`,
                this.canvas.width / 2,
                this.canvas.height - 30
            );
        }
    }

    // ============================================
    // PHASE C: NEXT LAYER INTRO
    // ============================================

    _startPhaseC() {
        // Si pas de layer suivante, terminer
        if (this.nextLayer <= 0 || !this.nextSage) {
            this._complete();
            return;
        }

        this.currentPhase = 'C';
        this.phaseC.subPhase = 'fade-in';
        this.phaseC.timer = 0;
        this.phaseC.fadeAlpha = 0;
        this.phaseC.portraitLoaded = false;

        // Préparer le dialogue d'intro
        const nextLayerInfo = getLayerInfo(this.nextLayer);
        const context = {
            nextLayer: this.nextLayer,
            nextLayerName: nextLayerInfo?.name || 'Inconnu',
            protocols: nextLayerInfo?.protocols?.join(', ') || ''
        };

        const dialogueText = getIntroDialogue(this.nextSage?.id, context);
        if (dialogueText) {
            this.cinematicDialogue.setText(dialogueText, this.nextSage?.accentColor || '#00ffff');
        }

        // Charger le portrait du sage suivant
        this._loadPortrait(this.nextSage, 'phaseC');

        if (TRANSITION_CONFIG.debug.logStateChanges) {
            console.log('[LayerTransitionScreen] Phase C started');
        }
    }

    _updatePhaseC(deltaTime) {
        const cfg = TRANSITION_CONFIG.phaseC;
        this.phaseC.timer += deltaTime;

        switch (this.phaseC.subPhase) {
            case 'fade-in':
                this.phaseC.fadeAlpha = Math.min(1, this.phaseC.timer / cfg.fadeInDuration);
                if (this.phaseC.fadeAlpha >= 1) {
                    this.phaseC.subPhase = 'dialogue';
                    this.phaseC.timer = 0;
                }
                break;

            case 'dialogue':
                // Attendre input ou min display time
                break;

            case 'fade-out':
                this.phaseC.fadeAlpha = 1 - Math.min(1, this.phaseC.timer / cfg.fadeOutDuration);
                if (this.phaseC.fadeAlpha <= 0) {
                    this._complete();
                }
                break;
        }
    }

    _renderPhaseC(ctx) {
        // Fond avec vignette et fade
        this._renderVignetteBackground(ctx, this.phaseC.fadeAlpha, this.nextSage?.accentColor);

        // Particules
        this._renderParticles(ctx, this.phaseC.fadeAlpha);

        // Portrait sage suivant avec hologramme (via DialogueRenderer)
        if (this.nextSage) {
            this.dialogueRenderer.setMode('dialogue');
            const state = this._buildPortraitState('C');
            ctx.globalAlpha = this.phaseC.fadeAlpha;
            this.dialogueRenderer.renderPortrait(state, this.nextSage);
            ctx.globalAlpha = 1;
        }

        // Dialogue cinématique (le CinematicDialogueRenderer affiche ses propres instructions)
        ctx.globalAlpha = this.phaseC.fadeAlpha;
        this.cinematicDialogue.render({ glowPulse: this.glowPulse });
        ctx.globalAlpha = 1;
    }

    // ============================================
    // INPUT HANDLERS
    // ============================================

    _bindEvents() {
        if (this._eventsbound) return;
        window.addEventListener('keydown', this._boundKeydown);
        window.addEventListener('mousemove', this._boundMouseMove);
        window.addEventListener('click', this._boundClick);
        this._eventsbound = true;
    }

    _unbindEvents() {
        if (!this._eventsbound) return;
        window.removeEventListener('keydown', this._boundKeydown);
        window.removeEventListener('mousemove', this._boundMouseMove);
        window.removeEventListener('click', this._boundClick);
        this._eventsbound = false;
    }

    _handleKeydown(e) {
        if (!this.active) return;

        switch (this.currentPhase) {
            case 'A':
                this._handlePhaseAKeydown(e);
                break;
            case 'B':
                if (e.code === 'Enter' || e.code === 'Space') {
                    this._startPhaseC();
                }
                break;
            case 'C':
                if (e.code === 'Enter' || e.code === 'Space') {
                    if (this.phaseC.subPhase === 'dialogue') {
                        const result = this.cinematicDialogue.handleInput(e.code);
                        // 'complete' signifie toutes les pages lues → fade out
                        if (result === 'complete') {
                            this.phaseC.subPhase = 'fade-out';
                            this.phaseC.timer = 0;
                        }
                        // 'next-page' et 'accelerate' sont gérés par le renderer
                    }
                }
                break;
        }
    }

    _handlePhaseAKeydown(e) {
        // Gérer dialogue paginé
        if (this.phaseA.subPhase === 'dialogue') {
            if (e.code === 'Enter' || e.code === 'Space') {
                const result = this.cinematicDialogue.handleInput(e.code);
                // 'complete' signifie que toutes les pages sont terminées → passer au choix
                if (result === 'complete') {
                    this.phaseA.subPhase = 'choice';
                    this.phaseA.timer = 0;
                }
                // 'next-page' et 'accelerate' sont gérés par le renderer
            }
            return;
        }

        // Power selection
        if (this.phaseA.subPhase === 'choice') {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.hoveredIndex = 0;
            } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.hoveredIndex = 1;
            } else if (e.code === 'Enter' || e.code === 'Space') {
                if (this.hoveredIndex >= 0) {
                    this._selectPower(this.hoveredIndex);
                }
            } else if (e.code === 'Digit1') {
                this._selectPower(0);
            } else if (e.code === 'Digit2') {
                this._selectPower(1);
            }
        }
    }

    _handleMouseMove(e) {
        if (!this.active || this.currentPhase !== 'A' || this.phaseA.subPhase !== 'choice') {
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.hoveredIndex = -1;
        for (let i = 0; i < this.badgePositions.length && i < this.powers.length; i++) {
            const pos = this.badgePositions[i];
            if (isPointInBadge(mouseX, mouseY, pos)) {
                this.hoveredIndex = i;
                break;
            }
        }
    }

    _handleClick(e) {
        if (!this.active || this.currentPhase !== 'A' || this.phaseA.subPhase !== 'choice') {
            return;
        }

        if (this.hoveredIndex >= 0) {
            this._selectPower(this.hoveredIndex);
        }
    }

    _selectPower(index) {
        if (index < 0 || index >= this.powers.length) return;

        this.selectedIndex = index;
        this.selectedPower = this.powers[index];
        this.phaseA.subPhase = 'selected';
        this.phaseA.timer = 0;

        // Ajouter le pouvoir au PlayerStateManager
        playerStateManager.addPower(this.selectedPower.id);

        // Callback
        if (this.onPowerSelected) {
            this.onPowerSelected(this.selectedPower);
        }

        // Audio
        if (this.audioManager) {
            this.audioManager.play('powerup');
        }

        console.log(`[LayerTransitionScreen] Power selected: ${this.selectedPower.name}`);
    }

    // ============================================
    // COMPLETION
    // ============================================

    _complete() {
        this.active = false;
        this._unbindEvents();

        if (TRANSITION_CONFIG.debug.logStateChanges) {
            console.log('[LayerTransitionScreen] Complete');
        }

        if (this.onComplete) {
            this.onComplete({
                selectedPower: this.selectedPower,
                sage: this.currentSage,
                nextSage: this.nextSage,
                completedLayer: this.completedLayer,
                nextLayer: this.nextLayer
            });
        }
    }

    // ============================================
    // RENDER HELPERS
    // ============================================

    /**
     * Unified vignette background with gradient
     * Le fond de base est TOUJOURS opaque, seul l'accent suit le fade
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} fadeAlpha - Opacity for animated effects (0-1)
     * @param {string} accentColor - Optional accent color tint
     */
    _renderVignetteBackground(ctx, fadeAlpha, accentColor = '#00ffff') {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Fond opaque TOUJOURS visible (évite l'écran noir)
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, w, h);

        // Vignette gradient (toujours visible)
        const gradient = ctx.createRadialGradient(
            w / 2, h / 2, 0,
            w / 2, h / 2, Math.max(w, h) * 0.7
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
        gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Accent tint avec fade (effet subtil qui apparaît progressivement)
        if (fadeAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = fadeAlpha;
            const accentGradient = ctx.createRadialGradient(
                w / 2, h / 2, Math.max(w, h) * 0.3,
                w / 2, h / 2, Math.max(w, h) * 0.8
            );
            accentGradient.addColorStop(0, 'transparent');
            accentGradient.addColorStop(1, this._hexToRgba(accentColor, 0.08));

            ctx.fillStyle = accentGradient;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        }
    }

    /**
     * Helper: hex to rgba conversion
     */
    _hexToRgba(hex, alpha) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
        }
        return `rgba(0, 255, 255, ${alpha})`;
    }

    _renderPortrait(ctx, image, sage, y, scale) {
        const size = TRANSITION_CONFIG.layout.portrait.size;
        const x = this.canvas.width / 2 - size / 2;
        const yPos = y - size / 2;

        // Glow
        ctx.shadowColor = sage?.accentColor || '#00ffff';
        ctx.shadowBlur = TRANSITION_CONFIG.layout.portrait.glowRadius * scale;

        // Image ou fallback
        if (image && image.complete) {
            ctx.drawImage(
                image,
                x + (size * (1 - scale)) / 2,
                yPos + (size * (1 - scale)) / 2,
                size * scale,
                size * scale
            );
        } else {
            // Placeholder
            ctx.fillStyle = sage?.accentColor || '#00ffff';
            ctx.globalAlpha = 0.3 * scale;
            ctx.fillRect(
                x + (size * (1 - scale)) / 2,
                yPos + (size * (1 - scale)) / 2,
                size * scale,
                size * scale
            );
            ctx.globalAlpha = 1;
        }

        // Border
        ctx.strokeStyle = sage?.accentColor || '#00ffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(
            x + (size * (1 - scale)) / 2,
            yPos + (size * (1 - scale)) / 2,
            size * scale,
            size * scale
        );

        ctx.shadowBlur = 0;
    }

    _renderPowerBadges(ctx, alpha) {
        const cfg = TRANSITION_CONFIG.layout.badges;

        for (let i = 0; i < Math.min(2, this.powers.length); i++) {
            const power = this.powers[i];
            const powerConfig = getPowerConfig(power.id);
            const pos = this.badgePositions[i];
            const isHovered = this.hoveredIndex === i;
            const isSelected = this.selectedIndex === i;

            ctx.globalAlpha = alpha;

            // Cercle background
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, cfg.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = isSelected
                ? 'rgba(0, 255, 136, 0.4)'
                : isHovered
                    ? 'rgba(0, 255, 255, 0.3)'
                    : 'rgba(0, 255, 255, 0.15)';
            ctx.fill();

            // Border avec glow
            ctx.strokeStyle = isSelected ? '#00ff88' : '#00ffff';
            ctx.lineWidth = isHovered || isSelected ? 4 : 2;
            ctx.shadowColor = isSelected ? '#00ff88' : '#00ffff';
            ctx.shadowBlur = isHovered || isSelected ? 20 : 10;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Icône (PNG ou emoji fallback)
            const iconImg = this.powerIconImages[power.id];
            if (iconImg) {
                const iconSize = 64;
                ctx.drawImage(iconImg, pos.x - iconSize / 2, pos.y - iconSize / 2, iconSize, iconSize);
            } else {
                ctx.font = '48px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(powerConfig?.icon || '⚡', pos.x, pos.y);
            }

            // Nom en dessous
            ctx.font = 'bold 16px "Space Mono", monospace';
            ctx.fillStyle = '#00ffff';
            ctx.textBaseline = 'top';
            const nameY = pos.y + cfg.size / 2 + 12;
            ctx.fillText(powerConfig?.name || power.id, pos.x, nameY);

            // Description sur une ligne (gris)
            if (powerConfig?.description) {
                ctx.font = '10px "Space Mono", monospace';
                ctx.fillStyle = '#888888';
                // Tronquer si trop long
                let desc = powerConfig.description;
                while (ctx.measureText(desc).width > 140 && desc.length > 10) {
                    desc = desc.slice(0, -4) + '...';
                }
                ctx.fillText(desc, pos.x, nameY + 20);
            }

            // Effets concrets en gras (cyan)
            if (powerConfig?.effect) {
                ctx.font = 'bold 11px "Space Mono", monospace';
                ctx.fillStyle = '#00ff88';
                const effectText = this._formatPowerEffect(powerConfig.effect);
                ctx.fillText(effectText, pos.x, nameY + 34);
            }

            ctx.globalAlpha = 1;
        }
    }

    /**
     * Formate l'effet d'un pouvoir en texte lisible
     */
    _formatPowerEffect(effect) {
        if (!effect || !effect.type) return '';

        switch (effect.type) {
            case 'score_multiplier':
                return `Score x${effect.value || effect.multiplier}`;
            case 'auto_shield':
                return `${effect.hits} hits / ${(effect.cooldown / 1000)}s`;
            case 'speed_boost':
                return `Vitesse +${Math.round((effect.multiplier - 1) * 100)}%`;
            case 'multi_shot':
                return `${effect.projectiles} tirs simultanés`;
            case 'damage_boost':
                return `Dégâts x${effect.multiplier}`;
            case 'cooldown_reduction':
                return `Cooldown -${Math.round((1 - effect.multiplier) * 100)}%`;
            case 'health_regen':
                return `+${effect.value} HP / ${effect.interval / 1000}s`;
            case 'invincibility':
                return `Invincible ${effect.duration / 1000}s`;
            default:
                // Afficher les valeurs brutes si type inconnu
                if (effect.value) return `+${effect.value}`;
                if (effect.multiplier) return `x${effect.multiplier}`;
                if (effect.duration) return `${effect.duration / 1000}s`;
                return effect.type;
        }
    }

    _renderLayerBox(ctx, layerInfo, y, completed) {
        const cfg = TRANSITION_CONFIG.layout.osiPanel;
        const w = cfg.layerBoxWidth;
        const h = cfg.layerBoxHeight;
        const x = this.canvas.width / 2 - w / 2;

        // Background
        ctx.fillStyle = completed
            ? 'rgba(0, 255, 136, 0.15)'
            : 'rgba(0, 120, 212, 0.15)';
        ctx.fillRect(x, y, w, h);

        // Border
        ctx.strokeStyle = completed ? '#00ff88' : '#00ffff';
        ctx.lineWidth = 3;
        ctx.shadowColor = completed ? '#00ff88' : '#00ffff';
        ctx.shadowBlur = 10;
        ctx.strokeRect(x, y, w, h);
        ctx.shadowBlur = 0;

        // Texte layer
        ctx.font = '28px "Bebas Neue", Arial, sans-serif';
        ctx.fillStyle = completed ? '#00ff88' : '#FFE81F';
        ctx.textAlign = 'center';
        ctx.fillText(
            `LAYER ${layerInfo?.number || '?'} - ${layerInfo?.short || '???'} ${completed ? '✓' : ''}`,
            this.canvas.width / 2,
            y + 35
        );

        // Nom complet
        ctx.font = '20px "Space Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(layerInfo?.name?.toUpperCase() || 'INCONNU', this.canvas.width / 2, y + 60);

        // Protocoles
        ctx.font = '12px "Space Mono", monospace';
        ctx.fillStyle = '#888888';
        ctx.fillText(
            layerInfo?.protocols?.slice(0, 4).join(' | ') || '',
            this.canvas.width / 2,
            y + 85
        );
    }

    _renderPacket(ctx) {
        const cfg = TRANSITION_CONFIG.layout.osiPanel;
        const progress = this.phaseB.packetProgress;

        // Interpoler la position Y
        const startY = cfg.completedLayerY + cfg.layerBoxHeight;
        const endY = cfg.nextLayerY - 20;
        const y = startY + progress * (endY - startY);
        const x = this.canvas.width / 2;
        const size = cfg.packetSize;

        // Trail effect
        for (let i = 3; i >= 0; i--) {
            const trailY = y - i * 15;
            const trailAlpha = 0.3 - i * 0.08;
            ctx.globalAlpha = trailAlpha;
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(x - size / 2, trailY - size / 2, size, size);
        }
        ctx.globalAlpha = 1;

        // Paquet principal
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(x - size / 2, y - size / 2, size, size);

        // Border
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - size / 2, y - size / 2, size, size);

        // Glow
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        ctx.shadowBlur = 0;
    }

    // ============================================
    // NARRATIVE LINES (Phase B)
    // ============================================

    _prepareNarrativeLines(layerData) {
        this.phaseB.narrativeLines = [];

        if (!layerData) return;

        // Titre: Boss désinstallé
        this.phaseB.narrativeLines.push({
            text: `${layerData.bossName} A ÉTÉ DÉSINSTALLÉ.`,
            size: 36,
            color: '#FFB000',
            alpha: 0,
            targetAlpha: 1,
            delay: 200,
            y: 550
        });

        // Citation de mort
        if (layerData.bossQuoteDeath) {
            this.phaseB.narrativeLines.push({
                text: `"${layerData.bossQuoteDeath}"`,
                size: 14,
                color: '#888888',
                italic: true,
                alpha: 0,
                targetAlpha: 0.8,
                delay: 1500,
                y: 590
            });
        }

        // Texte transition
        if (layerData.transitionText) {
            this.phaseB.narrativeLines.push({
                text: layerData.transitionText,
                size: 16,
                color: '#cccccc',
                alpha: 0,
                targetAlpha: 1,
                delay: 3000,
                y: 640,
                maxWidth: 600
            });
        }
    }

    _updateNarrativeLines(deltaTime) {
        const elapsed = this.phaseB.timer;

        for (const line of this.phaseB.narrativeLines) {
            if (elapsed >= line.delay) {
                const fadeProgress = Math.min(1, (elapsed - line.delay) / 500);
                line.alpha = fadeProgress * line.targetAlpha;
            }
        }
    }

    _renderNarrativeLines(ctx) {
        for (const line of this.phaseB.narrativeLines) {
            if (line.alpha <= 0) continue;

            ctx.globalAlpha = line.alpha;
            ctx.font = `${line.italic ? 'italic ' : ''}${line.size}px "Space Mono", monospace`;
            ctx.fillStyle = line.color;
            ctx.textAlign = 'center';

            if (line.maxWidth) {
                this._drawWrappedText(ctx, line.text, this.canvas.width / 2, line.y, line.maxWidth);
            } else {
                ctx.fillText(line.text, this.canvas.width / 2, line.y);
            }

            ctx.globalAlpha = 1;
        }
    }

    _drawWrappedText(ctx, text, x, y, maxWidth) {
        const words = text.split(' ');
        let line = '';
        let lineY = y;
        const lineHeight = 22;

        for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word;
            if (ctx.measureText(testLine).width > maxWidth && line) {
                ctx.fillText(line, x, lineY);
                line = word;
                lineY += lineHeight;
            } else {
                line = testLine;
            }
        }
        if (line) {
            ctx.fillText(line, x, lineY);
        }
    }

    // ============================================
    // PARTICLES & STARS
    // ============================================

    _initStars() {
        const cfg = TRANSITION_CONFIG.particles.stars;
        this.phaseB.stars = [];

        for (let i = 0; i < cfg.count; i++) {
            this.phaseB.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize),
                alpha: cfg.minAlpha + Math.random() * (cfg.maxAlpha - cfg.minAlpha)
            });
        }
    }

    _renderStars(ctx, alpha) {
        ctx.globalAlpha = alpha;

        for (const star of this.phaseB.stars) {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }

    _initParticles() {
        const cfg = TRANSITION_CONFIG.particles.ambient;
        this.particles = [];

        for (let i = 0; i < cfg.count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * cfg.speed,
                vy: (Math.random() - 0.5) * cfg.speed,
                size: cfg.size,
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }

    _updateParticles(deltaTime) {
        for (const p of this.particles) {
            p.x += p.vx * deltaTime * 0.01;
            p.y += p.vy * deltaTime * 0.01;

            // Wrap around
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
        }
    }

    _renderParticles(ctx, globalAlpha) {
        ctx.globalAlpha = globalAlpha;

        for (const p of this.particles) {
            ctx.fillStyle = `rgba(0, 255, 255, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }

    // ============================================
    // UTILITIES
    // ============================================

    _loadPortrait(sage, phase) {
        if (!sage?.portrait) return;

        const img = new Image();
        img.onload = () => {
            if (phase === 'phaseA') {
                this.phaseA.portraitImage = img;
                this.phaseA.portraitLoaded = true;
            } else if (phase === 'phaseC') {
                this.phaseC.portraitImage = img;
                this.phaseC.portraitLoaded = true;
            }
        };
        img.onerror = () => {
            console.warn(`[LayerTransitionScreen] Failed to load portrait: ${sage.portrait}`);
            if (phase === 'phaseA') {
                this.phaseA.portraitLoadFailed = true;
            } else if (phase === 'phaseC') {
                this.phaseC.portraitLoadFailed = true;
            }
        };
        img.src = sage.portrait;
    }

    /**
     * Construit l'objet state pour DialogueRenderer
     * @param {'A' | 'C'} phase
     * @returns {object}
     */
    _buildPortraitState(phase) {
        const phaseState = phase === 'A' ? this.phaseA : this.phaseC;
        return {
            timer: this.timer,
            glowPulse: this.glowPulse,
            fadeAlpha: phaseState.fadeAlpha,
            portraitScale: phase === 'A' ? phaseState.portraitScale : 1,
            portraitLoaded: phaseState.portraitLoaded,
            portraitLoadFailed: phaseState.portraitLoadFailed || false,
            portraitImage: phaseState.portraitImage
        };
    }

    _getSageForLayer(layerNumber) {
        // Mapping layer → boss → sage
        const layerInfo = getLayerInfo(layerNumber);
        if (layerInfo?.bossId) {
            return getSageForBoss(layerInfo.bossId);
        }
        return null;
    }

    _easeOutBack(t) {
        if (t <= 0) return 0;
        if (t >= 1) return 1;
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    // ============================================
    // POWER ICONS - Préchargement PNG
    // ============================================

    _initPowerIcons() {
        // Base path - détecte si on est sur serveur ou fichier local
        const isLocalFile = window.location.protocol === 'file:';
        const basePath = isLocalFile ? 'images/game/powers/' : '/images/game/powers/';

        this.powerIconPaths = {
            power_wiki_boost: basePath + 'wiki-boost.png',
            power_edit_shield: basePath + 'bouclier-editorial.png',
            power_swift_tab: basePath + 'onglet-eclair.png',
            power_multi_tab: basePath + 'multis-onglets.png',
            power_streak_freeze: basePath + 'emergency-teleport.png',
            power_xp_burst: basePath + 'leaks-massifs.png',
            power_kernel_panic: basePath + 'kernel-panik.png',
            power_sudo_kill: basePath + 'sudo-kill.png',
            power_ddos_mode: basePath + 'mode-ddos.png',
            power_ghost_mode: basePath + 'mode-fantome.png',
            power_gpio_boost: basePath + 'boost-gpio.png',
            power_overclock: basePath + 'overclocking.png',
            power_git_revert: basePath + 'chmod-777.png',
            power_merge_master: basePath + 'liberation-code.png'
        };

        this.powerIconImages = {};
        this.iconsLoaded = false;

        // Précharger immédiatement
        this._preloadPowerIcons();
    }

    async _preloadPowerIcons() {
        const promises = Object.entries(this.powerIconPaths).map(([id, path]) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.powerIconImages[id] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`[LayerTransitionScreen] Failed to load icon: ${path}`);
                    resolve();
                };
                img.src = path;
            });
        });

        await Promise.all(promises);
        this.iconsLoaded = true;
        console.log(`[LayerTransitionScreen] ${Object.keys(this.powerIconImages).length}/14 power icons loaded`);
    }
}
