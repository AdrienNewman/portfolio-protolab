// ============================================
// TRANSITION SCREEN - Le Retour d'UNIX
// Style Cinéma / Star Wars - Narratif et apaisant
// ============================================

import { getLayerData } from '../data/ScenarioData.js';

export class TransitionScreen {
    constructor(canvas, audioManager = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;

        this.active = false;
        this.phase = 'idle';
        this.timer = 0;

        // Système de particules (Étoiles)
        this.stars = [];
        this.initStars();

        this.wipeProgress = 0;
        this.narrativeLines = [];

        // Données pour l'écran de conclusion
        this.nextLayerLevel = 0;
        this.nextLayerName = '';
        this.conclusionAlpha = 0;

        // Configuration
        this.config = {
            wipeDuration: 1500,     // Ouverture lente (Iris)
            textStartDelay: 500,
            lineInterval: 600,      // Délai entre l'apparition des bouts de phrases
            conclusionFadeIn: 1500, // Durée du fondu de conclusion
            conclusionHold: 2000    // Temps d'affichage avant fade out
        };

        // Callbacks
        this.onComplete = null;

        // Binding des touches
        this.handleInput = this.handleInput.bind(this);
        window.addEventListener('keydown', this.handleInput);
    }

    destroy() {
        window.removeEventListener('keydown', this.handleInput);
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2,
                alpha: Math.random() * 0.8 + 0.2
            });
        }
    }

    handleInput(e) {
        if (!this.active) return;

        // Seule la touche ENTRÉE permet de passer
        if (e.code === 'Enter' || e.key === 'Enter') {
            if (this.phase === 'reading') {
                this.triggerSkip();
            }
        }
    }

    show(completedWaveIndex, nextWaveIndex, stats) {
        this.active = true;
        this.phase = 'wipe-in';
        this.timer = 0;
        this.wipeProgress = 0;

        // Convertir les index de wave en niveaux OSI (wave 0 = layer 7, wave 1 = layer 6, etc.)
        const completedLayerLevel = 7 - completedWaveIndex;
        this.nextLayerLevel = 7 - nextWaveIndex;

        // Récupération des textes depuis ScenarioData
        const prevData = getLayerData(completedLayerLevel);
        const nextData = getLayerData(this.nextLayerLevel);

        // Stocker le nom de la prochaine couche pour l'écran de conclusion
        this.nextLayerName = nextData ? nextData.name : 'Inconnue';
        this.conclusionAlpha = 0;

        this.narrativeLines = [];

        // 1. ANNONCE DRAMATIQUE (Mort du Boss précédent)
        if (prevData) {
            this.narrativeLines.push({
                text: `${prevData.bossName} A ÉTÉ DÉSINSTALLÉ.`,
                size: 40,
                color: '#FFB000', // Or Star Wars
                font: '"Bebas Neue", Arial, sans-serif',
                alpha: 0,
                targetAlpha: 1,
                delay: 200
            });

            // Citation de mort (Sous-titre)
            if (prevData.bossQuoteDeath) {
                this.narrativeLines.push({
                    text: `"${prevData.bossQuoteDeath}"`,
                    size: 16,
                    color: '#888888',
                    font: '"Space Mono", "Courier New", monospace',
                    italic: true,
                    alpha: 0,
                    targetAlpha: 1,
                    delay: 1200
                });
            }
        }

        this.narrativeLines.push({ spacer: true, size: 40 });

        // 2. NARRATION (Transition vers le niveau suivant)
        let textToDisplay = prevData ? prevData.transitionText : "Initialisation de la couche suivante...";

        // Découpage automatique du texte pour l'effet "Fade-in progressif"
        const words = textToDisplay.split(' ');
        let line = '';
        let delayCounter = 2500; // Commence après le titre

        words.forEach(word => {
            if ((line + word).length > 40) { // Max caractères par ligne
                this.narrativeLines.push({
                    text: line.trim(),
                    size: 20,
                    color: '#EEEEEE',
                    font: '"Space Mono", "Courier New", monospace',
                    alpha: 0,
                    targetAlpha: 1,
                    delay: delayCounter
                });
                line = word + ' ';
                delayCounter += this.config.lineInterval;
            } else {
                line += word + ' ';
            }
        });

        // Ajouter le reste de la ligne
        if (line.trim()) {
            this.narrativeLines.push({
                text: line.trim(),
                size: 20,
                color: '#EEEEEE',
                font: '"Space Mono", "Courier New", monospace',
                alpha: 0,
                targetAlpha: 1,
                delay: delayCounter
            });
        }
    }

    update(deltaTime) {
        if (!this.active) return false;
        this.timer += deltaTime;

        // Animation des étoiles (Parallaxe lent et apaisant)
        this.stars.forEach(star => {
            star.x -= 0.02 * deltaTime;
            if (star.x < 0) star.x = this.canvas.width;
        });

        // Phase 1: Ouverture de l'Iris (Wipe-In)
        if (this.phase === 'wipe-in') {
            this.wipeProgress = Math.min(1, this.timer / this.config.wipeDuration);
            if (this.wipeProgress >= 1) {
                this.phase = 'reading';
                this.timer = 0; // Reset timer pour lecture
            }
        }
        // Phase 2: Lecture (Apparition des textes)
        else if (this.phase === 'reading') {
            this.narrativeLines.forEach(line => {
                if (!line.spacer && this.timer > line.delay) {
                    if (line.alpha < line.targetAlpha) {
                        line.alpha += 0.02 * (deltaTime / 16);
                        if (line.alpha > line.targetAlpha) {
                            line.alpha = line.targetAlpha;
                        }
                    }
                }
            });
        }
        // Phase 3: Conclusion (Texte d'entrée dans le nouveau niveau)
        else if (this.phase === 'conclusion') {
            // Fade in du texte de conclusion
            if (this.timer < this.config.conclusionFadeIn) {
                this.conclusionAlpha = this.timer / this.config.conclusionFadeIn;
            } else {
                this.conclusionAlpha = 1;
            }

            // Après le temps d'affichage, passer au fade out
            if (this.timer >= this.config.conclusionFadeIn + this.config.conclusionHold) {
                this.phase = 'wipe-out';
                this.timer = 0;
            }
        }
        // Phase 4: Fermeture (Fade Out)
        else if (this.phase === 'wipe-out') {
            this.wipeProgress = Math.min(1, this.timer / 1000);
            if (this.wipeProgress >= 1) {
                this.active = false;
                if (this.onComplete) this.onComplete();
                return true;
            }
        }
        return false;
    }

    draw() {
        if (!this.active) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        // 1. Fond Noir
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        // 2. Étoiles
        ctx.fillStyle = '#FFFFFF';
        this.stars.forEach(star => {
            ctx.globalAlpha = star.alpha;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // 3. Effet Iris (Masque)
        if (this.phase === 'wipe-in') {
            const maxRadius = Math.sqrt(w * w + h * h);
            const radius = maxRadius * this.wipeProgress;

            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, w, h); // Tout l'écran
            ctx.arc(cx, cy, radius, 0, Math.PI * 2, true); // Trou au milieu
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.restore();
        }

        // 4. Textes Narratifs
        if (this.phase === 'reading' || (this.phase === 'wipe-in' && this.wipeProgress > 0.5)) {
            // Centrage vertical dynamique
            const totalHeight = this.narrativeLines.reduce((acc, l) => acc + (l.spacer ? l.size : l.size + 12), 0);
            let y = (h - totalHeight) / 2;

            this.narrativeLines.forEach(line => {
                if (line.spacer) {
                    y += line.size;
                    return;
                }

                if (line.alpha > 0.01) {
                    ctx.save();
                    ctx.globalAlpha = line.alpha;
                    ctx.fillStyle = line.color;
                    ctx.font = (line.italic ? 'italic ' : '') + line.size + 'px ' + line.font;
                    ctx.textAlign = 'center';
                    ctx.shadowColor = 'black';
                    ctx.shadowBlur = 4;
                    ctx.fillText(line.text, cx, y);
                    ctx.restore();
                }
                y += line.size + 12;
            });

            // 5. Prompt "Appuyer sur ENTRÉE" (Discret en bas)
            if (this.phase === 'reading' && this.timer > 4000) {
                const pulse = (Math.sin(Date.now() / 300) + 1) / 2 * 0.5 + 0.3;
                ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
                ctx.font = '14px "Space Mono", "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('APPUYEZ SUR [ENTRÉE] POUR CONTINUER', cx, h - 50);
            }
        }

        // 6. Écran de conclusion (Entrée dans le nouveau niveau)
        if (this.phase === 'conclusion') {
            // Fond noir avec étoiles
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            // Étoiles
            ctx.fillStyle = '#FFFFFF';
            this.stars.forEach(star => {
                ctx.globalAlpha = star.alpha * this.conclusionAlpha;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Texte de conclusion centré
            ctx.globalAlpha = this.conclusionAlpha;
            ctx.textAlign = 'center';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;

            // Ligne 1: "Niveau X"
            const waveNumber = 8 - this.nextLayerLevel; // Wave 1 = Layer 7, etc.
            ctx.font = 'bold 36px "Bebas Neue", Arial, sans-serif';
            ctx.fillStyle = '#FFE81F'; // Jaune Star Wars
            ctx.fillText(`NIVEAU ${waveNumber}`, cx, cy - 50);

            // Ligne 2: "Vous pénétrez dans la couche Y du modèle OSI."
            ctx.font = '20px "Space Mono", "Courier New", monospace';
            ctx.fillStyle = '#EEEEEE';
            ctx.fillText(`Vous pénétrez dans la couche ${this.nextLayerName} du modèle OSI.`, cx, cy + 10);

            // Ligne 3: "Que le code soit avec vous..."
            ctx.font = 'italic 18px "Space Mono", "Courier New", monospace';
            ctx.fillStyle = '#00FFFF'; // Cyan
            ctx.fillText('Que le code soit avec vous...', cx, cy + 60);

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        // 7. Fade Out (Écran noir qui revient)
        if (this.phase === 'wipe-out') {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.wipeProgress})`;
            ctx.fillRect(0, 0, w, h);
        }
    }

    triggerSkip() {
        if (this.phase === 'reading') {
            // Passer à l'écran de conclusion avant le fade out
            this.phase = 'conclusion';
            this.timer = 0;
            this.conclusionAlpha = 0;
            // Son de confirmation doux ici si disponible
            if (this.audioManager && this.audioManager.playConfirm) {
                this.audioManager.playConfirm();
            }
        }
    }

    skip() {
        // Méthode de compatibilité avec l'ancien système
        this.triggerSkip();
    }

    isActive() {
        return this.active;
    }

    /**
     * Check if screen can be skipped (only in reading phase)
     */
    canSkip() {
        return this.active && this.phase === 'reading';
    }
}
