// ============================================
// STAR WARS CRAWL - L'Odyssée d'OSI
// Texte défilant simple 2D style Star Wars
// ============================================

import { PORTFOLIO_COLORS } from '../config/gameConfig.js';
import { getCrawlText } from '../data/ScenarioData.js';

export class StarWarsCrawl {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // Texte du crawl
        this.lines = getCrawlText();

        // Configuration du défilement 2D simple
        this.textStartY = this.height + 50;        // Départ juste sous l'écran
        this.scrollSpeed = 60;                      // Pixels par seconde (plus rapide)

        // État
        this.scrollOffset = 0;
        this.active = false;
        this.complete = false;

        // Couleur Star Wars (jaune doré)
        this.textColor = '#FFE81F';

        // Configuration du texte
        this.fontSize = 32;
        this.lineHeight = 1.8;

        // Calcul de la distance totale
        this.totalTextHeight = this.lines.length * this.fontSize * this.lineHeight;
        this.totalDistance = this.textStartY + this.totalTextHeight + 100;
    }

    start() {
        this.active = true;
        this.complete = false;
        this.scrollOffset = 0;
    }

    update(deltaTime) {
        if (!this.active || this.complete) return false;

        this.scrollOffset += this.scrollSpeed * deltaTime;

        // Vérifier si le crawl est terminé (tout le texte est passé en haut)
        if (this.scrollOffset >= this.totalDistance) {
            this.complete = true;
            this.active = false;
            return true;
        }

        return false;
    }

    draw(ctx) {
        if (!this.active && !this.complete) return;

        ctx.save();

        const centerX = this.width / 2;

        // Pour chaque ligne de texte
        this.lines.forEach((line, index) => {
            // Position Y simple (défilement linéaire)
            const y = this.textStartY + (index * this.fontSize * this.lineHeight) - this.scrollOffset;

            // Ne pas dessiner les lignes hors écran
            if (y > this.height + 50 || y < -50) return;

            // Opacité : fade aux bords (haut et bas)
            let opacity = 1;
            if (y < 100) {
                opacity = Math.max(0, y / 100);
            } else if (y > this.height - 100) {
                opacity = Math.max(0, (this.height - y) / 100);
            }

            // Dessiner la ligne
            ctx.globalAlpha = opacity;
            ctx.font = `bold ${this.fontSize}px "Bebas Neue", sans-serif`;
            ctx.fillStyle = this.textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Ombre légère pour lisibilité (très subtile)
            ctx.shadowColor = 'rgba(255, 232, 31, 0.3)';
            ctx.shadowBlur = 2;

            ctx.fillText(line, centerX, y);
        });

        ctx.restore();
    }

    isComplete() {
        return this.complete;
    }

    stop() {
        this.active = false;
        this.complete = true;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.textStartY = this.height + 50;
        this.totalDistance = this.textStartY + this.totalTextHeight + 100;
    }
}
