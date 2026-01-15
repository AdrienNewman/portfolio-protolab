// ============================================
// DIALOGUE RENDERER - SageScreen Module
// Portrait adaptatif avec cadre nom/titre au-dessus
// V3.0 - Epic Layout Refactoring (deux modes)
// ============================================

import {
    LAYOUT_DIALOGUE,
    LAYOUT_CHOICE,
    VISUAL,
    ANIMATION_TIMING,
    calculatePortraitSize,
    getPortraitCenterY,
    getLayout,
    hexToRgba
} from '../configs/SageScreenConfig.js';

/**
 * DialogueRenderer - Renders sage portrait with name frame above
 * Supports two layout modes: 'dialogue' (large text) and 'choice' (badges)
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} state - Shared state from SageScreen
 */
export class DialogueRenderer {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;

        // Mode actuel ('dialogue' ou 'choice')
        this.mode = 'dialogue';
    }

    /**
     * Définit le mode de layout
     * @param {'dialogue' | 'choice'} mode
     */
    setMode(mode) {
        this.mode = mode;
    }

    /**
     * Main render method for portrait
     * Portrait adaptatif avec cadre nom/titre AU-DESSUS
     * Taille et position varient selon le mode (dialogue/choice)
     */
    renderPortrait(state, sage) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const layout = getLayout(this.mode);

        // Breathing animation (paramètres du layout)
        const floatOffset = Math.sin(state.glowPulse * ANIMATION_TIMING.FLOAT_SPEED) * layout.PORTRAIT.FLOAT_AMPLITUDE;
        const breathScale = 1 + Math.sin(state.glowPulse * ANIMATION_TIMING.BREATH_SPEED) * layout.PORTRAIT.BREATH_SCALE;

        const centerX = w / 2;
        const baseCenterY = getPortraitCenterY(h, this.mode);
        const centerY = baseCenterY + floatOffset;

        // Taille adaptative au canvas (plus grande qu'avant)
        const portraitSize = calculatePortraitSize(w, h, this.mode);
        const baseSize = portraitSize * state.portraitScale;
        const size = baseSize * breathScale;
        const radius = size / 2;

        const accentColor = sage.accentColor || '#00ffff';
        const glowIntensity = 0.5 + Math.sin(state.glowPulse * 0.8) * 0.3;

        // ============================================
        // CADRE NOM/TITRE AU-DESSUS DU PORTRAIT
        // ============================================
        this.renderNameFrame(centerX, centerY - radius - 50, sage);

        // ============================================
        // AURA COLOREE (cercles concentriques)
        // ============================================
        this.renderAura(centerX, centerY, size, accentColor, glowIntensity);

        // ============================================
        // PORTRAIT IMAGE OU FALLBACK
        // ============================================
        if (state.portraitLoaded && state.portraitImage) {
            this.renderHologramImage(state, centerX, centerY, size, sage);
        } else if (state.portraitLoadFailed) {
            this.renderFallbackInitials(centerX, centerY, size, sage);
        } else {
            this.renderLoadingPlaceholder(state, centerX, centerY, size, accentColor);
        }

        // ============================================
        // BORDURE PORTRAIT AVEC GLOW
        // ============================================
        const ctx = this.ctx;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    /**
     * Cadre nom/titre au-dessus du portrait
     */
    renderNameFrame(centerX, centerY, sage) {
        const ctx = this.ctx;
        const layout = getLayout(this.mode);
        const frameWidth = layout.NAME_FRAME.WIDTH;
        const frameHeight = layout.NAME_FRAME.HEIGHT;
        const frameX = centerX - frameWidth / 2;
        const frameY = centerY - frameHeight / 2;
        const accentColor = sage.accentColor || '#00ffff';

        // Background
        ctx.fillStyle = 'rgba(10, 10, 20, 0.9)';
        ctx.fillRect(frameX, frameY, frameWidth, frameHeight);

        // Bordure couleur sage avec glow
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 15;
        ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
        ctx.shadowBlur = 0;

        // Nom sage
        ctx.font = 'bold 28px "Bebas Neue", Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sage.name.toUpperCase(), centerX, centerY - 8);

        // Titre sage
        ctx.font = '14px "Space Mono", monospace';
        ctx.fillStyle = accentColor;
        ctx.fillText(sage.title, centerX, centerY + 18);
    }

    /**
     * Multi-layer radiant aura (cercles concentriques)
     */
    renderAura(centerX, centerY, size, color, intensity) {
        const ctx = this.ctx;
        const radius = size / 2;

        // 3 cercles concentriques avec glow
        ctx.save();
        for (let i = 3; i > 0; i--) {
            const ringRadius = radius + (i * 15);
            ctx.beginPath();
            ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = (0.3 / i) * intensity;
            ctx.stroke();
        }
        ctx.restore();

        // Gradient aura fill
        const gradient = ctx.createRadialGradient(
            centerX, centerY, radius * 0.5,
            centerX, centerY, radius * 1.4
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, hexToRgba(color, 0.1 * intensity));
        gradient.addColorStop(0.8, hexToRgba(color, 0.15 * intensity));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(centerX - radius * 1.5, centerY - radius * 1.5, radius * 3, radius * 3);
    }

    /**
     * Hologram image with effects
     */
    renderHologramImage(state, centerX, centerY, size, sage) {
        const ctx = this.ctx;
        const img = state.portraitImage;

        if (!img || !img.width || !img.height || !isFinite(size) || size <= 0) {
            this.renderFallbackInitials(centerX, centerY, size || 100, sage);
            return;
        }

        const radius = size / 2;
        const accentColor = sage.accentColor || '#00ffff';

        ctx.save();
        ctx.imageSmoothingEnabled = false; // Pixel art crisp

        // Circular clip
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 5, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Calculate cover dimensions
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight;
        if (imgAspect > 1) {
            drawHeight = size;
            drawWidth = size * imgAspect;
        } else {
            drawWidth = size;
            drawHeight = size / imgAspect;
        }

        const drawX = centerX - drawWidth / 2;
        const drawY = centerY - drawHeight / 2;

        // Glitch effect (~1% chance)
        const glitchActive = Math.random() < 0.016;
        if (glitchActive) {
            this.renderGlitchedImage(img, drawX, drawY, drawWidth, drawHeight);
        } else {
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        }

        ctx.restore();

        // Effects layers
        this.renderHoloScanlines(state, centerX, centerY, radius);
        this.renderColorOverlay(centerX, centerY, radius, accentColor);
        this.renderEdgeFade(centerX, centerY, radius);
    }

    /**
     * Glitch effect with shifted bands
     */
    renderGlitchedImage(img, drawX, drawY, drawWidth, drawHeight) {
        const ctx = this.ctx;
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        const numGlitches = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numGlitches; i++) {
            const bandHeight = 5 + Math.random() * 15;
            const bandY = drawY + Math.random() * drawHeight;
            const offsetX = (Math.random() - 0.5) * 20;

            ctx.save();
            ctx.beginPath();
            ctx.rect(drawX - 50, bandY, drawWidth + 100, bandHeight);
            ctx.clip();
            ctx.drawImage(img, drawX + offsetX, drawY, drawWidth, drawHeight);
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 0, 128, 0.3)';
            ctx.fillRect(drawX - 50, bandY, drawWidth + 100, bandHeight);
            ctx.restore();
        }
    }

    /**
     * Holographic scanlines
     */
    renderHoloScanlines(state, centerX, centerY, radius) {
        if (!isFinite(radius) || radius <= 0) return;
        const ctx = this.ctx;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();

        const timer = state.timer || 0;
        const scanOffset = (timer * 0.02) % 4;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';

        for (let y = -radius + scanOffset; y < radius; y += 4) {
            ctx.fillRect(centerX - radius, centerY + y, radius * 2, 1.5);
        }

        // Bright scan line
        const scanLineY = ((timer * 0.05) % (radius * 2)) - radius;
        const scanGradient = ctx.createLinearGradient(
            centerX, centerY + scanLineY - 10,
            centerX, centerY + scanLineY + 10
        );
        scanGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        scanGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
        scanGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = scanGradient;
        ctx.fillRect(centerX - radius, centerY + scanLineY - 10, radius * 2, 20);

        ctx.restore();
    }

    /**
     * Color overlay with sage accent
     */
    renderColorOverlay(centerX, centerY, radius, accentColor) {
        if (!isFinite(radius) || radius <= 0) return;
        const ctx = this.ctx;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();

        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = hexToRgba(accentColor, 0.12);
        ctx.fill();

        ctx.globalCompositeOperation = 'overlay';
        const overlayGradient = ctx.createRadialGradient(
            centerX, centerY - radius * 0.3, 0,
            centerX, centerY, radius
        );
        overlayGradient.addColorStop(0, hexToRgba(accentColor, 0.15));
        overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        ctx.fillStyle = overlayGradient;
        ctx.fill();

        ctx.restore();
    }

    /**
     * Edge fade gradient
     */
    renderEdgeFade(centerX, centerY, radius) {
        if (!isFinite(radius) || radius <= 0) return;
        const ctx = this.ctx;

        ctx.save();
        const fadeGradient = ctx.createRadialGradient(
            centerX, centerY, radius * 0.55,
            centerX, centerY, radius
        );
        fadeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        fadeGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)');
        fadeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = fadeGradient;
        ctx.fill();
        ctx.restore();
    }

    /**
     * Fallback: circle with initials
     */
    renderFallbackInitials(centerX, centerY, size, sage) {
        const ctx = this.ctx;
        const radius = size / 2;

        ctx.fillStyle = sage.backgroundColor || '#1a1a2e';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = sage.accentColor || '#00ffff';
        ctx.font = `bold ${size * 0.35}px "Bebas Neue", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initials = sage.name.split(' ').map(w => w[0]).join('').toUpperCase();
        ctx.fillText(initials, centerX, centerY);
    }

    /**
     * Loading placeholder
     */
    renderLoadingPlaceholder(state, centerX, centerY, size, color) {
        const ctx = this.ctx;
        const radius = size / 2;
        const pulse = (Math.sin(state.glowPulse * 3) + 1) / 2;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.3 + pulse * 0.4;
        ctx.setLineDash([10, 10]);
        ctx.lineDashOffset = state.timer * 0.05;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Vignette background with fade support
     * Le fond de base est TOUJOURS opaque (pas de fadeAlpha), seuls les effets suivent le fade
     * @param {object} sage - Sage config with backgroundColor and accentColor
     * @param {number} fadeAlpha - Opacity for animated effects (0-1, default 1)
     */
    renderVignette(sage, fadeAlpha = 1) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Fond opaque TOUJOURS visible (pas de fade) - évite l'écran noir
        ctx.fillStyle = sage.backgroundColor || '#0a0a1a';
        ctx.fillRect(0, 0, w, h);

        // Vignette gradient par-dessus (toujours visible)
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
            const accentRgba = hexToRgba(sage.accentColor || '#00ffff', 0.08);
            const accentGradient = ctx.createRadialGradient(
                w / 2, h / 2, Math.max(w, h) * 0.3,
                w / 2, h / 2, Math.max(w, h) * 0.8
            );
            accentGradient.addColorStop(0, 'transparent');
            accentGradient.addColorStop(1, accentRgba);

            ctx.fillStyle = accentGradient;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        }
    }

    /**
     * Ambient particles with proper state isolation
     */
    renderParticles(particles, fadeAlpha) {
        const ctx = this.ctx;
        ctx.save();
        for (const p of particles) {
            ctx.globalAlpha = p.alpha * fadeAlpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

}
