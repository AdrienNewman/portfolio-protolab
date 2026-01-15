// ============================================
// PAGINATED DIALOGUE RENDERER - SageScreen Module
// Extension de CinematicDialogueRenderer avec pagination multi-pages
// V1.0 - Support des longs dialogues narratifs
// ============================================

import { CinematicDialogueRenderer } from './CinematicDialogueRenderer.js';
import {
    LAYOUT_DIALOGUE,
    VISUAL,
    getTextBounds
} from '../configs/SageScreenConfig.js';

/**
 * PaginatedDialogueRenderer - Gère les dialogues multi-pages
 * - Découpe automatique du texte en pages de N lignes (configurable)
 * - Navigation page par page avec ENTRÉE
 * - Indicateur "Page X/Y" en bas à droite
 * - Instructions dynamiques selon l'état
 */
export class PaginatedDialogueRenderer extends CinematicDialogueRenderer {
    constructor(ctx, canvas) {
        super(ctx, canvas);

        // Pagination state
        this.pages = [];              // Array<string[]> : chaque page = array de lignes
        this.currentPageIndex = 0;    // Index page actuelle (0-indexed)
        this.totalPages = 1;          // Nombre total de pages
        this.isLastPage = true;       // Vrai si on est sur la dernière page
        this.maxLinesPerPage = 4;     // Lignes par page (sera calculé dynamiquement)
    }

    // ============================================
    // PUBLIC API (Override)
    // ============================================

    /**
     * Définit le texte à afficher et le découpe en pages
     * @param {string} text - Texte brut (sera wrappé et paginé automatiquement)
     * @param {string} accentColor - Couleur du glow
     */
    setText(text, accentColor = '#00ffff') {
        this.text = text || '';
        this.accentColor = accentColor;

        // Calculer les limites de texte
        const bounds = getTextBounds(this.canvas.width, this.canvas.height);
        this.maxLinesPerPage = bounds.maxLines;

        // Wrapper le texte en lignes
        const allLines = this._wrapTextWithParagraphs(this.text, bounds.width, bounds.fontSize);

        // Découper en pages
        this.pages = this._splitIntoPages(allLines, this.maxLinesPerPage);
        this.totalPages = this.pages.length || 1;
        this.currentPageIndex = 0;
        this.isLastPage = (this.totalPages === 1);

        // Charger la première page
        this._loadCurrentPage();
    }

    /**
     * Gère l'input clavier avec support pagination
     * @param {string} key - Code de la touche
     * @returns {string|null} - 'complete', 'next-page', 'accelerate', ou null
     */
    handleInput(key) {
        if (key === 'Enter' || key === 'Space') {
            if (this.isComplete) {
                // Page terminée - passer à la suivante ou finir
                if (!this.isLastPage) {
                    return this.nextPage();
                } else {
                    return 'complete';
                }
            } else {
                // Accélérer le typewriter
                this.accelerate();
                return 'accelerate';
            }
        }
        return null;
    }

    /**
     * Passe à la page suivante
     * @returns {string} - 'next-page' ou 'complete' si dernière page
     */
    nextPage() {
        if (this.currentPageIndex < this.totalPages - 1) {
            this.currentPageIndex++;
            this.isLastPage = (this.currentPageIndex === this.totalPages - 1);
            this._loadCurrentPage();
            return 'next-page';
        }
        return 'complete';
    }

    /**
     * Reset complet
     */
    reset() {
        super.reset();
        this.pages = [];
        this.currentPageIndex = 0;
        this.totalPages = 1;
        this.isLastPage = true;
    }

    // ============================================
    // PRIVATE METHODS
    // ============================================

    /**
     * Charge la page actuelle dans le renderer
     */
    _loadCurrentPage() {
        const pageLines = this.pages[this.currentPageIndex] || [];
        this.lines = pageLines;
        this.fullText = pageLines.join('\n');
        this.displayedText = '';
        this.currentCharIndex = 0;
        this.isComplete = false;
        this.charTimer = 0;
        this.cursorTimer = 0;
        this.skipMultiplier = 1;
    }

    /**
     * Wrapper le texte en gérant les paragraphes (lignes vides)
     * @param {string} text
     * @param {number} maxWidth
     * @param {number} fontSize
     * @returns {string[]} - Array de lignes (incluant lignes vides pour paragraphes)
     */
    _wrapTextWithParagraphs(text, maxWidth, fontSize) {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = `${fontSize}px "Space Mono", monospace`;

        const lines = [];
        // Séparer par double saut de ligne (paragraphes)
        const paragraphs = text.split(/\n\n+/);

        paragraphs.forEach((paragraph, pIndex) => {
            // Pour chaque paragraphe, wrapper le texte
            const words = paragraph.replace(/\n/g, ' ').split(' ').filter(w => w);
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

            // Ajouter une ligne vide entre paragraphes (sauf après le dernier)
            if (pIndex < paragraphs.length - 1) {
                lines.push('');
            }
        });

        ctx.restore();
        return lines;
    }

    /**
     * Découpe les lignes en pages
     * @param {string[]} allLines
     * @param {number} linesPerPage
     * @returns {string[][]} - Array de pages, chaque page étant un array de lignes
     */
    _splitIntoPages(allLines, linesPerPage) {
        const pages = [];
        let currentPage = [];

        for (const line of allLines) {
            currentPage.push(line);

            if (currentPage.length >= linesPerPage) {
                pages.push(currentPage);
                currentPage = [];
            }
        }

        // Ajouter la dernière page si non vide
        if (currentPage.length > 0) {
            pages.push(currentPage);
        }

        // Au moins une page vide si aucun contenu
        if (pages.length === 0) {
            pages.push(['']);
        }

        return pages;
    }

    /**
     * Rendu des instructions avec pagination (Override)
     * @param {object} state
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

        // Instruction dynamique (gauche)
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';

        let instructionText;
        if (!this.isComplete) {
            instructionText = 'ENTRÉE pour accélérer';
        } else if (!this.isLastPage) {
            instructionText = 'ENTRÉE pour la suite';
        } else {
            instructionText = 'ENTRÉE pour continuer';
        }

        ctx.fillText(instructionText, layout.INSTRUCTIONS.MARGIN_LEFT, instructionY);

        // Indicateur de page (droite) - seulement si multi-pages
        if (this.totalPages > 1) {
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText(
                `${this.currentPageIndex + 1}/${this.totalPages}`,
                w - layout.INSTRUCTIONS.MARGIN_LEFT,
                instructionY
            );
        }

        ctx.restore();
    }

    // ============================================
    // GETTERS
    // ============================================

    get pageInfo() {
        return {
            current: this.currentPageIndex + 1,
            total: this.totalPages,
            isLast: this.isLastPage
        };
    }
}
