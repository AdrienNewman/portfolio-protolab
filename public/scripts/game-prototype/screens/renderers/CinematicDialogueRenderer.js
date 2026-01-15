// ============================================
// CINEMATIC DIALOGUE RENDERER - SageScreen Module
// Texte style cinématique (sans cadre, centré, épuré)
// V1.0 - Epic Layout Refactoring
// ============================================

import {
    LAYOUT_DIALOGUE,
    VISUAL,
    ANIMATION_TIMING,
    getTextBounds,
    hexToRgba
} from '../configs/SageScreenConfig.js';

/**
 * CinematicDialogueRenderer - Renders dialogue text in cinematic style
 * - No frame/border (unlike DialogueBubble IRC style)
 * - Centered text below portrait
 * - Typewriter effect with subtle glow
 * - Automatic line wrapping with bounds checking
 */
export class CinematicDialogueRenderer {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;

        // Texte
        this.text = '';
        this.lines = [];
        this.displayedText = '';
        this.currentCharIndex = 0;
        this.isComplete = false;

        // Timing
        this.charSpeed = ANIMATION_TIMING.CHAR_SPEED;
        this.charTimer = 0;
        this.skipMultiplier = 1;

        // Curseur
        this.cursorVisible = true;
        this.cursorTimer = 0;
        this.cursorBlinkSpeed = ANIMATION_TIMING.CURSOR_BLINK_SPEED;

        // Style
        this.accentColor = '#00ffff';
    }

    // ============================================
    // PUBLIC API
    // ============================================

    /**
     * Définit le texte à afficher
     * @param {string} text - Texte brut (sera wrappé automatiquement)
     * @param {string} accentColor - Couleur du glow
     */
    setText(text, accentColor = '#00ffff') {
        this.text = text || '';
        this.accentColor = accentColor;

        // Pré-calculer les lignes wrappées
        const bounds = getTextBounds(this.canvas.width, this.canvas.height);
        this.lines = this._wrapText(this.text, bounds.width, bounds.fontSize);

        // Limiter au nombre max de lignes
        if (this.lines.length > bounds.maxLines) {
            this.lines = this.lines.slice(0, bounds.maxLines);
            // Ajouter "..." à la dernière ligne si tronquée
            if (this.lines.length > 0) {
                const lastLine = this.lines[this.lines.length - 1];
                if (lastLine.length > 3) {
                    this.lines[this.lines.length - 1] = lastLine.slice(0, -3) + '...';
                }
            }
        }

        // Joindre les lignes pour le typewriter
        this.fullText = this.lines.join('\n');
        this.displayedText = '';
        this.currentCharIndex = 0;
        this.isComplete = false;

        // Reset timers
        this.charTimer = 0;
        this.cursorTimer = 0;
        this.skipMultiplier = 1;
    }

    /**
     * Met à jour l'animation typewriter
     * @param {number} deltaTime - Temps écoulé en ms
     */
    update(deltaTime) {
        if (this.isComplete) return;

        // Cursor blink
        this.cursorTimer += deltaTime;
        if (this.cursorTimer >= this.cursorBlinkSpeed) {
            this.cursorVisible = !this.cursorVisible;
            this.cursorTimer = 0;
        }

        // Typewriter
        this.charTimer += deltaTime * this.skipMultiplier;

        while (this.charTimer >= this.charSpeed && !this.isComplete) {
            this.charTimer -= this.charSpeed;

            if (this.currentCharIndex >= this.fullText.length) {
                this.isComplete = true;
                this.displayedText = this.fullText;
                this.cursorVisible = false;
                break;
            }

            this.currentCharIndex++;
            this.displayedText = this.fullText.substring(0, this.currentCharIndex);
        }
    }

    /**
     * Accélère le typewriter x3
     */
    accelerate() {
        this.skipMultiplier = ANIMATION_TIMING.SKIP_MULTIPLIER;
    }

    /**
     * Skip directement à la fin
     */
    skipToEnd() {
        this.displayedText = this.fullText;
        this.currentCharIndex = this.fullText.length;
        this.isComplete = true;
        this.cursorVisible = false;
    }

    /**
     * Reset
     */
    reset() {
        this.text = '';
        this.lines = [];
        this.fullText = '';
        this.displayedText = '';
        this.currentCharIndex = 0;
        this.isComplete = false;
        this.charTimer = 0;
        this.cursorTimer = 0;
        this.skipMultiplier = 1;
    }

    /**
     * Gère l'input clavier
     * @param {string} key - Code de la touche
     * @returns {string|null} - 'complete' si fini, 'accelerate' sinon
     */
    handleInput(key) {
        if (key === 'Enter' || key === 'Space') {
            if (this.isComplete) {
                return 'complete';
            } else {
                this.accelerate();
                return 'accelerate';
            }
        }
        return null;
    }

    /**
     * Rendu du dialogue cinématique
     * @param {object} state - State avec glowPulse pour animations
     */
    render(state = {}) {
        if (!this.displayedText) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const bounds = getTextBounds(w, h);

        // Calculer les lignes affichées
        const displayedLines = this.displayedText.split('\n');
        const totalLines = displayedLines.length;
        const lineHeight = bounds.lineHeight;

        // Centrer verticalement dans la zone de texte
        const totalHeight = totalLines * lineHeight;
        const startY = bounds.y + (bounds.height - totalHeight) / 2;

        ctx.save();

        // Configuration texte
        ctx.font = VISUAL.FONTS.DIALOGUE;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glow subtil
        const glowPulse = state.glowPulse || 0;
        const glowIntensity = 0.4 + Math.sin(glowPulse * 2) * 0.2;
        ctx.shadowColor = this.accentColor;
        ctx.shadowBlur = 8 * glowIntensity;

        // Rendu des lignes
        ctx.fillStyle = '#ffffff';
        displayedLines.forEach((line, i) => {
            const y = startY + i * lineHeight + lineHeight / 2;
            ctx.fillText(line, w / 2, y);
        });

        // Curseur clignotant (à la fin de la dernière ligne)
        if (!this.isComplete && this.cursorVisible && displayedLines.length > 0) {
            const lastLine = displayedLines[displayedLines.length - 1];
            const lastLineY = startY + (displayedLines.length - 1) * lineHeight + lineHeight / 2;
            const textWidth = ctx.measureText(lastLine).width;
            const cursorX = w / 2 + textWidth / 2 + 8;

            ctx.fillStyle = this.accentColor;
            ctx.fillText('_', cursorX, lastLineY);
        }

        ctx.shadowBlur = 0;
        ctx.restore();

        // Instructions en bas
        this._renderInstructions(state);
    }

    /**
     * Rendu des instructions en bas
     */
    _renderInstructions(state) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const layout = LAYOUT_DIALOGUE;

        const instructionY = h * layout.INSTRUCTIONS.Y_PERCENT;
        const glowPulse = state.glowPulse || 0;

        ctx.save();
        ctx.globalAlpha = 0.5 + Math.sin(glowPulse * 2) * 0.3;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = VISUAL.FONTS.INSTRUCTIONS;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText('ENTRÉE pour continuer', layout.INSTRUCTIONS.MARGIN_LEFT, instructionY);
        ctx.restore();
    }

    // ============================================
    // PRIVATE METHODS
    // ============================================

    /**
     * Wrap texte en lignes selon la largeur max
     * @param {string} text
     * @param {number} maxWidth
     * @param {number} fontSize
     * @returns {string[]}
     */
    _wrapText(text, maxWidth, fontSize) {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = `${fontSize}px "Space Mono", monospace`;

        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        ctx.restore();
        return lines;
    }

    // ============================================
    // GETTERS
    // ============================================

    get complete() {
        return this.isComplete;
    }
}
