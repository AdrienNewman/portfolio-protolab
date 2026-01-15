// ============================================
// DIALOGUE BUBBLE - IRC-Style Giant Bubble
// Bulle dialogue geante avec typewriter IRC
// V2.0 - SageScreen Refactoring
// ============================================

/**
 * DialogueBubble - Bulle dialogue geante IRC-style
 *
 * Fonctionnalites :
 * - Typewriter ligne par ligne (style IRC)
 * - Curseur _ clignotant
 * - Acceleration x3 avec ENTER
 * - Support multi-lignes (\n)
 * - Bordure avec glow couleur sage
 */
export class DialogueBubble {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Texte
        this.text = '';
        this.lines = [];
        this.displayedLines = [];
        this.currentLineIndex = 0;
        this.currentCharIndex = 0;
        this.isComplete = false;

        // Timing
        this.charSpeed = 30; // ms par caractere
        this.charTimer = 0;
        this.skipMultiplier = 1; // x3 quand on accelere

        // Curseur
        this.cursorVisible = true;
        this.cursorTimer = 0;
        this.cursorBlinkSpeed = 500;

        // Style
        this.accentColor = '#00ffff';

        // Dimensions (geante, en bas)
        this.padding = { x: 40, y: 25 };
        this.borderRadius = 8;

        // Position personnalisable (null = auto-calculée)
        this.customX = null;
        this.customY = null;
    }

    /**
     * Définit une position personnalisée pour la bulle
     * @param {number} x - Position X du centre
     * @param {number} y - Position Y du haut de la bulle
     */
    setPosition(x, y) {
        this.customX = x;
        this.customY = y;
    }

    /**
     * Réinitialise à la position auto-calculée
     */
    resetPosition() {
        this.customX = null;
        this.customY = null;
    }

    // ============================================
    // PUBLIC API
    // ============================================

    /**
     * Definit le texte a afficher
     * @param {string} text - Texte avec \n pour sauts de ligne
     * @param {string} accentColor - Couleur bordure/curseur
     */
    setText(text, accentColor = '#00ffff') {
        this.text = text || '';
        this.accentColor = accentColor;

        // Parser les lignes
        this.lines = this.text.split('\n').filter(l => l.trim());
        this.displayedLines = [];
        this.currentLineIndex = 0;
        this.currentCharIndex = 0;
        this.isComplete = false;

        // Reset timers
        this.charTimer = 0;
        this.cursorTimer = 0;
        this.skipMultiplier = 1;
    }

    /**
     * Met a jour l'animation typewriter
     * @param {number} deltaTime - Temps ecoule en ms
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

            if (this.currentLineIndex >= this.lines.length) {
                this.isComplete = true;
                this.cursorVisible = false;
                break;
            }

            const currentLine = this.lines[this.currentLineIndex];
            this.currentCharIndex++;

            if (this.currentCharIndex >= currentLine.length) {
                // Ligne complete
                this.displayedLines.push(currentLine);
                this.currentLineIndex++;
                this.currentCharIndex = 0;
            }
        }
    }

    /**
     * Accelere le typewriter x3
     */
    accelerate() {
        this.skipMultiplier = 3;
    }

    /**
     * Skip directement a la fin
     */
    skipToEnd() {
        this.displayedLines = [...this.lines];
        this.currentLineIndex = this.lines.length;
        this.isComplete = true;
        this.cursorVisible = false;
    }

    /**
     * Reset la bulle
     */
    reset() {
        this.text = '';
        this.lines = [];
        this.displayedLines = [];
        this.currentLineIndex = 0;
        this.currentCharIndex = 0;
        this.isComplete = false;
        this.charTimer = 0;
        this.cursorTimer = 0;
        this.skipMultiplier = 1;
    }

    /**
     * Gere l'input clavier
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
     * Rendu de la bulle
     */
    render() {
        if (!this.text || this.lines.length === 0) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Dimensions bulle geante
        const bubbleWidth = w * 0.8;
        const bubbleHeight = Math.max(120, this.lines.length * 32 + this.padding.y * 2 + 20);

        // Position : custom ou auto-calculée
        const bubbleX = this.customX !== null
            ? this.customX - bubbleWidth / 2
            : (w - bubbleWidth) / 2;
        const bubbleY = this.customY !== null
            ? this.customY
            : h * 0.52;

        // ============================================
        // BACKGROUND
        // ============================================
        ctx.fillStyle = 'rgba(10, 10, 20, 0.95)';
        this._drawRoundedRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, this.borderRadius);
        ctx.fill();

        // Inner glow
        ctx.fillStyle = this._hexToRgba(this.accentColor, 0.05);
        this._drawRoundedRect(bubbleX + 4, bubbleY + 4, bubbleWidth - 8, bubbleHeight - 8, this.borderRadius - 2);
        ctx.fill();

        // ============================================
        // BORDURE + GLOW
        // ============================================
        ctx.strokeStyle = this.accentColor;
        ctx.lineWidth = 4;
        ctx.shadowColor = this.accentColor;
        ctx.shadowBlur = 20;
        this._drawRoundedRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, this.borderRadius);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // ============================================
        // TEXTE IRC-STYLE
        // ============================================
        ctx.font = '18px "Space Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const lineHeight = 32;
        const textX = bubbleX + this.padding.x;
        let textY = bubbleY + this.padding.y;

        // Lignes completes
        for (const line of this.displayedLines) {
            ctx.fillText(line, textX, textY);
            textY += lineHeight;
        }

        // Ligne en cours (partielle)
        if (!this.isComplete && this.currentLineIndex < this.lines.length) {
            const currentLine = this.lines[this.currentLineIndex];
            const partialText = currentLine.substring(0, this.currentCharIndex);
            ctx.fillText(partialText, textX, textY);

            // Curseur _
            if (this.cursorVisible) {
                const cursorX = textX + ctx.measureText(partialText).width + 4;
                ctx.fillStyle = this.accentColor;
                ctx.fillText('_', cursorX, textY);
            }
        }

        // ============================================
        // INDICATEUR SUITE (si complet)
        // ============================================
        if (this.isComplete && this.lines.length > 0) {
            const arrowBlink = Math.floor(Date.now() / 500) % 2;
            if (arrowBlink === 0) {
                ctx.font = '16px Arial';
                ctx.fillStyle = this.accentColor;
                ctx.textAlign = 'right';
                ctx.fillText('[ENTREE]', bubbleX + bubbleWidth - this.padding.x, bubbleY + bubbleHeight - this.padding.y);
            }
        }
    }

    // ============================================
    // PRIVATE METHODS
    // ============================================

    _drawRoundedRect(x, y, width, height, radius) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    _hexToRgba(hex, alpha) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
        }
        return `rgba(0, 255, 255, ${alpha})`;
    }

    // ============================================
    // GETTERS
    // ============================================

    get complete() {
        return this.isComplete;
    }
}
