// ============================================
// SAGE SCREEN - Les Sages du Libre
// Epic Layout avec deux modes: dialogue et choice
// V3.0 - Epic Layout Refactoring
// ============================================

import { getSageConfig, getSageForBoss } from '../sages/index.js';
import { getPowersForSage } from '../sages/powers/index.js';
import { playerStateManager } from '../systems/PlayerStateManager.js';
import { DialogueRenderer } from './renderers/DialogueRenderer.js';
import { PowerBadgeRenderer } from './renderers/PowerBadgeRenderer.js';
import { PaginatedDialogueRenderer } from './renderers/PaginatedDialogueRenderer.js';
import { DialogueBubble } from './components/DialogueBubble.js';
import {
    ANIMATION_TIMING,
    isPointInBadge,
    calculatePortraitSize
} from './configs/SageScreenConfig.js';

export class SageScreen {
    constructor(canvas, audioManager = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;

        // Renderers
        this.dialogueRenderer = new DialogueRenderer(this.ctx, canvas);
        this.powerBadgeRenderer = new PowerBadgeRenderer(this.ctx, canvas);

        // Paginated dialogue renderer (support longs textes multi-pages)
        this.cinematicDialogue = new PaginatedDialogueRenderer(this.ctx, canvas);

        // DialogueBubble IRC-style (conservé en backup pour intro Jimmy)
        this.dialogueBubble = new DialogueBubble(canvas);

        this.active = false;
        this.phase = 'idle'; // idle, fade-in, portrait, dialogue, choice, selected, fade-out
        this.timer = 0;

        // Layout mode ('dialogue' pour texte large, 'choice' pour badges)
        this.layoutMode = 'dialogue';

        // Sage data
        this.currentSage = null;
        this.dialogueText = '';
        this.isIntroDialogue = false;

        // Animation state
        this.fadeAlpha = 0;
        this.portraitScale = 0;
        this.glowPulse = 0;

        // Ambient particles
        this.particles = [];

        // Timing config (from centralized config)
        this.config = {
            fadeInDuration: ANIMATION_TIMING.FADE_IN_DURATION,
            portraitAppearDuration: ANIMATION_TIMING.PORTRAIT_APPEAR_DURATION,
            fadeOutDuration: ANIMATION_TIMING.FADE_OUT_DURATION,
            badgeAppearDuration: ANIMATION_TIMING.BADGE_APPEAR_DURATION,
            badgeAppearDelay: ANIMATION_TIMING.BADGE_APPEAR_DELAY,
            selectionFlashDuration: ANIMATION_TIMING.SELECTION_FLASH_DURATION
        };

        // Callbacks
        this.onComplete = null;
        this.onDialogueEnd = null;
        this.onPowerSelected = null;

        // Input handling
        this.handleInput = this.handleInput.bind(this);
        this.canSkip = false;

        // Portrait image loading
        this.portraitImage = null;
        this.portraitLoaded = false;
        this.portraitLoadFailed = false;
        this.portraitLoadTimeout = 3000;

        // Power choice state
        this.powers = [];
        this.hoveredIndex = -1;
        this.selectedIndex = -1;
        this.selectionFlash = 0;
        this.badgeScales = [0, 0];
        this.badgeGlows = [0.3, 0.3];
        this.badgePositions = [{ x: 0, y: 0 }, { x: 0, y: 0 }];

        // Choice input bindings
        this.handleKeydownChoice = this.handleKeydownChoice.bind(this);
        this.handleMouseMoveChoice = this.handleMouseMoveChoice.bind(this);
        this.handleClickChoice = this.handleClickChoice.bind(this);
    }

    /**
     * Show sage after boss defeat
     */
    showForBoss(bossId, isIntro = false) {
        const sage = getSageForBoss(bossId);
        if (!sage) {
            console.warn(`[SageScreen] No sage found for boss: ${bossId}`);
            if (this.onComplete) this.onComplete(null);
            return;
        }
        this.show(sage, isIntro);
    }

    /**
     * Show sage directly
     */
    show(sage, isIntro = false) {
        if (typeof sage === 'string') {
            sage = getSageConfig(sage);
        }

        if (!sage) {
            console.error('[SageScreen] Invalid sage');
            if (this.onComplete) this.onComplete(null);
            return;
        }

        // Précharger les icônes de pouvoirs (async, non-bloquant)
        this.powerBadgeRenderer.preloadIcons();

        this.currentSage = sage;
        this.isIntroDialogue = isIntro;
        this.dialogueText = isIntro ? sage.introDialogue : sage.postBossDialogue;

        // Portrait loading
        this.portraitImage = null;
        this.portraitLoaded = false;
        this.portraitLoadFailed = false;

        if (sage.portrait) {
            this.portraitImage = new Image();
            const loadTimeout = setTimeout(() => {
                if (!this.portraitLoaded) {
                    console.warn(`[SageScreen] Portrait load timeout: ${sage.portrait}`);
                    this.portraitLoadFailed = true;
                }
            }, this.portraitLoadTimeout);

            this.portraitImage.onload = () => {
                clearTimeout(loadTimeout);
                this.portraitLoaded = true;
            };

            this.portraitImage.onerror = () => {
                clearTimeout(loadTimeout);
                this.portraitLoadFailed = true;
            };

            this.portraitImage.src = sage.portrait;
        } else {
            this.portraitLoadFailed = true;
        }

        // Layout mode: dialogue pour le texte, choice pour les badges
        this.layoutMode = 'dialogue';
        this.dialogueRenderer.setMode('dialogue');

        // Setup CinematicDialogue pour le texte (style épuré)
        if (this.dialogueText) {
            this.cinematicDialogue.setText(this.dialogueText, sage.accentColor);
        }

        // Setup DialogueBubble IRC en backup si intro
        if (isIntro && this.dialogueText) {
            this.dialogueBubble.setText(this.dialogueText, sage.accentColor);
        }

        this.active = true;
        this.phase = 'fade-in';
        this.timer = 0;
        this.fadeAlpha = 0;
        this.portraitScale = 0;
        this.canSkip = false;

        this.initParticles();

        window.addEventListener('keydown', this.handleInput);
        window.addEventListener('click', this.handleInput);

        // Debug: log config values to verify they're loaded
        const testSize = calculatePortraitSize(this.canvas.width, this.canvas.height, 'dialogue');
        console.log(`[SageScreen] Showing ${sage.name} (${isIntro ? 'intro' : 'post-boss'}) - layout: ${this.layoutMode}`);
        console.log(`[SageScreen] DEBUG: Canvas=${this.canvas.width}x${this.canvas.height}, PortraitSize=${testSize.toFixed(0)}px`);
    }

    initParticles() {
        this.particles = [];
        const color = this.currentSage?.accentColor || '#00ffff';

        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedY: Math.random() * 0.5 - 0.25,
                speedX: Math.random() * 0.3 - 0.15,
                alpha: Math.random() * 0.5 + 0.2,
                color: color
            });
        }
    }

    handleInput(e) {
        if (!this.active || !this.canSkip) return;

        if (e.type === 'keydown' && (e.code === 'Enter' || e.code === 'Space')) {
            this.skipOrComplete(e.code);
        } else if (e.type === 'click') {
            this.skipOrComplete('Enter');
        }
    }

    skipOrComplete(key) {
        if (this.phase === 'dialogue') {
            // Gérer le PaginatedDialogue (support multi-pages)
            const result = this.cinematicDialogue.handleInput(key);

            if (result === 'complete') {
                if (this.isIntroDialogue) {
                    // Intro terminée -> fade out (pas de choix de pouvoir)
                    this.phase = 'fade-out';
                    this.timer = 0;
                } else {
                    // Post-boss: passer au choix de pouvoirs
                    this._transitionToChoice();
                }
            }
            // 'next-page' : le renderer charge la page suivante automatiquement
            // 'accelerate' : accélère le typewriter de la page actuelle
        }
    }

    /**
     * Transition vers la phase de choix de pouvoir
     * Change le layout mode et setup les badges
     */
    _transitionToChoice() {
        this.powers = getPowersForSage(this.currentSage.id);

        if (this.powers.length >= 2) {
            // Changer le mode de layout
            this.layoutMode = 'choice';
            this.dialogueRenderer.setMode('choice');

            this.phase = 'choice';
            this.timer = 0;
            this.badgeScales = [0, 0];
            this.badgeGlows = [0.3, 0.3];
            this.hoveredIndex = -1;
            this.selectedIndex = -1;
            this.canSkip = false;

            window.removeEventListener('keydown', this.handleInput);
            window.removeEventListener('click', this.handleInput);
            window.addEventListener('keydown', this.handleKeydownChoice);
            window.addEventListener('mousemove', this.handleMouseMoveChoice);
            window.addEventListener('click', this.handleClickChoice);

            console.log(`[SageScreen] Choice phase: ${this.powers.length} powers available - layout: ${this.layoutMode}`);
        } else {
            this.phase = 'fade-out';
            this.timer = 0;
        }
    }

    update(deltaTime) {
        if (!this.active) return;

        this.timer += deltaTime;
        this.glowPulse += deltaTime * 0.003;

        this.updateParticles(deltaTime);

        switch (this.phase) {
            case 'fade-in':
                this.fadeAlpha = Math.min(1, this.timer / this.config.fadeInDuration);
                if (this.timer >= this.config.fadeInDuration) {
                    this.phase = 'portrait';
                    this.timer = 0;
                }
                break;

            case 'portrait':
                this.portraitScale = Math.min(1, this.timer / this.config.portraitAppearDuration);
                if (this.portraitScale < 1) {
                    this.portraitScale = 1 - Math.pow(1 - this.portraitScale, 3);
                }
                if (this.timer >= this.config.portraitAppearDuration) {
                    this.phase = 'dialogue';
                    this.timer = 0;
                    this.canSkip = true;
                    // On reste en mode dialogue pour afficher le texte cinématique
                }
                break;

            case 'dialogue':
                // Update CinematicDialogue (style épuré)
                this.cinematicDialogue.update(deltaTime);
                break;

            case 'choice':
                this.updateChoicePhase();
                break;

            case 'selected':
                this.selectionFlash = this.timer / this.config.selectionFlashDuration;
                if (this.timer >= this.config.selectionFlashDuration) {
                    this.phase = 'fade-out';
                    this.timer = 0;
                }
                break;

            case 'fade-out':
                this.fadeAlpha = 1 - (this.timer / this.config.fadeOutDuration);
                if (this.timer >= this.config.fadeOutDuration) {
                    this.complete();
                }
                break;
        }
    }

    updateChoicePhase() {
        // Badge animations (easeOutBack)
        const badge0Progress = Math.min(1, this.timer / this.config.badgeAppearDuration);
        this.badgeScales[0] = this.easeOutBack(badge0Progress);

        const badge1Start = this.config.badgeAppearDelay;
        const badge1Progress = Math.max(0, (this.timer - badge1Start) / this.config.badgeAppearDuration);
        this.badgeScales[1] = Math.min(1, this.easeOutBack(badge1Progress));

        // Update glows based on hover
        for (let i = 0; i < 2; i++) {
            const targetGlow = (this.hoveredIndex === i) ? 1 : 0.3;
            this.badgeGlows[i] += (targetGlow - this.badgeGlows[i]) * 0.1;
        }
    }

    updateParticles(deltaTime) {
        for (const p of this.particles) {
            p.x += p.speedX * deltaTime * 0.1;
            p.y += p.speedY * deltaTime * 0.1;

            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
        }
    }

    render() {
        if (!this.active || !this.currentSage) return;

        const ctx = this.ctx;
        const sage = this.currentSage;

        // Build state object for renderers
        const state = this._buildState();

        // Vignette background with fade alpha for smooth transitions
        this.dialogueRenderer.renderVignette(sage, this.fadeAlpha);

        // Contenu avec fade alpha
        ctx.save();
        ctx.globalAlpha = this.fadeAlpha;

        // Particles
        this.dialogueRenderer.renderParticles(this.particles, this.fadeAlpha);

        // Portrait (toujours visible, taille selon layoutMode)
        this.dialogueRenderer.renderPortrait(state, sage);

        // Phase-specific rendering
        if (this.phase === 'dialogue') {
            // Cinematic dialogue (style épuré, grande zone texte)
            this.cinematicDialogue.render(state);
        }

        // Power badges (choice/selected phases)
        if (this.phase === 'choice' || this.phase === 'selected') {
            this.powerBadgeRenderer.renderPowerBadges(state, sage);
        }

        ctx.restore();
    }

    _buildState() {
        return {
            timer: this.timer,
            glowPulse: this.glowPulse,
            fadeAlpha: this.fadeAlpha,
            portraitScale: this.portraitScale,
            portraitLoaded: this.portraitLoaded,
            portraitLoadFailed: this.portraitLoadFailed,
            portraitImage: this.portraitImage,
            dialogueText: this.dialogueText,
            phase: this.phase,
            powers: this.powers,
            hoveredIndex: this.hoveredIndex,
            selectedIndex: this.selectedIndex,
            badgeScales: this.badgeScales,
            badgeGlows: this.badgeGlows,
            badgePositions: this.badgePositions,
            selectionFlash: this.selectionFlash
        };
    }

    renderIntroInstructions() {
        const ctx = this.ctx;
        const h = this.canvas.height;

        ctx.save();
        ctx.globalAlpha = 0.5 + Math.sin(this.glowPulse * 2) * 0.3;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '14px "Space Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText('ENTREE pour continuer', 40, h - 30);
        ctx.restore();
    }

    // ============================================
    // CHOICE PHASE INPUT HANDLERS
    // ============================================

    handleKeydownChoice(e) {
        if (!this.active || this.phase !== 'choice') return;

        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            this.hoveredIndex = 0;
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            this.hoveredIndex = 1;
        } else if (e.code === 'Enter' || e.code === 'Space') {
            if (this.hoveredIndex >= 0) this.selectPower(this.hoveredIndex);
        } else if (e.code === 'Digit1') {
            this.selectPower(0);
        } else if (e.code === 'Digit2') {
            this.selectPower(1);
        }
    }

    handleMouseMoveChoice(e) {
        if (!this.active || this.phase !== 'choice') return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.hoveredIndex = -1;
        for (let i = 0; i < this.badgePositions.length; i++) {
            // Utiliser le helper de la config pour la détection
            if (isPointInBadge(mouseX, mouseY, this.badgePositions[i])) {
                this.hoveredIndex = i;
                break;
            }
        }
    }

    handleClickChoice(e) {
        if (!this.active || this.phase !== 'choice') return;
        if (this.hoveredIndex >= 0) this.selectPower(this.hoveredIndex);
    }

    selectPower(index) {
        if (index < 0 || index >= this.powers.length) return;

        this.selectedIndex = index;
        this.phase = 'selected';
        this.timer = 0;

        const power = this.powers[index];
        playerStateManager.addPower(power.id);

        if (this.onPowerSelected) this.onPowerSelected(power);
        if (this.audioManager) this.audioManager.play('powerup');

        window.removeEventListener('keydown', this.handleKeydownChoice);
        window.removeEventListener('mousemove', this.handleMouseMoveChoice);
        window.removeEventListener('click', this.handleClickChoice);

        console.log(`[SageScreen] Power selected: ${power.name}`);
    }

    // ============================================
    // UTILITY
    // ============================================

    easeOutBack(t) {
        if (t <= 0) return 0;
        if (t >= 1) return 1;
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    complete() {
        this.active = false;
        this.phase = 'idle';
        this.layoutMode = 'dialogue';

        window.removeEventListener('keydown', this.handleInput);
        window.removeEventListener('click', this.handleInput);
        window.removeEventListener('keydown', this.handleKeydownChoice);
        window.removeEventListener('mousemove', this.handleMouseMoveChoice);
        window.removeEventListener('click', this.handleClickChoice);

        // Reset renderers
        this.cinematicDialogue.reset();
        this.dialogueBubble.reset();
        this.dialogueRenderer.setMode('dialogue');

        if (this.onComplete) {
            this.onComplete(this.currentSage);
        }
    }

    destroy() {
        window.removeEventListener('keydown', this.handleInput);
        window.removeEventListener('click', this.handleInput);
        window.removeEventListener('keydown', this.handleKeydownChoice);
        window.removeEventListener('mousemove', this.handleMouseMoveChoice);
        window.removeEventListener('click', this.handleClickChoice);
    }

    getCurrentSagePowers() {
        if (!this.currentSage) return [];
        return getPowersForSage(this.currentSage.id);
    }
}
