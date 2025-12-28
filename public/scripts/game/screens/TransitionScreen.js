// ============================================
// TRANSITION SCREEN - NetDefender
// Terminal-style modal between waves with polish effects
// ============================================

import { PORTFOLIO_COLORS, OSI_COLORS, OSI_LAYERS } from '../config/gameConfig.js';
import { getTransition, getLayerInfo } from '../content/narrativeContent.js';

export class TransitionScreen {
    constructor(canvas, audioManager = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;

        // State
        this.active = false;
        this.phase = 'idle'; // idle, fadein, typing, stats, waiting, fadeout
        this.timer = 0;
        this.phaseStartTime = 0;

        // Wave data
        this.completedWaveIndex = 0;
        this.nextWaveIndex = 0;
        this.completedLayer = null;
        this.nextLayer = null;
        this.waveStats = null;
        this.transitionData = null; // Rich narrative content from narrativeContent.js

        // Typing effect state
        this.lines = [];
        this.displayedLines = [];
        this.currentLineIndex = 0;
        this.currentCharIndex = 0;
        this.lastTypeTime = 0;

        // Stats animation
        this.displayedStats = {
            enemiesDefeated: 0,
            accuracy: 0,
            scoreBonus: 0
        };
        this.targetStats = null;

        // Animation values
        this.opacity = 0;
        this.borderGlow = 15;
        this.scanlineOffset = 0;
        this.glitchIntensity = 0;

        // Timing configuration (ms)
        this.config = {
            fadeInDuration: 400,
            typingSpeed: 30,
            lineDelay: 150,
            statsAnimDuration: 800,
            waitDuration: 2500,
            fadeOutDuration: 500
        };

        // Callbacks
        this.onComplete = null;
    }

    // Learning tips for each layer transition
    getLearningTip(nextLevel) {
        const tips = {
            7: "Application layer: Where users interact with network services",
            6: "Presentation layer: Handles encryption, compression & data formatting",
            5: "Session layer: Manages connections and session tokens",
            4: "Transport layer: TCP/UDP protocols ensure reliable delivery",
            3: "Network layer: IP addressing and routing decisions",
            2: "Data Link layer: MAC addresses and frame switching",
            1: "Physical layer: The actual cables, signals and hardware"
        };
        return tips[nextLevel] || "Stay vigilant, defender!";
    }

    show(completedWaveIndex, nextWaveIndex, stats) {
        this.active = true;
        this.phase = 'fadein';
        this.timer = 0;
        this.phaseStartTime = 0;
        this.opacity = 0;

        // Store wave data
        this.completedWaveIndex = completedWaveIndex;
        this.nextWaveIndex = nextWaveIndex;
        this.completedLayer = OSI_LAYERS[completedWaveIndex] || null;
        this.nextLayer = OSI_LAYERS[nextWaveIndex] || null;
        this.waveStats = stats || { enemiesDefeated: 0, accuracy: 0, scoreBonus: 0 };
        this.targetStats = { ...this.waveStats };
        this.displayedStats = { enemiesDefeated: 0, accuracy: 0, scoreBonus: 0 };

        // Get rich narrative content
        const fromLayer = this.completedLayer ? this.completedLayer.level : 7;
        const toLayer = this.nextLayer ? this.nextLayer.level : 0;
        this.transitionData = getTransition(fromLayer, toLayer);

        // Build terminal lines
        this.buildLines();
        this.displayedLines = [];
        this.currentLineIndex = 0;
        this.currentCharIndex = 0;
        this.lastTypeTime = 0;
    }

    buildLines() {
        const prevLayer = this.completedLayer;
        const nextLayer = this.nextLayer;
        const prevColor = prevLayer ? OSI_COLORS[prevLayer.level]?.color : PORTFOLIO_COLORS.neonCyan;
        const nextColor = nextLayer ? OSI_COLORS[nextLayer.level]?.color : PORTFOLIO_COLORS.neonCyan;
        const transition = this.transitionData;

        this.lines = [];

        // Command prompt style
        this.lines.push({
            text: '> LAYER_DEFENSE.exe --status',
            color: PORTFOLIO_COLORS.neonGreen,
            type: 'command'
        });

        this.lines.push({ text: '', color: PORTFOLIO_COLORS.white, type: 'empty' });

        // Success message from narrative content
        if (transition && transition.successMessage) {
            this.lines.push({
                text: `[OK] ${transition.successMessage}`,
                color: PORTFOLIO_COLORS.neonGreen,
                type: 'status'
            });
        } else if (prevLayer) {
            this.lines.push({
                text: `[OK] Layer ${prevLayer.level} (${prevLayer.name}) - SECURED`,
                color: PORTFOLIO_COLORS.neonGreen,
                type: 'status'
            });
        }

        this.lines.push({ text: '', color: PORTFOLIO_COLORS.white, type: 'empty' });

        // Next layer info with briefing
        if (nextLayer) {
            // Briefing from narrative
            if (transition && transition.briefing) {
                this.lines.push({
                    text: `> ${transition.briefing}`,
                    color: PORTFOLIO_COLORS.neonCyan,
                    type: 'command'
                });
            } else {
                this.lines.push({
                    text: '> Initializing next defense protocol...',
                    color: PORTFOLIO_COLORS.neonCyan,
                    type: 'command'
                });
            }

            this.lines.push({ text: '', color: PORTFOLIO_COLORS.white, type: 'empty' });

            this.lines.push({
                text: `CIBLE: Layer ${nextLayer.level} - ${nextLayer.name}`,
                color: nextColor,
                type: 'highlight',
                glow: true
            });

            this.lines.push({ text: '', color: PORTFOLIO_COLORS.white, type: 'empty' });

            // Threat warning from narrative
            if (transition && transition.threat) {
                this.lines.push({
                    text: `[!] ${transition.threat}`,
                    color: PORTFOLIO_COLORS.neonMagenta,
                    type: 'warning'
                });

                this.lines.push({ text: '', color: PORTFOLIO_COLORS.white, type: 'empty' });
            }

            // Learning tip from narrative
            if (transition && transition.tip) {
                this.lines.push({
                    text: `TIP: ${transition.tip}`,
                    color: PORTFOLIO_COLORS.grayLighter,
                    type: 'tip',
                    italic: true
                });
            } else {
                this.lines.push({
                    text: `TIP: ${this.getLearningTip(nextLayer.level)}`,
                    color: PORTFOLIO_COLORS.grayLighter,
                    type: 'tip',
                    italic: true
                });
            }
        } else {
            // Victory case
            if (transition && transition.successMessage) {
                this.lines.push({
                    text: `> ${transition.successMessage}`,
                    color: PORTFOLIO_COLORS.neonGreen,
                    type: 'highlight',
                    glow: true
                });

                this.lines.push({ text: '', color: PORTFOLIO_COLORS.white, type: 'empty' });

                if (transition.briefing) {
                    this.lines.push({
                        text: transition.briefing,
                        color: PORTFOLIO_COLORS.neonCyan,
                        type: 'status'
                    });
                }
            } else {
                this.lines.push({
                    text: '> ALL LAYERS SECURED - NETWORK PROTECTED!',
                    color: PORTFOLIO_COLORS.neonGreen,
                    type: 'highlight',
                    glow: true
                });
            }
        }

        this.lines.push({ text: '', color: PORTFOLIO_COLORS.white, type: 'empty' });

        // Continue prompt
        this.lines.push({
            text: '> Appuyez sur [ESPACE] pour continuer...',
            color: PORTFOLIO_COLORS.neonMagenta,
            type: 'prompt',
            blink: true
        });
    }

    update(deltaTime) {
        if (!this.active) return false;

        this.timer += deltaTime;
        this.scanlineOffset = (this.scanlineOffset + 0.3) % 4;

        // Random glitch chance
        if (Math.random() < 0.02) {
            this.glitchIntensity = 0.3 + Math.random() * 0.3;
        } else {
            this.glitchIntensity *= 0.9;
        }

        const phaseTime = this.timer - this.phaseStartTime;

        switch (this.phase) {
            case 'fadein':
                this.opacity = Math.min(1, phaseTime / this.config.fadeInDuration);
                this.borderGlow = 15 * this.opacity;

                if (phaseTime >= this.config.fadeInDuration) {
                    this.phase = 'typing';
                    this.phaseStartTime = this.timer;
                    this.lastTypeTime = this.timer;
                }
                break;

            case 'typing':
                this.updateTyping(deltaTime);
                break;

            case 'stats':
                this.updateStats(deltaTime);

                if (phaseTime >= this.config.statsAnimDuration) {
                    this.phase = 'waiting';
                    this.phaseStartTime = this.timer;
                }
                break;

            case 'waiting':
                // Pulse border glow
                this.borderGlow = 15 + Math.sin(this.timer * 0.005) * 5;

                if (phaseTime >= this.config.waitDuration) {
                    this.phase = 'fadeout';
                    this.phaseStartTime = this.timer;
                }
                break;

            case 'fadeout':
                this.opacity = 1 - Math.min(1, phaseTime / this.config.fadeOutDuration);

                if (phaseTime >= this.config.fadeOutDuration) {
                    this.active = false;
                    if (this.onComplete) this.onComplete();
                    return true;
                }
                break;
        }

        return false;
    }

    updateTyping(deltaTime) {
        const timeSinceLastType = this.timer - this.lastTypeTime;

        if (this.currentLineIndex < this.lines.length) {
            const currentLine = this.lines[this.currentLineIndex];

            // Empty lines complete instantly
            if (currentLine.text === '') {
                this.displayedLines.push({ ...currentLine, displayText: '' });
                this.currentLineIndex++;
                this.currentCharIndex = 0;
                this.lastTypeTime = this.timer;
                return;
            }

            // Type next character
            if (timeSinceLastType >= this.config.typingSpeed) {
                this.currentCharIndex++;
                this.lastTypeTime = this.timer;

                // Play typing sound
                if (this.audioManager && this.audioManager.playTypingBip) {
                    this.audioManager.playTypingBip();
                }

                // Line complete
                if (this.currentCharIndex >= currentLine.text.length) {
                    this.displayedLines.push({
                        ...currentLine,
                        displayText: currentLine.text
                    });
                    this.currentLineIndex++;
                    this.currentCharIndex = 0;
                    this.lastTypeTime = this.timer + this.config.lineDelay;

                    // Play line complete sound
                    if (this.audioManager && this.audioManager.playLineComplete) {
                        this.audioManager.playLineComplete();
                    }
                }
            }
        } else {
            // All lines typed, move to stats
            this.phase = 'stats';
            this.phaseStartTime = this.timer;
        }
    }

    updateStats(deltaTime) {
        const progress = Math.min(1, (this.timer - this.phaseStartTime) / this.config.statsAnimDuration);
        const eased = this.easeOutCubic(progress);

        this.displayedStats.enemiesDefeated = Math.floor(this.targetStats.enemiesDefeated * eased);
        this.displayedStats.accuracy = Math.floor(this.targetStats.accuracy * eased);
        this.displayedStats.scoreBonus = Math.floor(this.targetStats.scoreBonus * eased);

        // Play tick sound occasionally
        if (this.audioManager && this.audioManager.playStatsTick && Math.random() < 0.3) {
            this.audioManager.playStatsTick();
        }
    }

    draw() {
        if (!this.active) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Modal dimensions (responsive) - increased for rich narrative content
        const modalWidth = Math.min(650, width * 0.9);
        const modalHeight = Math.min(520, height * 0.85);
        const modalX = centerX - modalWidth / 2;
        const modalY = centerY - modalHeight / 2;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Draw backdrop
        this.drawBackdrop(ctx, width, height);

        // Draw modal
        this.drawModal(ctx, modalX, modalY, modalWidth, modalHeight);

        // Draw terminal content
        this.drawTerminalContent(ctx, modalX, modalY, modalWidth, modalHeight);

        // Draw stats panel
        if (this.phase === 'stats' || this.phase === 'waiting' || this.phase === 'fadeout') {
            this.drawStatsPanel(ctx, modalX, modalY, modalWidth, modalHeight);
        }

        // Draw scanlines
        this.drawScanlines(ctx, modalX, modalY, modalWidth, modalHeight);

        // Draw glitch effect
        if (this.glitchIntensity > 0.05) {
            this.drawGlitch(ctx, modalX, modalY, modalWidth, modalHeight);
        }

        ctx.restore();
    }

    drawBackdrop(ctx, width, height) {
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
        ctx.fillRect(0, 0, width, height);

        // Subtle grid pattern
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.03)';
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
    }

    drawModal(ctx, x, y, width, height) {
        const layerColor = this.nextLayer
            ? OSI_COLORS[this.nextLayer.level]?.color || PORTFOLIO_COLORS.neonCyan
            : PORTFOLIO_COLORS.neonGreen;

        // Modal background
        ctx.fillStyle = PORTFOLIO_COLORS.grayDark;
        ctx.fillRect(x, y, width, height);

        // Inner grid pattern
        ctx.strokeStyle = `rgba(0, 255, 255, 0.02)`;
        ctx.lineWidth = 1;
        for (let gx = x; gx <= x + width; gx += 25) {
            ctx.beginPath();
            ctx.moveTo(gx, y);
            ctx.lineTo(gx, y + height);
            ctx.stroke();
        }
        for (let gy = y; gy <= y + height; gy += 25) {
            ctx.beginPath();
            ctx.moveTo(x, gy);
            ctx.lineTo(x + width, gy);
            ctx.stroke();
        }

        // Glowing border
        ctx.strokeStyle = layerColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = layerColor;
        ctx.shadowBlur = this.borderGlow;
        ctx.strokeRect(x, y, width, height);
        ctx.shadowBlur = 0;

        // Corner decorations
        this.drawCornerDecorations(ctx, x, y, width, height, layerColor);

        // Top accent line
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, layerColor);
        gradient.addColorStop(1, 'transparent');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 20, y);
        ctx.lineTo(x + width - 20, y);
        ctx.stroke();
    }

    drawCornerDecorations(ctx, x, y, width, height, color) {
        ctx.fillStyle = color;
        ctx.font = '12px "Space Mono", monospace';
        ctx.shadowColor = color;
        ctx.shadowBlur = 5;

        // Top-left
        ctx.textAlign = 'left';
        ctx.fillText('[ ]', x + 8, y + 18);

        // Top-right
        ctx.textAlign = 'right';
        ctx.fillText('[ ]', x + width - 8, y + 18);

        // Bottom-left
        ctx.textAlign = 'left';
        ctx.fillText('[ ]', x + 8, y + height - 8);

        // Bottom-right
        ctx.textAlign = 'right';
        ctx.fillText('[ ]', x + width - 8, y + height - 8);

        ctx.shadowBlur = 0;
    }

    drawTerminalContent(ctx, modalX, modalY, modalWidth, modalHeight) {
        const padding = 30;
        const lineHeight = 22;
        let y = modalY + padding + 30;

        // Header
        const headerColor = this.nextLayer
            ? OSI_COLORS[this.nextLayer.level]?.color || PORTFOLIO_COLORS.neonCyan
            : PORTFOLIO_COLORS.neonGreen;

        ctx.font = 'bold 28px "Bebas Neue", sans-serif';
        ctx.fillStyle = headerColor;
        ctx.textAlign = 'center';
        ctx.shadowColor = headerColor;
        ctx.shadowBlur = 20;
        ctx.fillText(`WAVE ${this.completedWaveIndex + 1} COMPLETE`, modalX + modalWidth / 2, y);
        ctx.shadowBlur = 0;

        y += 40;

        // Draw completed lines
        ctx.textAlign = 'left';
        for (const line of this.displayedLines) {
            this.drawLine(ctx, line, modalX + padding, y);
            y += lineHeight;
        }

        // Draw currently typing line with cursor
        if (this.currentLineIndex < this.lines.length && this.phase === 'typing') {
            const currentLine = this.lines[this.currentLineIndex];
            const displayText = currentLine.text.substring(0, this.currentCharIndex);
            const cursorVisible = Math.floor(this.timer / 300) % 2 === 0;

            ctx.font = currentLine.italic ? 'italic 13px "Space Mono", monospace' : '14px "Space Mono", monospace';
            ctx.fillStyle = currentLine.color;

            if (currentLine.glow) {
                ctx.shadowColor = currentLine.color;
                ctx.shadowBlur = 10;
            }

            ctx.fillText(displayText + (cursorVisible ? '█' : ' '), modalX + padding, y);
            ctx.shadowBlur = 0;
        }
    }

    drawLine(ctx, line, x, y) {
        ctx.font = line.italic ? 'italic 13px "Space Mono", monospace' : '14px "Space Mono", monospace';
        ctx.fillStyle = line.color;

        if (line.glow) {
            ctx.shadowColor = line.color;
            ctx.shadowBlur = 12;
        }

        // Blinking prompt
        if (line.blink) {
            const visible = Math.floor(this.timer / 500) % 2 === 0;
            ctx.globalAlpha = visible ? this.opacity : this.opacity * 0.3;
        }

        ctx.fillText(line.displayText || line.text, x, y);

        ctx.globalAlpha = this.opacity;
        ctx.shadowBlur = 0;
    }

    drawStatsPanel(ctx, modalX, modalY, modalWidth, modalHeight) {
        const panelHeight = 70;
        const panelY = modalY + modalHeight - panelHeight - 20;
        const panelX = modalX + 25;
        const panelWidth = modalWidth - 50;

        // Panel background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

        // Panel border
        ctx.strokeStyle = PORTFOLIO_COLORS.neonGreen;
        ctx.lineWidth = 1;
        ctx.shadowColor = PORTFOLIO_COLORS.neonGreen;
        ctx.shadowBlur = 8;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        ctx.shadowBlur = 0;

        // Stats content
        ctx.font = '13px "Space Mono", monospace';
        ctx.textAlign = 'left';

        const col1X = panelX + 15;
        const col2X = panelX + panelWidth / 2;

        // Row 1
        ctx.fillStyle = PORTFOLIO_COLORS.grayLighter;
        ctx.fillText('MENACES NEUTRALISÉES:', col1X, panelY + 25);
        ctx.fillStyle = PORTFOLIO_COLORS.neonCyan;
        ctx.fillText(`${this.displayedStats.enemiesDefeated}`, col1X + 195, panelY + 25);

        ctx.fillStyle = PORTFOLIO_COLORS.grayLighter;
        ctx.fillText('PRÉCISION:', col2X, panelY + 25);
        ctx.fillStyle = PORTFOLIO_COLORS.neonCyan;
        ctx.fillText(`${this.displayedStats.accuracy}%`, col2X + 95, panelY + 25);

        // Row 2
        ctx.fillStyle = PORTFOLIO_COLORS.grayLighter;
        ctx.fillText('BONUS SCORE:', col1X, panelY + 50);
        ctx.fillStyle = PORTFOLIO_COLORS.neonGreen;
        ctx.shadowColor = PORTFOLIO_COLORS.neonGreen;
        ctx.shadowBlur = 8;
        ctx.fillText(`+${this.displayedStats.scoreBonus}`, col1X + 120, panelY + 50);
        ctx.shadowBlur = 0;
    }

    drawScanlines(ctx, x, y, width, height) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        for (let sy = this.scanlineOffset; sy < height; sy += 4) {
            ctx.fillRect(x, y + sy, width, 2);
        }
    }

    drawGlitch(ctx, x, y, width, height) {
        // RGB split effect
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = this.glitchIntensity * 0.2 * this.opacity;

        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.fillRect(x + 3, y, width, height);

        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.fillRect(x - 3, y, width, height);

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = this.opacity;

        // Random horizontal slice
        if (Math.random() > 0.6) {
            const sliceY = y + Math.random() * height;
            const sliceHeight = 5 + Math.random() * 15;
            const offset = (Math.random() - 0.5) * 10 * this.glitchIntensity;

            ctx.drawImage(
                this.canvas,
                x, sliceY, width, sliceHeight,
                x + offset, sliceY, width, sliceHeight
            );
        }
    }

    skip() {
        if (this.phase === 'typing') {
            // Complete all typing immediately
            this.displayedLines = this.lines.map(l => ({ ...l, displayText: l.text }));
            this.currentLineIndex = this.lines.length;
            this.phase = 'stats';
            this.phaseStartTime = this.timer;
        } else if (this.phase === 'stats') {
            // Complete stats animation
            this.displayedStats = { ...this.targetStats };
            this.phase = 'waiting';
            this.phaseStartTime = this.timer - this.config.waitDuration + 500;
        } else if (this.phase === 'waiting') {
            // Start fadeout
            this.phase = 'fadeout';
            this.phaseStartTime = this.timer;
        }
    }

    easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    isActive() {
        return this.active;
    }
}
