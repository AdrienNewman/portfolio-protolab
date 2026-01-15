// ============================================
// OSI STACK RENDERER - Canvas Drawing
// Renders vertical HUD on left side
// Uses gradients (no shadowBlur) for performance
// V1.0 - Sprint B2
// ============================================

import { LAYER_COLORS, HUD_POSITION, BLOCK_STATES } from './OSIStackConfig.js';

/**
 * OSIStackRenderer - Draws the OSI Stack HUD
 *
 * Layout (from top to bottom):
 * - Title "OSI STACK"
 * - L7: CORE block only
 * - L6: Header + Trailer blocks (after unlock)
 * - ... down to L1
 *
 * Symmetric display: For L6-L1, shows:
 * [L6 Header] then [L6 Trailer]
 * Creating visual "encapsulation"
 */
export class OSIStackRenderer {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
    }

    /**
     * Main render entry point
     * @param {Object} layerStates - From OSIStackState.getAllLayerStates()
     * @param {Object} animations - From OSIStackAnimations.getAllAnimations()
     * @param {Array<number>} unlockedLayers - Ordered list of unlocked layers [7,6,5...]
     */
    render(layerStates, animations, unlockedLayers) {
        if (!unlockedLayers || unlockedLayers.length === 0) return;

        const ctx = this.ctx;
        ctx.save();

        // Calculate total height and vertical centering
        const totalHeight = this._calculateTotalHeight(layerStates, unlockedLayers);
        const startY = (this.canvas.height - totalHeight) / 2;

        // Draw background panel
        this._drawBackgroundPanel(startY, totalHeight);

        // Draw each unlocked layer
        let currentY = startY + HUD_POSITION.PADDING + 20; // After title

        // Render in symmetric order for "poupee russe" visual
        // Headers from outer to inner, then CORE, then trailers from inner to outer
        const headerLayers = unlockedLayers.filter(l => l !== 7).reverse(); // L1,L2,L3...L6
        const trailerLayers = unlockedLayers.filter(l => l !== 7); // L6,L5,L4...L1

        // Draw headers (outer shell first)
        for (const layerNum of headerLayers) {
            const layer = layerStates[layerNum];
            const anim = animations[layerNum];
            const colors = LAYER_COLORS[layerNum];

            currentY = this._drawBlock(
                layerNum, 'header', layer.header, anim?.header, colors, currentY
            );
            currentY += HUD_POSITION.BLOCK_GAP;
        }

        // Draw L7 CORE (center)
        if (unlockedLayers.includes(7)) {
            const layer = layerStates[7];
            const anim = animations[7];
            const colors = LAYER_COLORS[7];

            // Label for CORE
            this._drawLayerLabel(7, colors, currentY - 5);

            currentY = this._drawBlock(
                7, 'core', layer.core, anim?.core, colors, currentY
            );
            currentY += HUD_POSITION.BLOCK_GAP;
        }

        // Draw trailers (inner to outer)
        for (const layerNum of trailerLayers) {
            const layer = layerStates[layerNum];
            const anim = animations[layerNum];
            const colors = LAYER_COLORS[layerNum];

            currentY = this._drawBlock(
                layerNum, 'trailer', layer.trailer, anim?.trailer, colors, currentY
            );
            currentY += HUD_POSITION.BLOCK_GAP;
        }

        ctx.restore();
    }

    /**
     * Draw background panel with title
     */
    _drawBackgroundPanel(startY, totalHeight) {
        const ctx = this.ctx;
        const x = HUD_POSITION.X - HUD_POSITION.PADDING;
        const w = HUD_POSITION.WIDTH + HUD_POSITION.PADDING * 2;
        const h = totalHeight;

        // Semi-transparent black background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, startY, w, h);

        // Subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, startY, w, h);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OSI STACK', x + w / 2, startY + 15);
    }

    /**
     * Draw layer label (L7, L6, etc.)
     */
    _drawLayerLabel(layerNum, colors, y) {
        const ctx = this.ctx;
        const x = HUD_POSITION.X;

        ctx.fillStyle = colors.color;
        ctx.font = 'bold 8px "Space Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`L${layerNum}`, x, y + 8);
    }

    /**
     * Draw a single block (header, trailer, or core)
     * @returns {number} Y position after drawing
     */
    _drawBlock(layerNum, blockType, block, anim, colors, y) {
        const ctx = this.ctx;
        const x = HUD_POSITION.X;
        const w = HUD_POSITION.WIDTH;
        const h = HUD_POSITION.BLOCK_HEIGHT;

        // Skip destroyed blocks (show destruction animation if active)
        if (block.state === BLOCK_STATES.DESTROYED) {
            if (anim?.isDestroying) {
                this._drawDestructionEffect(x, y, w, h, colors, anim);
            }
            return y + h;
        }

        // Unlock animation (scale in)
        let scale = 1;
        let alpha = 1;
        if (anim?.isUnlocking) {
            scale = this._easeOutBack(anim.unlockProgress);
            alpha = anim.unlockProgress;
        }

        ctx.save();

        // Apply scale transformation
        if (scale !== 1) {
            const cx = x + w / 2;
            const cy = y + h / 2;
            ctx.translate(cx, cy);
            ctx.scale(scale, scale);
            ctx.translate(-cx, -cy);
            ctx.globalAlpha = alpha;
        }

        // Glow aura (gradient, not shadowBlur)
        const glowIntensity = this._getGlowIntensity(block.state, anim);
        if (glowIntensity > 0) {
            this._drawGlow(x + w / 2, y + h / 2, colors, glowIntensity, w, h);
        }

        // Block background
        ctx.fillStyle = 'rgba(10, 10, 20, 0.9)';
        ctx.fillRect(x, y, w, h);

        // HP fill bar
        const hpPercent = block.hp / block.maxHp;
        const fillColor = this._getBlockColor(block.state, colors, anim);
        ctx.fillStyle = fillColor;
        ctx.fillRect(x + 2, y + 2, (w - 4) * hpPercent, h - 4);

        // Border
        const borderColor = block.state === BLOCK_STATES.CRITICAL
            ? this._getCriticalBorderColor(anim)
            : colors.color;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = block.state === BLOCK_STATES.CRITICAL ? 2 : 1;
        ctx.strokeRect(x, y, w, h);

        // Block type label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '7px "Space Mono", monospace';
        ctx.textAlign = 'left';
        const label = blockType === 'core' ? 'CORE'
            : (blockType === 'header' ? `L${layerNum}-H` : `L${layerNum}-T`);
        ctx.fillText(label, x + 3, y + 9);

        // HP text
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "Space Mono", monospace';
        ctx.fillText(`${Math.ceil(block.hp)}`, x + w - 3, y + h - 4);

        ctx.restore();

        // Flash overlay (drawn after restore for full opacity)
        if (anim?.isFlashing && anim.flashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 50, 50, ${anim.flashAlpha})`;
            ctx.fillRect(x, y, w, h);
        }

        return y + h;
    }

    /**
     * Draw glow aura using radial gradient
     */
    _drawGlow(cx, cy, colors, intensity, width, height) {
        if (intensity <= 0) return;

        const ctx = this.ctx;
        const radius = Math.max(width, height) / 2 + 15;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, this._hexToRgba(colors.color, 0.4 * intensity));
        gradient.addColorStop(0.5, this._hexToRgba(colors.color, 0.15 * intensity));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    }

    /**
     * Draw destruction explosion effect
     */
    _drawDestructionEffect(x, y, w, h, colors, anim) {
        const ctx = this.ctx;
        const cx = x + w / 2;
        const cy = y + h / 2;
        const alpha = 1 - anim.destructionProgress;

        // Draw particles
        ctx.fillStyle = this._hexToRgba(colors.color, alpha * 0.8);
        anim.destructionParticles.forEach(p => {
            const px = cx + Math.cos(p.angle) * p.distance;
            const py = cy + Math.sin(p.angle) * p.distance;
            const size = p.size * (1 - anim.destructionProgress * 0.5);
            ctx.fillRect(px - size / 2, py - size / 2, size, size);
        });

        // Center flash
        if (anim.destructionProgress < 0.3) {
            const flashAlpha = (0.3 - anim.destructionProgress) / 0.3;
            const flashGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, w);
            flashGradient.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha * 0.8})`);
            flashGradient.addColorStop(0.3, this._hexToRgba(colors.color, flashAlpha * 0.5));
            flashGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = flashGradient;
            ctx.fillRect(cx - w, cy - w, w * 2, w * 2);
        }
    }

    // ============================================
    // HELPERS
    // ============================================

    /**
     * Calculate total height of HUD based on unlocked layers
     */
    _calculateTotalHeight(layerStates, unlockedLayers) {
        let height = HUD_POSITION.PADDING * 2 + 20; // Padding + title

        // Count headers
        const headerCount = unlockedLayers.filter(l => l !== 7).length;
        // Count trailers
        const trailerCount = headerCount;
        // Count core
        const hasCore = unlockedLayers.includes(7);

        const blockCount = headerCount + trailerCount + (hasCore ? 1 : 0);
        height += blockCount * HUD_POSITION.BLOCK_HEIGHT;
        height += (blockCount - 1) * HUD_POSITION.BLOCK_GAP;

        return height;
    }

    /**
     * Get glow intensity based on block state
     */
    _getGlowIntensity(state, anim) {
        if (anim?.isFlashing) return 1;
        if (state === BLOCK_STATES.CRITICAL) return 0.9;
        if (state === BLOCK_STATES.DAMAGED) return 0.6;
        if (state === BLOCK_STATES.HEALTHY) return 0.3;
        return 0;
    }

    /**
     * Get block fill color based on state
     */
    _getBlockColor(state, colors, anim) {
        switch (state) {
            case BLOCK_STATES.HEALTHY:
                return colors.color;
            case BLOCK_STATES.DAMAGED:
                return this._mixColors(colors.color, '#ff6600', 0.4);
            case BLOCK_STATES.CRITICAL:
                // Flicker between red and original color
                const flicker = anim ? Math.sin(anim.flickerPhase) > 0 : false;
                return flicker ? '#ff0000' : this._mixColors(colors.color, '#ff0000', 0.6);
            default:
                return colors.color;
        }
    }

    /**
     * Get critical state border color (flashing red)
     */
    _getCriticalBorderColor(anim) {
        if (!anim) return '#ff0000';
        const flicker = Math.sin(anim.flickerPhase * 2) > 0;
        return flicker ? '#ff0000' : '#ff6666';
    }

    /**
     * Convert hex color to rgba string
     */
    _hexToRgba(hex, alpha) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
        }
        return `rgba(255, 255, 255, ${alpha})`;
    }

    /**
     * Mix two hex colors
     */
    _mixColors(color1, color2, ratio) {
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');

        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);

        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);

        const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
        const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
        const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Ease out back function for unlock animation
     */
    _easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
}
