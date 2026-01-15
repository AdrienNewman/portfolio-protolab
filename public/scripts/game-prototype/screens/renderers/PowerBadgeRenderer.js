// ============================================
// POWER BADGE RENDERER - SageScreen Module
// Badges adaptatifs avec icones, description, stats
// V3.0 - Epic Layout Refactoring
// ============================================

import {
    LAYOUT_CHOICE,
    VISUAL,
    RARITY_COLORS,
    getBadgePositions,
    isPointInBadge,
    hexToRgba
} from '../configs/SageScreenConfig.js';

/**
 * PowerBadgeRenderer - Renders detailed power selection badges
 * Now uses centralized config for positions and sizes
 */
export class PowerBadgeRenderer {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;

        // Rarity color mapping (from config)
        this.rarityColors = RARITY_COLORS;

        // Base path - détecte si on est sur serveur (localhost) ou fichier local
        const isLocalFile = window.location.protocol === 'file:';
        const basePath = isLocalFile ? 'images/game/powers/' : '/images/game/powers/';

        // Power icon paths (PNG images)
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

        // Fallback emojis si image non chargée
        this.powerIconsFallback = {
            power_wiki_boost: '📊',
            power_edit_shield: '🛡️',
            power_swift_tab: '⚡',
            power_multi_tab: '🔀',
            power_streak_freeze: '❄️',
            power_xp_burst: '💥',
            power_kernel_panic: '⚠️',
            power_sudo_kill: '💀',
            power_ddos_mode: '🌊',
            power_ghost_mode: '👻',
            power_gpio_boost: '🔌',
            power_overclock: '⚙️',
            power_git_revert: '↩️',
            power_merge_master: '🔱'
        };

        // Cache images préchargées
        this.iconImages = {};
        this.iconsLoaded = false;

        // Power descriptions
        this.powerDescriptions = {
            power_wiki_boost: 'Multiplie le score obtenu',
            power_edit_shield: 'Bouclier automatique periodique',
            power_swift_tab: 'Vitesse de deplacement accrue',
            power_multi_tab: 'Triple tir simultane',
            power_streak_freeze: 'HP max augmentes + regen',
            power_xp_burst: 'Explosion AOE autour du joueur',
            power_kernel_panic: 'Invincibilite temporaire',
            power_sudo_kill: 'Elimination instantanee rare',
            power_ddos_mode: 'Cadence de tir augmentee',
            power_ghost_mode: 'Hitbox reduite',
            power_gpio_boost: 'Vitesse des projectiles',
            power_overclock: 'Aura de degats autour',
            power_git_revert: 'Sauvegarde HP automatique',
            power_merge_master: 'Amplifie tous les buffs'
        };

        // Power stats
        this.powerStats = {
            power_wiki_boost: 'x1.5 score',
            power_edit_shield: '2 hits, 15s cd',
            power_swift_tab: '+25% vitesse',
            power_multi_tab: '3 projectiles',
            power_streak_freeze: '+20 HP, 2/s',
            power_xp_burst: '80 radius, 15 dmg',
            power_kernel_panic: '1.5s invincible',
            power_sudo_kill: '8% chance',
            power_ddos_mode: '+40% fire rate',
            power_ghost_mode: '-30% hitbox',
            power_gpio_boost: '+30% projectile',
            power_overclock: '60 radius, 5 dps',
            power_git_revert: 'Checkpoint 10s',
            power_merge_master: '+20% tous buffs'
        };

        // Badge dimensions (from config - smaller for epic layout)
        this.badgeWidth = LAYOUT_CHOICE.BADGES.WIDTH;
        this.badgeHeight = LAYOUT_CHOICE.BADGES.HEIGHT;

        // Icon size for rendering
        this.iconSize = 64;
    }

    /**
     * Précharge toutes les icônes PNG
     * @returns {Promise} Résolu quand toutes les images sont chargées
     */
    async preloadIcons() {
        if (this.iconsLoaded) return;

        const promises = Object.entries(this.powerIconPaths).map(([id, path]) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.iconImages[id] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`[PowerBadgeRenderer] Failed to load icon: ${path}`);
                    resolve(); // Continue sans bloquer
                };
                img.src = path;
            });
        });

        await Promise.all(promises);
        this.iconsLoaded = true;
        console.log(`[PowerBadgeRenderer] ${Object.keys(this.iconImages).length}/14 icons loaded`);
    }

    /**
     * Main render method for power badges
     */
    renderPowerBadges(state, sage) {
        if (state.phase !== 'choice' && state.phase !== 'selected') return;

        const w = this.canvas.width;
        const h = this.canvas.height;
        const accentColor = sage.accentColor || '#00ffff';

        // Badge positions (from config - lower for epic layout)
        const positions = getBadgePositions(w, h);
        state.badgePositions = positions;

        // Render each badge
        for (let i = 0; i < Math.min(state.powers.length, 2); i++) {
            const power = state.powers[i];
            const pos = state.badgePositions[i];
            const scale = state.badgeScales[i];

            this.ctx.save();
            this.ctx.translate(pos.x, pos.y);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-pos.x, -pos.y);

            this.renderDetailedBadge(power, pos, i, state, accentColor);

            this.ctx.restore();
        }

        // Petite bulle prompt
        this.renderPromptBubble(accentColor);

        // Instructions
        this.renderChoiceInstructions();
    }

    /**
     * Render a detailed badge 220x280
     */
    renderDetailedBadge(power, pos, index, state, accentColor) {
        const ctx = this.ctx;
        const x = pos.x;
        const y = pos.y;
        const isHovered = state.hoveredIndex === index;
        const isSelected = state.selectedIndex === index;

        const rarityColor = this.rarityColors[power.rarity] || '#00ffff';

        // Badge dimensions
        const bw = this.badgeWidth;
        const bh = this.badgeHeight;
        const bx = x - bw / 2;
        const by = y - bh / 2;

        ctx.save();

        // ============================================
        // BACKGROUND
        // ============================================
        ctx.fillStyle = 'rgba(10, 10, 20, 0.9)';
        ctx.fillRect(bx, by, bw, bh);

        // ============================================
        // BORDURE RARETE + GLOW
        // ============================================
        const borderColor = isSelected ? '#ffffff' : (isHovered ? rarityColor : `${rarityColor}80`);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isHovered ? 4 : 3;

        if (isHovered || isSelected) {
            ctx.shadowColor = rarityColor;
            ctx.shadowBlur = 20;
        }

        ctx.strokeRect(bx, by, bw, bh);
        ctx.shadowBlur = 0;

        // Selection flash
        if (isSelected && state.phase === 'selected') {
            const flashAlpha = Math.sin(state.selectionFlash * Math.PI * 6) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * flashAlpha})`;
            ctx.fillRect(bx, by, bw, bh);
        }

        // Proportions adaptées à la taille du badge (plus petit = fonts plus petits)
        const scale = bh / 280;  // Ratio par rapport à l'ancienne taille

        // ============================================
        // ICONE (PNG ou emoji fallback)
        // ============================================
        const iconImg = this.iconImages[power.id];
        const iconY = y - bh * 0.28;

        if (iconImg) {
            // Rendu image PNG
            const size = this.iconSize;
            ctx.drawImage(iconImg, x - size / 2, iconY - size / 2, size, size);
        } else {
            // Fallback emoji
            const icon = this.powerIconsFallback[power.id] || '⭐';
            ctx.font = VISUAL.FONTS.BADGE_ICON;
            ctx.fillStyle = rarityColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icon, x, iconY);
        }

        // ============================================
        // NOM DU POUVOIR
        // ============================================
        ctx.font = VISUAL.FONTS.BADGE_NAME;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(power.name.toUpperCase(), x, y - bh * 0.08);

        // ============================================
        // DESCRIPTION
        // ============================================
        ctx.font = VISUAL.FONTS.BADGE_DESC;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const desc = this.powerDescriptions[power.id] || power.description || 'Pouvoir mysterieux';
        this._wrapText(desc, x, y + bh * 0.08, bw - 24, 16);

        // ============================================
        // STATS
        // ============================================
        ctx.font = VISUAL.FONTS.BADGE_STATS;
        ctx.fillStyle = '#00ffff';
        const stats = this.powerStats[power.id] || '???';
        ctx.fillText(stats, x, y + bh * 0.25);

        // ============================================
        // RARETE BADGE
        // ============================================
        ctx.font = VISUAL.FONTS.BADGE_RARITY;
        ctx.fillStyle = rarityColor;
        ctx.strokeStyle = rarityColor;
        ctx.lineWidth = 1;
        const rarityText = power.rarity.toUpperCase();
        const rarityWidth = ctx.measureText(rarityText).width + 20;
        const rarityX = x - rarityWidth / 2;
        const rarityY = y + bh * 0.32;

        ctx.strokeRect(rarityX, rarityY, rarityWidth, 18);
        ctx.fillText(rarityText, x, rarityY + 9);

        // ============================================
        // NUMERO [1] ou [2]
        // ============================================
        ctx.font = 'bold 16px "Space Mono", monospace';
        ctx.fillStyle = isHovered ? rarityColor : 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(`[${index + 1}]`, x, y + bh * 0.42);

        ctx.restore();
    }

    /**
     * Petite bulle prompt "Choisis ton enseignement"
     */
    renderPromptBubble(accentColor) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        const promptY = h * LAYOUT_CHOICE.PROMPT.Y_PERCENT;
        const promptWidth = 380;
        const promptHeight = 40;
        const promptX = (w - promptWidth) / 2;

        // Background
        ctx.fillStyle = 'rgba(10, 10, 20, 0.85)';
        ctx.fillRect(promptX, promptY, promptWidth, promptHeight);

        // Bordure
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(promptX, promptY, promptWidth, promptHeight);

        // Texte
        ctx.font = VISUAL.FONTS.PROMPT;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Choisis ton enseignement, Padawan', w / 2, promptY + promptHeight / 2);
    }

    /**
     * Instructions en bas
     */
    renderChoiceInstructions() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = VISUAL.FONTS.INSTRUCTIONS;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText('[1] [2] pour choisir • ENTRÉE confirme', LAYOUT_CHOICE.INSTRUCTIONS.MARGIN_LEFT, h * LAYOUT_CHOICE.INSTRUCTIONS.Y_PERCENT);
        ctx.restore();
    }

    /**
     * Word wrap text
     */
    _wrapText(text, x, y, maxWidth, lineHeight) {
        const ctx = this.ctx;
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (const word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && line.length > 0) {
                ctx.fillText(line.trim(), x, currentY);
                line = word + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        if (line.trim()) {
            ctx.fillText(line.trim(), x, currentY);
        }
    }

}
