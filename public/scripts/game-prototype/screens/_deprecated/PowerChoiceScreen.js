// ============================================
// POWER CHOICE SCREEN - Les Sages du Libre
// Sélection roguelike de pouvoir (2 cartes)
// Style PIXEL ARCADE / LucasArts Glow
// ============================================

import { getPowerConfig, getPowersForSage } from '../sages/powers/index.js';
import { getSageConfig } from '../sages/index.js';
import { playerStateManager } from '../systems/PlayerStateManager.js';

export class PowerChoiceScreen {
    constructor(canvas, audioManager = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;

        this.active = false;
        this.phase = 'idle'; // idle, fade-in, display, selected, fade-out

        // Pouvoirs affichés
        this.powers = []; // Array of 2 power configs
        this.sage = null;

        // Sélection
        this.hoveredIndex = -1;
        this.selectedIndex = -1;

        // Animation
        this.timer = 0;
        this.fadeAlpha = 0;
        this.cardScales = [0, 0];
        this.cardGlows = [0, 0];
        this.selectionFlash = 0;

        // Configuration
        this.config = {
            fadeInDuration: 500,
            cardAppearDelay: 200,
            cardAppearDuration: 400,
            selectionFlashDuration: 800,
            fadeOutDuration: 400
        };

        // Callbacks
        this.onPowerSelected = null;
        this.onComplete = null;

        // Input
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleClick = this.handleClick.bind(this);

        // Card dimensions (calculées dans render)
        this.cardRects = [];
    }

    /**
     * Affiche l'écran de choix pour un sage
     */
    showForSage(sage) {
        if (typeof sage === 'string') {
            sage = getSageConfig(sage);
        }

        if (!sage) {
            console.error('[PowerChoiceScreen] Sage invalide');
            if (this.onComplete) this.onComplete(null);
            return;
        }

        this.sage = sage;
        this.powers = getPowersForSage(sage.id);

        if (this.powers.length < 2) {
            console.warn(`[PowerChoiceScreen] Sage ${sage.id} n'a que ${this.powers.length} pouvoir(s)`);
            if (this.powers.length === 1) {
                // Auto-select le seul pouvoir
                this.selectPower(0);
                return;
            }
            if (this.onComplete) this.onComplete(null);
            return;
        }

        this.active = true;
        this.phase = 'fade-in';
        this.timer = 0;
        this.fadeAlpha = 0;
        this.cardScales = [0, 0];
        this.hoveredIndex = -1;
        this.selectedIndex = -1;

        // Activer inputs
        window.addEventListener('keydown', this.handleKeydown);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('click', this.handleClick);

        console.log(`[PowerChoiceScreen] Choix entre: ${this.powers.map(p => p.name).join(' / ')}`);
    }

    handleKeydown(e) {
        if (!this.active || this.phase !== 'display') return;

        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            this.hoveredIndex = 0;
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            this.hoveredIndex = 1;
        } else if (e.code === 'Enter' || e.code === 'Space') {
            if (this.hoveredIndex >= 0) {
                this.selectPower(this.hoveredIndex);
            }
        } else if (e.code === 'Digit1') {
            this.selectPower(0);
        } else if (e.code === 'Digit2') {
            this.selectPower(1);
        }
    }

    handleMouseMove(e) {
        if (!this.active || this.phase !== 'display') return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.hoveredIndex = -1;
        for (let i = 0; i < this.cardRects.length; i++) {
            const card = this.cardRects[i];
            if (x >= card.x && x <= card.x + card.width &&
                y >= card.y && y <= card.y + card.height) {
                this.hoveredIndex = i;
                break;
            }
        }
    }

    handleClick(e) {
        if (!this.active || this.phase !== 'display') return;

        if (this.hoveredIndex >= 0) {
            this.selectPower(this.hoveredIndex);
        }
    }

    selectPower(index) {
        if (index < 0 || index >= this.powers.length) return;

        this.selectedIndex = index;
        this.phase = 'selected';
        this.timer = 0;

        const power = this.powers[index];

        // Ajouter au PlayerStateManager
        playerStateManager.addPower(power.id);

        if (this.onPowerSelected) {
            this.onPowerSelected(power);
        }

        // Play sound
        if (this.audioManager) {
            this.audioManager.play('powerup');
        }

        console.log(`[PowerChoiceScreen] Pouvoir sélectionné: ${power.name}`);
    }

    update(deltaTime) {
        if (!this.active) return;

        this.timer += deltaTime;

        // Update card glows
        for (let i = 0; i < 2; i++) {
            const targetGlow = (this.hoveredIndex === i) ? 1 : 0.3;
            this.cardGlows[i] += (targetGlow - this.cardGlows[i]) * 0.1;
        }

        switch (this.phase) {
            case 'fade-in':
                this.fadeAlpha = Math.min(1, this.timer / this.config.fadeInDuration);
                if (this.timer >= this.config.fadeInDuration) {
                    this.phase = 'cards-appear';
                    this.timer = 0;
                }
                break;

            case 'cards-appear':
                // Carte 0
                const card0Start = 0;
                const card0Progress = Math.max(0, (this.timer - card0Start) / this.config.cardAppearDuration);
                this.cardScales[0] = Math.min(1, this.easeOutBack(card0Progress));

                // Carte 1 (décalée)
                const card1Start = this.config.cardAppearDelay;
                const card1Progress = Math.max(0, (this.timer - card1Start) / this.config.cardAppearDuration);
                this.cardScales[1] = Math.min(1, this.easeOutBack(card1Progress));

                if (this.cardScales[0] >= 1 && this.cardScales[1] >= 1) {
                    this.phase = 'display';
                }
                break;

            case 'display':
                // Waiting for selection
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

    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    render() {
        if (!this.active) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.save();
        ctx.globalAlpha = this.fadeAlpha;

        // === FOND TRANSPARENT (laisse voir les étoiles) ===
        this.renderVignette(ctx, w, h);

        // Titre
        this.renderTitle(ctx);

        // Cartes
        this.renderCards(ctx);

        // Instructions
        this.renderInstructions(ctx);

        ctx.restore();
    }

    // ============================================
    // PIXEL ARCADE - Méthodes de rendu
    // ============================================

    /**
     * Vignetage transparent - fond étoilé visible
     */
    renderVignette(ctx, w, h) {
        const gradient = ctx.createRadialGradient(
            w / 2, h / 2, 0,
            w / 2, h / 2, Math.max(w, h) * 0.7
        );

        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
        gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Teinte subtile de la couleur du sage
        const accentColor = this.sage?.accentColor || '#00ffff';
        const accentRgba = this.hexToRgba(accentColor, 0.05);
        const accentGradient = ctx.createRadialGradient(
            w / 2, h / 2, 0,
            w / 2, h / 2, Math.max(w, h) * 0.6
        );
        accentGradient.addColorStop(0, accentRgba);
        accentGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = accentGradient;
        ctx.fillRect(0, 0, w, h);
    }

    /**
     * Helper : convertit hex en rgba
     */
    hexToRgba(hex, alpha) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
        }
        return `rgba(0, 255, 255, ${alpha})`;
    }

    /**
     * Effet scanlines sur une zone
     */
    renderScanlines(ctx, x, y, width, height) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let i = 0; i < height; i += 4) {
            ctx.fillRect(x, y + i, width, 2);
        }
        ctx.restore();
    }

    /**
     * Icône procédurale Pixel Art - Remplace les emojis
     */
    renderPixelIcon(ctx, effectType, x, y, size, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;

        const px = size / 8; // Taille d'un "pixel"
        const cx = x - size / 2;
        const cy = y - size / 2;

        // Dessine une forme selon le type d'effet
        switch (effectType) {
            case 'score_multiplier':
                // Étoile pixel
                this.drawPixelStar(ctx, cx, cy, px);
                break;
            case 'auto_shield':
            case 'defense':
                // Bouclier pixel
                this.drawPixelShield(ctx, cx, cy, px);
                break;
            case 'speed_boost':
            case 'fire_rate':
                // Éclair pixel
                this.drawPixelBolt(ctx, cx, cy, px);
                break;
            case 'damage_boost':
            case 'attack':
                // Épée pixel
                this.drawPixelSword(ctx, cx, cy, px);
                break;
            case 'multi_shot':
            case 'spread':
                // Triple flèche
                this.drawPixelTriple(ctx, cx, cy, px);
                break;
            case 'heal':
            case 'life':
                // Coeur pixel
                this.drawPixelHeart(ctx, cx, cy, px);
                break;
            default:
                // Orbe générique
                this.drawPixelOrb(ctx, cx, cy, px);
        }

        ctx.restore();
    }

    // Formes Pixel Art individuelles
    drawPixelStar(ctx, cx, cy, px) {
        // Étoile 8x8
        const pattern = [
            '   **   ',
            '   **   ',
            '********',
            ' ****** ',
            '  ****  ',
            ' **  ** ',
            '**    **',
            '*      *'
        ];
        this.drawPattern(ctx, cx, cy, px, pattern);
    }

    drawPixelShield(ctx, cx, cy, px) {
        // Bouclier 8x8
        const pattern = [
            '********',
            '********',
            '********',
            '********',
            ' ****** ',
            '  ****  ',
            '   **   ',
            '   **   '
        ];
        this.drawPattern(ctx, cx, cy, px, pattern);
    }

    drawPixelBolt(ctx, cx, cy, px) {
        // Éclair 8x8
        const pattern = [
            '    ****',
            '   **** ',
            '  ****  ',
            '********',
            '******  ',
            '  ****  ',
            ' ****   ',
            '****    '
        ];
        this.drawPattern(ctx, cx, cy, px, pattern);
    }

    drawPixelSword(ctx, cx, cy, px) {
        // Épée 8x8
        const pattern = [
            '      **',
            '     ***',
            '    *** ',
            '   ***  ',
            '* ***   ',
            '****    ',
            '***     ',
            '**      '
        ];
        this.drawPattern(ctx, cx, cy, px, pattern);
    }

    drawPixelTriple(ctx, cx, cy, px) {
        // Triple flèche 8x8
        const pattern = [
            '*  **  *',
            '** ** **',
            ' **  ** ',
            '   **   ',
            '   **   ',
            '   **   ',
            '   **   ',
            '   **   '
        ];
        this.drawPattern(ctx, cx, cy, px, pattern);
    }

    drawPixelHeart(ctx, cx, cy, px) {
        // Coeur 8x8
        const pattern = [
            ' **  ** ',
            '********',
            '********',
            '********',
            ' ****** ',
            '  ****  ',
            '   **   ',
            '        '
        ];
        this.drawPattern(ctx, cx, cy, px, pattern);
    }

    drawPixelOrb(ctx, cx, cy, px) {
        // Orbe générique 8x8
        const pattern = [
            '  ****  ',
            ' ****** ',
            '***  ***',
            '**    **',
            '**    **',
            '***  ***',
            ' ****** ',
            '  ****  '
        ];
        this.drawPattern(ctx, cx, cy, px, pattern);
    }

    drawPattern(ctx, cx, cy, px, pattern) {
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === '*') {
                    ctx.fillRect(cx + col * px, cy + row * px, px, px);
                }
            }
        }
    }

    renderTitle(ctx) {
        const accentColor = this.sage?.accentColor || '#00ffff';
        const w = this.canvas.width;

        ctx.save();

        // Titre principal avec ombre forte
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 36px "Bebas Neue", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 3;

        // Glow coloré par-dessus
        ctx.fillText('CHOISISSEZ VOTRE POUVOIR', w / 2, 50);
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 25;
        ctx.shadowOffsetY = 0;
        ctx.fillText('CHOISISSEZ VOTRE POUVOIR', w / 2, 50);

        // Sage name
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px "Space Mono", monospace';
        ctx.fillText(`Bénédiction de ${this.sage?.name || 'Sage'}`, w / 2, 100);

        ctx.restore();
    }

    renderCards(ctx) {
        const cardWidth = 280;
        const cardHeight = 380;
        const gap = 60;
        const startX = (this.canvas.width - (cardWidth * 2 + gap)) / 2;
        const startY = (this.canvas.height - cardHeight) / 2 + 20;

        this.cardRects = [];

        for (let i = 0; i < this.powers.length && i < 2; i++) {
            const power = this.powers[i];
            const x = startX + i * (cardWidth + gap);
            const y = startY;
            const scale = this.cardScales[i];
            const glow = this.cardGlows[i];
            const isSelected = this.selectedIndex === i;
            const isHovered = this.hoveredIndex === i;

            this.cardRects.push({ x, y, width: cardWidth, height: cardHeight });

            // Apply scale transform
            ctx.save();
            const centerX = x + cardWidth / 2;
            const centerY = y + cardHeight / 2;
            ctx.translate(centerX, centerY);
            ctx.scale(scale, scale);
            ctx.translate(-centerX, -centerY);

            this.renderCard(ctx, power, x, y, cardWidth, cardHeight, glow, isSelected, isHovered, i);

            ctx.restore();
        }
    }

    renderCard(ctx, power, x, y, width, height, glow, isSelected, isHovered, index) {
        const accentColor = this.sage?.accentColor || '#00ffff';
        const rarityColors = {
            common: '#aaaaaa',
            uncommon: '#4ade80',
            rare: '#60a5fa',
            legendary: '#fbbf24'
        };
        const rarityColor = rarityColors[power.rarity] || '#aaaaaa';

        ctx.save();

        // === SELECTION FLASH ===
        if (isSelected && this.phase === 'selected') {
            const flashAlpha = Math.sin(this.selectionFlash * Math.PI * 4) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.4})`;
            ctx.fillRect(x - 10, y - 10, width + 20, height + 20);
        }

        // === CARD GLOW (Aura) ===
        ctx.shadowColor = isHovered ? accentColor : rarityColor;
        ctx.shadowBlur = 30 * glow;

        // === FOND CARTE - Noir semi-transparent ===
        ctx.fillStyle = isHovered ? 'rgba(20, 20, 30, 0.9)' : 'rgba(5, 5, 10, 0.85)';

        // Rectangle aux coins nets (style arcade)
        ctx.fillRect(x, y, width, height);

        // === SCANLINES ===
        this.renderScanlines(ctx, x, y, width, height);

        // === BORDURE ÉPAISSE PIXEL ===
        ctx.shadowBlur = 0;
        ctx.strokeStyle = isHovered ? '#ffffff' : accentColor;
        ctx.lineWidth = isHovered ? 4 : 3;
        ctx.strokeRect(x, y, width, height);

        // Bordure intérieure (double ligne style arcade)
        ctx.strokeStyle = isHovered ? accentColor : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 6, y + 6, width - 12, height - 12);

        // === RARITY BANNER ===
        ctx.fillStyle = rarityColor;
        ctx.font = 'bold 12px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 5;
        ctx.fillText(power.rarity.toUpperCase(), x + width / 2, y + 25);

        // === PIXEL ICON (remplace emoji) ===
        const iconColor = isHovered ? '#ffffff' : accentColor;
        this.renderPixelIcon(ctx, power.effect.type, x + width / 2, y + 90, 64, iconColor);

        // === POWER NAME ===
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Bebas Neue", Arial, sans-serif';
        ctx.fillText(power.name.toUpperCase(), x + width / 2, y + 150);

        // === DESCRIPTION ===
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '14px "Space Mono", monospace';
        ctx.shadowBlur = 5;
        this.renderWrappedText(ctx, power.description, x + 20, y + 180, width - 40, 20);

        // === EFFECT TYPE BADGE ===
        ctx.fillStyle = accentColor;
        ctx.font = '12px "Space Mono", monospace';
        ctx.shadowBlur = 8;
        ctx.shadowColor = accentColor;
        ctx.fillText(`[${power.effect.type.replace('_', ' ').toUpperCase()}]`, x + width / 2, y + height - 55);

        // === KEY HINT (style arcade) ===
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 5;
        ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 20px "Space Mono", monospace';
        ctx.fillText(`[ ${index + 1} ]`, x + width / 2, y + height - 22);

        ctx.restore();
    }

    renderWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';

        for (const word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line.trim(), x + maxWidth / 2, y);
                line = word + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), x + maxWidth / 2, y);
    }

    renderInstructions(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '14px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 10;

        const instructions = '← → ou [1] [2] pour choisir • ENTRÉE pour confirmer';
        ctx.fillText(instructions, this.canvas.width / 2, this.canvas.height - 30);
        ctx.restore();
    }

    complete() {
        this.active = false;
        this.phase = 'idle';

        window.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('click', this.handleClick);

        const selectedPower = this.selectedIndex >= 0 ? this.powers[this.selectedIndex] : null;

        if (this.onComplete) {
            this.onComplete(selectedPower);
        }
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('click', this.handleClick);
    }
}
