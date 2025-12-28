// ============================================
// BOSS INTRO - NetDefender
// Dramatic alert modal before boss fights
// ============================================

import { PORTFOLIO_COLORS, OSI_COLORS } from '../config/gameConfig.js';
import { getBossIntro } from '../content/narrativeContent.js';

// Default fallback for unknown bosses
const DEFAULT_BOSS = {
    name: 'MENACE INCONNUE',
    title: 'ATTAQUE NON IDENTIFIÉE',
    quote: 'Vos défenses s\'effondrent devant moi.',
    quoter: 'Système',
    description: 'Vecteur d\'attaque inconnu',
    capability: 'INCONNU',
    attack: 'Attaque imprévisible',
    color: '#ff0080',
    threatLevel: 'INCONNU'
};

export class BossIntro {
    constructor(canvas, audioManager = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;

        // State
        this.active = false;
        this.phase = 'idle'; // idle, flash, siren, glitch, typewriter, hold, fadeout
        this.timer = 0;
        this.phaseStartTime = 0;

        // Boss data
        this.bossConfig = null;
        this.bossData = null;
        this.layerLevel = 7;
        this.layerColor = PORTFOLIO_COLORS.neonMagenta;

        // Animation values
        this.flashIntensity = 0;
        this.glitchIntensity = 0;
        this.quoteCharIndex = 0;
        this.shakeIntensity = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        this.sirenPhase = 0;
        this.alertPulse = 0;
        this.threatBarProgress = 0;
        this.scanlineOffset = 0;

        // Timing configuration (ms)
        this.config = {
            flashDuration: 250,
            sirenDuration: 600,
            glitchDuration: 500,
            typewriterSpeed: 35,
            holdDuration: 1800,
            fadeOutDuration: 400
        };

        // Callbacks
        this.onComplete = null;
    }

    show(bossConfig, layerLevel) {
        this.active = true;
        this.phase = 'flash';
        this.timer = 0;
        this.phaseStartTime = 0;

        this.bossConfig = bossConfig;
        this.layerLevel = layerLevel;
        this.layerColor = OSI_COLORS[layerLevel]?.color || PORTFOLIO_COLORS.neonMagenta;

        // Get rich narrative data from narrativeContent.js
        // Use bossId (from LAYER_BOSS_IDS mapping) or fall back to type
        const bossType = bossConfig?.bossId || bossConfig?.type || 'default';
        const narrativeData = getBossIntro(bossType);

        if (narrativeData) {
            // Use rich narrative content
            this.bossData = {
                name: narrativeData.name.toUpperCase(),
                subtitle: narrativeData.title,
                quote: `"${narrativeData.quote}"`,
                quoter: narrativeData.quoter,
                description: narrativeData.description,
                capability: narrativeData.capability,
                attack: narrativeData.attack,
                threatLevel: narrativeData.threatLevel
            };
            // Use boss color from narrative if available
            if (narrativeData.color) {
                this.layerColor = narrativeData.color;
            }
        } else {
            // Fallback to default
            this.bossData = {
                name: DEFAULT_BOSS.name,
                subtitle: DEFAULT_BOSS.title,
                quote: `"${DEFAULT_BOSS.quote}"`,
                quoter: DEFAULT_BOSS.quoter,
                description: DEFAULT_BOSS.description,
                capability: DEFAULT_BOSS.capability,
                attack: DEFAULT_BOSS.attack,
                threatLevel: DEFAULT_BOSS.threatLevel
            };
        }

        // Override with config name if available
        if (bossConfig?.name) {
            this.bossData.name = bossConfig.name.toUpperCase();
        }

        // Reset animation values
        this.flashIntensity = 1;
        this.glitchIntensity = 0;
        this.quoteCharIndex = 0;
        this.shakeIntensity = 20;
        this.sirenPhase = 0;
        this.alertPulse = 0;
        this.threatBarProgress = 0;

        // Play boss alert sound
        if (this.audioManager && this.audioManager.playBossAlert) {
            this.audioManager.playBossAlert();
        }
    }

    update(deltaTime) {
        if (!this.active) return false;

        this.timer += deltaTime;
        this.sirenPhase += 0.15;
        this.alertPulse += 0.12;
        this.scanlineOffset = (this.scanlineOffset + 0.5) % 4;

        // Update screen shake
        if (this.shakeIntensity > 0.5) {
            this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= 0.92;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
            this.shakeIntensity = 0;
        }

        const phaseTime = this.timer - this.phaseStartTime;

        switch (this.phase) {
            case 'flash':
                this.flashIntensity = 1 - (phaseTime / this.config.flashDuration);
                if (phaseTime >= this.config.flashDuration) {
                    this.phase = 'siren';
                    this.phaseStartTime = this.timer;

                    // Play name reveal sound
                    if (this.audioManager && this.audioManager.playBossReveal) {
                        this.audioManager.playBossReveal();
                    }
                }
                break;

            case 'siren':
                this.glitchIntensity = 0.4 + Math.random() * 0.3;
                if (phaseTime >= this.config.sirenDuration) {
                    this.phase = 'glitch';
                    this.phaseStartTime = this.timer;
                }
                break;

            case 'glitch':
                this.glitchIntensity = Math.max(0.1, (1 - phaseTime / this.config.glitchDuration) * 0.6);
                if (phaseTime >= this.config.glitchDuration) {
                    this.phase = 'typewriter';
                    this.phaseStartTime = this.timer;
                }
                break;

            case 'typewriter':
                const quoteLength = this.bossData.quote.length;
                const typeDuration = quoteLength * this.config.typewriterSpeed;

                this.quoteCharIndex = Math.min(
                    quoteLength,
                    Math.floor(phaseTime / this.config.typewriterSpeed)
                );

                // Threat bar fills during typewriter
                this.threatBarProgress = Math.min(1, phaseTime / typeDuration);

                // Random subtle glitch
                this.glitchIntensity = Math.random() > 0.92 ? 0.25 : 0;

                // Play typing sounds
                if (this.audioManager && this.audioManager.playTypingBip && Math.random() < 0.3) {
                    this.audioManager.playTypingBip();
                }

                if (phaseTime >= typeDuration + 200) {
                    this.phase = 'hold';
                    this.phaseStartTime = this.timer;
                    this.threatBarProgress = 1;
                }
                break;

            case 'hold':
                // Occasional glitch during hold
                this.glitchIntensity = Math.random() > 0.96 ? 0.2 : 0;

                if (phaseTime >= this.config.holdDuration) {
                    this.phase = 'fadeout';
                    this.phaseStartTime = this.timer;
                }
                break;

            case 'fadeout':
                if (phaseTime >= this.config.fadeOutDuration) {
                    this.active = false;
                    if (this.onComplete) this.onComplete();
                    return true;
                }
                break;
        }

        return false;
    }

    draw() {
        if (!this.active) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.save();

        // Apply screen shake
        ctx.translate(this.shakeX, this.shakeY);

        // Calculate opacity for fadeout
        const phaseTime = this.timer - this.phaseStartTime;
        let globalAlpha = 1;
        if (this.phase === 'fadeout') {
            globalAlpha = 1 - (phaseTime / this.config.fadeOutDuration);
        }
        ctx.globalAlpha = globalAlpha;

        // Draw backdrop with red tint
        this.drawBackdrop(ctx, width, height);

        // Draw warning stripes
        this.drawWarningStripes(ctx, width, height);

        // Draw main alert content
        this.drawAlertContent(ctx, width, height);

        // Draw scanlines
        this.drawScanlines(ctx, width, height);

        // Draw glitch effect
        if (this.glitchIntensity > 0.05) {
            this.drawGlitch(ctx, width, height);
        }

        // Draw red flash overlay
        if (this.flashIntensity > 0) {
            ctx.fillStyle = `rgba(255, 0, 0, ${this.flashIntensity * 0.6})`;
            ctx.fillRect(-50, -50, width + 100, height + 100);
        }

        ctx.restore();
    }

    drawBackdrop(ctx, width, height) {
        // Dark backdrop with red tint
        ctx.fillStyle = 'rgba(15, 0, 0, 0.95)';
        ctx.fillRect(0, 0, width, height);

        // Subtle red grid
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.04)';
        ctx.lineWidth = 1;

        for (let x = 0; x <= width; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y <= height; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Radial vignette
        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, Math.max(width, height) * 0.7
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    drawWarningStripes(ctx, width, height) {
        const stripeHeight = 35;
        const stripeWidth = 25;
        const warningAlpha = 0.25 + Math.sin(this.sirenPhase) * 0.15;

        // Top stripes
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width, stripeHeight);
        ctx.clip();

        for (let x = -stripeWidth * 2; x < width + stripeWidth * 2; x += stripeWidth * 2) {
            ctx.fillStyle = `rgba(255, 200, 0, ${warningAlpha})`;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + stripeWidth, 0);
            ctx.lineTo(x + stripeWidth * 2, stripeHeight);
            ctx.lineTo(x + stripeWidth, stripeHeight);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // Bottom stripes
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, height - stripeHeight, width, stripeHeight);
        ctx.clip();

        for (let x = -stripeWidth * 2; x < width + stripeWidth * 2; x += stripeWidth * 2) {
            ctx.fillStyle = `rgba(255, 200, 0, ${warningAlpha})`;
            ctx.beginPath();
            ctx.moveTo(x, height - stripeHeight);
            ctx.lineTo(x + stripeWidth, height - stripeHeight);
            ctx.lineTo(x + stripeWidth * 2, height);
            ctx.lineTo(x + stripeWidth, height);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // "WARNING" text in stripes
        ctx.font = 'bold 14px "Space Mono", monospace';
        ctx.fillStyle = `rgba(0, 0, 0, ${warningAlpha + 0.3})`;
        ctx.textAlign = 'center';
        ctx.fillText('⚠ WARNING ⚠', width / 2, 22);
        ctx.fillText('⚠ WARNING ⚠', width / 2, height - 12);
    }

    drawAlertContent(ctx, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;

        // "! ALERTE !" header with pulse
        const alertVisible = Math.sin(this.alertPulse * 2) > -0.3;
        if (alertVisible) {
            ctx.font = 'bold 36px "Bebas Neue", sans-serif';
            ctx.fillStyle = PORTFOLIO_COLORS.neonMagenta;
            ctx.textAlign = 'center';
            ctx.shadowColor = PORTFOLIO_COLORS.neonMagenta;
            ctx.shadowBlur = 25;
            ctx.fillText('! ALERTE !', centerX, centerY - 120);
            ctx.shadowBlur = 0;
        }

        // Boss name with layer color
        if (this.phase !== 'flash') {
            ctx.font = 'bold 48px "Bebas Neue", sans-serif';
            ctx.fillStyle = this.layerColor;
            ctx.shadowColor = this.layerColor;
            ctx.shadowBlur = 30;
            ctx.textAlign = 'center';
            ctx.fillText(this.bossData.name, centerX, centerY - 50);
            ctx.shadowBlur = 0;

            // Subtitle (title)
            ctx.font = 'bold 16px "Space Mono", monospace';
            ctx.fillStyle = PORTFOLIO_COLORS.neonMagenta;
            ctx.fillText(this.bossData.subtitle, centerX, centerY - 15);

            // Capability info
            if (this.bossData.capability && this.phase !== 'siren') {
                ctx.font = '12px "Space Mono", monospace';
                ctx.fillStyle = PORTFOLIO_COLORS.grayLighter;
                ctx.fillText(`[${this.bossData.capability}]`, centerX, centerY + 10);
            }
        }

        // Quote with typewriter effect
        if (this.phase === 'typewriter' || this.phase === 'hold' || this.phase === 'fadeout') {
            const visibleQuote = this.bossData.quote.substring(0, this.quoteCharIndex);
            const cursorVisible = this.phase === 'typewriter' && Math.floor(this.timer / 300) % 2 === 0;

            ctx.font = 'italic 16px "Space Mono", monospace';
            ctx.fillStyle = PORTFOLIO_COLORS.neonCyan;
            ctx.shadowColor = PORTFOLIO_COLORS.neonCyan;
            ctx.shadowBlur = 8;
            ctx.textAlign = 'center';

            // Word wrap for long quotes
            const maxWidth = width * 0.8;
            const words = visibleQuote.split(' ');
            let line = '';
            let y = centerY + 50;

            for (const word of words) {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && line !== '') {
                    ctx.fillText(line.trim(), centerX, y);
                    line = word + ' ';
                    y += 22;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line.trim() + (cursorVisible ? '█' : ''), centerX, y);
            ctx.shadowBlur = 0;

            // Quoter attribution
            if (this.bossData.quoter && this.quoteCharIndex >= this.bossData.quote.length) {
                ctx.font = '11px "Space Mono", monospace';
                ctx.fillStyle = PORTFOLIO_COLORS.grayLighter;
                ctx.fillText(`— ${this.bossData.quoter}`, centerX, y + 20);
            }
        }

        // Threat level bar
        if (this.phase !== 'flash' && this.phase !== 'siren') {
            this.drawThreatBar(ctx, centerX, centerY + 130, width * 0.5);
        }
    }

    drawThreatBar(ctx, centerX, y, barWidth) {
        const barHeight = 20;
        const x = centerX - barWidth / 2;
        const bossHealth = this.bossConfig?.health || 100;
        const threatLevel = this.bossData?.threatLevel || 'INCONNU';

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Border
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);

        // Fill
        const fillWidth = (barWidth - 4) * this.threatBarProgress;
        const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.5, '#ff4400');
        gradient.addColorStop(1, '#ff0080');

        ctx.fillStyle = gradient;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fillRect(x + 2, y + 2, fillWidth, barHeight - 4);
        ctx.shadowBlur = 0;

        // Label with threat level
        ctx.font = '12px "Space Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.fillText(`NIVEAU DE MENACE: ${threatLevel} | ${bossHealth} HP`, centerX, y + 14);
    }

    drawScanlines(ctx, width, height) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        for (let y = this.scanlineOffset; y < height; y += 4) {
            ctx.fillRect(0, y, width, 2);
        }
    }

    drawGlitch(ctx, width, height) {
        // RGB split
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha *= this.glitchIntensity * 0.4;

        ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
        ctx.fillRect(4, 0, width, height);

        ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
        ctx.fillRect(-4, 0, width, height);

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        // Random horizontal slices
        if (Math.random() > 0.5) {
            const sliceY = Math.random() * height;
            const sliceHeight = 8 + Math.random() * 25;
            const offset = (Math.random() - 0.5) * 15 * this.glitchIntensity;

            ctx.drawImage(
                this.canvas,
                0, sliceY, width, sliceHeight,
                offset, sliceY, width, sliceHeight
            );
        }
    }

    skip() {
        if (this.phase !== 'fadeout') {
            // Complete all animations
            this.quoteCharIndex = this.bossData.quote.length;
            this.threatBarProgress = 1;
            this.flashIntensity = 0;
            this.glitchIntensity = 0;

            this.phase = 'fadeout';
            this.phaseStartTime = this.timer;
        }
    }

    isActive() {
        return this.active;
    }
}
