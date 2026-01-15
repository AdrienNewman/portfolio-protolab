// ============================================
// BOSS CINEMATIC - Style Holo-Entity V2
// Portrait holographique + effets cosmiques
// Inspiré de SageScreen.js
// ============================================

import { Enemy } from '../entities/Enemy.js';
import { BOSS_BEHAVIORS } from '../behaviors/bossBehaviors.js';

export class BossIntro {
    constructor(canvas, audioManager = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        this.width = canvas.width;
        this.height = canvas.height;

        // State
        this.active = false;
        this.finished = false;
        this.timer = 0;
        this.phase = 'intro'; // 'intro', 'waiting', 'out'

        // Boss data
        this.bossConfig = null;
        this.layerLevel = 7;
        this.dummyEnemy = null;

        // Portrait image loading
        this.portraitImage = null;
        this.portraitLoaded = false;
        this.portraitLoadFailed = false;
        this.portraitLoadTimeout = 3000;

        // Animation state
        this.glowPulse = 0;
        this.portraitScale = 1;
        this.fadeIn = 0;

        // Transformation mode flag
        this.isTransformation = false;
        this.transformData = null;

        // Callbacks
        this.onComplete = null;
    }

    /**
     * Show the boss cinematic
     * @param {object} bossConfig - Configuration du boss depuis enemies array
     * @param {number} layerLevel - Niveau OSI (1-7)
     */
    show(bossConfig, layerLevel) {
        this.active = true;
        this.finished = false;
        this.timer = 0;
        this.phase = 'intro';
        this.layerLevel = layerLevel;
        this.fadeIn = 0;
        this.glowPulse = 0;
        this.isTransformation = false; // Reset transformation flag
        this.transformData = null;

        // Reset portrait state
        this.portraitImage = null;
        this.portraitLoaded = false;
        this.portraitLoadFailed = false;

        // Récupérer la config complète du boss depuis BOSS_BEHAVIORS
        const bossId = bossConfig.bossId;
        const fullBossConfig = bossId && BOSS_BEHAVIORS[bossId] ? BOSS_BEHAVIORS[bossId] : null;

        if (fullBossConfig) {
            this.bossConfig = fullBossConfig;
        } else {
            // Fallback si pas de config trouvée
            this.bossConfig = {
                name: bossConfig.name || 'BOSS INCONNU',
                subtitle: 'MENACE DÉTECTÉE',
                quote: '"Préparez-vous à affronter l\'inconnu..."',
                color: bossConfig.color || '#ff0080',
                glowColor: 'rgba(255, 0, 128, 0.6)',
                shape: 'hexagon',
                size: 80
            };
        }

        // Load portrait image if available
        if (this.bossConfig.portrait) {
            this.portraitImage = new Image();

            const loadTimeout = setTimeout(() => {
                if (!this.portraitLoaded) {
                    console.warn(`[BossIntro] Timeout chargement portrait: ${this.bossConfig.portrait}`);
                    this.portraitLoadFailed = true;
                }
            }, this.portraitLoadTimeout);

            this.portraitImage.onload = () => {
                clearTimeout(loadTimeout);
                this.portraitLoaded = true;
                console.log(`[BossIntro] Portrait chargé: ${this.bossConfig.portrait}`);
            };

            this.portraitImage.onerror = () => {
                clearTimeout(loadTimeout);
                this.portraitLoadFailed = true;
                console.warn(`[BossIntro] Erreur chargement portrait: ${this.bossConfig.portrait}`);
            };

            this.portraitImage.src = this.bossConfig.portrait;
        }

        // Création d'un "faux" boss pour fallback
        const dummyConfig = {
            ...bossConfig,
            bossId: bossId,
            health: 999,
            behavior: 'boss'
        };

        this.dummyEnemy = new Enemy(
            dummyConfig,
            layerLevel,
            this.width * 0.35,
            this.height * 0.45,
            this.width,
            this.height
        );

        this.dummyEnemy.size = 120;

        // Play boss alert sound
        if (this.audioManager && this.audioManager.playBossAlert) {
            this.audioManager.playBossAlert();
        }
    }

    /**
     * Skip / Trigger fight
     */
    skip() {
        console.log('[BossIntro] skip() called, current phase:', this.phase);
        if (this.phase === 'waiting') {
            console.log('[BossIntro] Transitioning from waiting to out');
            this.phase = 'out';
        } else if (this.phase === 'intro') {
            console.log('[BossIntro] Transitioning from intro to out');
            this.phase = 'out';
        }
    }

    /**
     * Update la cinématique
     * @param {number} deltaTime - Temps écoulé en ms
     */
    update(deltaTime) {
        if (!this.active) return false;

        this.timer += deltaTime;
        this.glowPulse += deltaTime * 0.003;

        // Fade in progressif
        if (this.fadeIn < 1) {
            this.fadeIn = Math.min(1, this.fadeIn + deltaTime * 0.002);
        }

        // Intro phase
        if (this.phase === 'intro') {
            // Calculer le temps pour l'animation complète
            const quoteStart = 1500;
            const quoteLength = (this.bossConfig.quote || '').length;
            const quoteEndTime = quoteStart + quoteLength * 35 + 500;

            const dramaticWords = (this.bossConfig.dramaticLine || '').split(' ');
            const dramaticDuration = dramaticWords.length * 600 + 1500;

            const totalAnimTime = quoteEndTime + dramaticDuration;

            if (this.timer > totalAnimTime) {
                this.phase = 'waiting';
            }
        }
        // Out phase
        else if (this.phase === 'out') {
            this.fadeIn -= deltaTime * 0.004;
            if (this.fadeIn <= 0) {
                console.log('[BossIntro] Fade out complete, calling onComplete');
                this.active = false;
                this.finished = true;
                if (this.onComplete) {
                    console.log('[BossIntro] onComplete callback exists, calling it');
                    this.onComplete();
                } else {
                    console.error('[BossIntro] ERROR: onComplete callback is not set!');
                }
                return true;
            }
        }

        return false;
    }

    /**
     * Draw la cinématique
     */
    draw() {
        if (!this.active) return;

        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.save();

        // 1. FOND SEMI-TRANSPARENT (étoiles visibles)
        const bgAlpha = this.phase === 'out' ? 0.3 * this.fadeIn : 0.7 * this.fadeIn;
        ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
        ctx.fillRect(0, 0, w, h);

        // 2. VIGNETTE RADIALE (plus claire au centre)
        this.renderVignette(ctx, w, h);

        // 3. PORTRAIT HOLOGRAPHIQUE (gauche)
        if (this.timer > 300 && this.phase !== 'out') {
            this.renderBossPortrait(ctx);
        }

        // 4. TEXTES (droite)
        if (this.timer > 800 && this.phase !== 'out') {
            this.renderTexts(ctx, w, h);
        }

        // 5. PROMPT "PRESS ENTER"
        if (this.phase === 'waiting') {
            this.renderPrompt(ctx, w, h);
        }

        // 6. SCANLINES GLOBALES
        this.renderGlobalScanlines(ctx, w, h);

        ctx.restore();
    }

    // ============================================
    // VIGNETTE - Fade radial avec teinte boss
    // ============================================

    renderVignette(ctx, w, h) {
        const gradient = ctx.createRadialGradient(
            w * 0.35, h * 0.45, 0,
            w * 0.35, h * 0.45, Math.max(w, h) * 0.8
        );

        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.2)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Teinte accent sur les bords
        const accentColor = this.bossConfig.glowColor || this.bossConfig.color || '#ff3333';
        const accentRgba = this.hexToRgba(accentColor, 0.08);

        const accentGradient = ctx.createRadialGradient(
            w * 0.35, h * 0.45, Math.max(w, h) * 0.3,
            w * 0.35, h * 0.45, Math.max(w, h) * 0.9
        );
        accentGradient.addColorStop(0, 'transparent');
        accentGradient.addColorStop(1, accentRgba);

        ctx.fillStyle = accentGradient;
        ctx.fillRect(0, 0, w, h);
    }

    // ============================================
    // PORTRAIT BOSS - Style Holo-Entity
    // ============================================

    renderBossPortrait(ctx) {
        const w = this.width;
        const h = this.height;

        // Animation breathing/float (style agressif)
        const floatOffset = Math.sin(this.glowPulse * 0.8) * 6;
        const breathScale = 1 + Math.sin(this.glowPulse * 1.2) * 0.02;

        // Shake léger permanent (menace)
        const shakeX = (Math.random() - 0.5) * 2;
        const shakeY = (Math.random() - 0.5) * 2;

        // Position GAUCHE (35%)
        const centerX = w * 0.35 + shakeX;
        const baseCenterY = h * 0.45;
        const centerY = baseCenterY + floatOffset + shakeY;

        const maxSize = Math.min(w * 0.4, h * 0.5);
        const size = maxSize * breathScale * this.fadeIn;

        // Couleur accent du boss (rouge agressif par défaut)
        const accentColor = this.bossConfig.glowColor || this.bossConfig.color || '#ff3333';
        const glowIntensity = 0.6 + Math.sin(this.glowPulse * 0.8) * 0.3;

        // Aura agressive
        this.renderAura(ctx, centerX, centerY, size, accentColor, glowIntensity);

        // Portrait ou fallback
        if (this.portraitLoaded && this.portraitImage) {
            this.renderHologramImage(ctx, centerX, centerY, size, accentColor);
        } else if (this.portraitLoadFailed || !this.bossConfig.portrait) {
            this.renderFallbackInitials(ctx, centerX, centerY, size, accentColor);
        } else {
            // Loading placeholder
            this.renderLoadingPlaceholder(ctx, centerX, centerY, size, accentColor);
        }
    }

    // ============================================
    // AURA - 3 couches de glow agressif
    // ============================================

    renderAura(ctx, centerX, centerY, size, color, intensity) {
        // Couche externe (très floue)
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 80 * intensity;
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2 + 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Couche moyenne
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 40 * intensity;
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.5 * intensity;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2 + 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Couche interne (plus nette)
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 20 * intensity;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2 + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // ============================================
    // HOLOGRAMME - Image avec effets
    // ============================================

    renderHologramImage(ctx, centerX, centerY, size, accentColor) {
        const img = this.portraitImage;

        if (!img || !img.width || !img.height || !isFinite(size) || size <= 0) {
            this.renderFallbackInitials(ctx, centerX, centerY, size || 100, accentColor);
            return;
        }

        const radius = size / 2;

        ctx.save();
        ctx.imageSmoothingEnabled = false; // Pixel Art crisp

        // Clip circulaire
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Calculer dimensions (cover)
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

        // GLITCH EFFECT (3% chance - plus fréquent que sages)
        const glitchActive = Math.random() < 0.03;

        if (glitchActive) {
            this.renderGlitchedImage(ctx, img, drawX, drawY, drawWidth, drawHeight);
        } else {
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        }

        ctx.restore();

        // Scanlines holographiques
        this.renderHoloScanlines(ctx, centerX, centerY, radius);

        // Color overlay (teinte rouge/sombre)
        this.renderColorOverlay(ctx, centerX, centerY, radius, accentColor);

        // Edge fade
        this.renderEdgeFade(ctx, centerX, centerY, radius);
    }

    // ============================================
    // GLITCH - Bandes décalées
    // ============================================

    renderGlitchedImage(ctx, img, drawX, drawY, drawWidth, drawHeight) {
        const numGlitches = 2 + Math.floor(Math.random() * 4); // 2-5 bandes

        // Image de base
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Bandes glitch
        for (let i = 0; i < numGlitches; i++) {
            const bandHeight = 5 + Math.random() * 20;
            const bandY = drawY + Math.random() * drawHeight;
            const offsetX = (Math.random() - 0.5) * 25; // ±12px

            ctx.save();

            ctx.beginPath();
            ctx.rect(drawX - 50, bandY, drawWidth + 100, bandHeight);
            ctx.clip();

            ctx.drawImage(img, drawX + offsetX, drawY, drawWidth, drawHeight);

            // Teinte glitch (rouge ou noir pour boss)
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(drawX - 50, bandY, drawWidth + 100, bandHeight);

            ctx.restore();
        }
    }

    // ============================================
    // SCANLINES HOLOGRAPHIQUES
    // ============================================

    renderHoloScanlines(ctx, centerX, centerY, radius) {
        if (!isFinite(radius) || radius <= 0) return;

        ctx.save();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();

        // Scanlines statiques animées
        const scanOffset = (this.timer * 0.02) % 4;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';

        for (let y = -radius + scanOffset; y < radius; y += 4) {
            ctx.fillRect(centerX - radius, centerY + y, radius * 2, 1.5);
        }

        // Ligne de scan brillante
        const scanLineY = ((this.timer * 0.05) % (radius * 2)) - radius;
        const scanGradient = ctx.createLinearGradient(
            centerX, centerY + scanLineY - 10,
            centerX, centerY + scanLineY + 10
        );
        scanGradient.addColorStop(0, 'rgba(255, 100, 100, 0)');
        scanGradient.addColorStop(0.5, 'rgba(255, 100, 100, 0.2)');
        scanGradient.addColorStop(1, 'rgba(255, 100, 100, 0)');

        ctx.fillStyle = scanGradient;
        ctx.fillRect(centerX - radius, centerY + scanLineY - 10, radius * 2, 20);

        ctx.restore();
    }

    // ============================================
    // COLOR OVERLAY - Teinte rouge/sombre
    // ============================================

    renderColorOverlay(ctx, centerX, centerY, radius, accentColor) {
        if (!isFinite(radius) || radius <= 0) return;

        ctx.save();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();

        // Mode screen pour effet lumineux sombre
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = this.hexToRgba(accentColor, 0.15);
        ctx.fill();

        // Gradient de profondeur
        ctx.globalCompositeOperation = 'overlay';
        const overlayGradient = ctx.createRadialGradient(
            centerX, centerY - radius * 0.3, 0,
            centerX, centerY, radius
        );
        overlayGradient.addColorStop(0, this.hexToRgba(accentColor, 0.1));
        overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = overlayGradient;
        ctx.fill();

        ctx.restore();
    }

    // ============================================
    // EDGE FADE - Bords fondus
    // ============================================

    renderEdgeFade(ctx, centerX, centerY, radius) {
        if (!isFinite(radius) || radius <= 0) return;

        ctx.save();

        const fadeGradient = ctx.createRadialGradient(
            centerX, centerY, radius * 0.5,
            centerX, centerY, radius
        );
        fadeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        fadeGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)');
        fadeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = fadeGradient;
        ctx.fill();

        ctx.restore();
    }

    // ============================================
    // FALLBACK - Initiales stylisées
    // ============================================

    renderFallbackInitials(ctx, centerX, centerY, size, accentColor) {
        const radius = size / 2;

        // Cercle de fond
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

        const bgGradient = ctx.createRadialGradient(
            centerX, centerY - radius * 0.3, 0,
            centerX, centerY, radius
        );
        bgGradient.addColorStop(0, 'rgba(40, 0, 0, 0.9)');
        bgGradient.addColorStop(1, 'rgba(10, 0, 0, 0.95)');
        ctx.fillStyle = bgGradient;
        ctx.fill();
        ctx.restore();

        // Initiales
        const name = this.bossConfig.name || 'BOSS';
        const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${size * 0.4}px "Bebas Neue", "Courier New", monospace`;
        ctx.fillStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 20;
        ctx.fillText(initials, centerX, centerY);
        ctx.restore();

        // Scanlines et edge fade
        this.renderHoloScanlines(ctx, centerX, centerY, radius);
        this.renderEdgeFade(ctx, centerX, centerY, radius);
    }

    // ============================================
    // LOADING - Placeholder animé
    // ============================================

    renderLoadingPlaceholder(ctx, centerX, centerY, size, accentColor) {
        const radius = size / 2;

        // Cercle de fond
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20, 0, 0, 0.8)';
        ctx.fill();
        ctx.restore();

        // Anneau de chargement
        ctx.save();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        const startAngle = this.glowPulse * 2;
        const endAngle = startAngle + Math.PI * 0.7;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, startAngle, endAngle);
        ctx.stroke();
        ctx.restore();
    }

    // ============================================
    // TEXTES - Nom, subtitle, quote, dramatic
    // ============================================

    renderTexts(ctx, w, h) {
        const textX = w * 0.55;
        const textY = h * 0.35;
        const accentColor = this.bossConfig.color || '#ff0080';

        ctx.textAlign = 'left';

        // NOM DU BOSS
        ctx.fillStyle = '#fff';
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 20;

        let subtitleY = textY + 40;
        let layerY = textY + 70;

        if (this.bossConfig.name2) {
            ctx.font = '900 38px "Bebas Neue", "Courier New", monospace';
            ctx.fillText(this.bossConfig.name.toUpperCase(), textX, textY);
            ctx.fillText(this.bossConfig.name2.toUpperCase(), textX, textY + 38);
            subtitleY = textY + 85;
            layerY = textY + 115;
        } else {
            ctx.font = '900 52px "Bebas Neue", "Courier New", monospace';
            ctx.fillText(this.bossConfig.name.toUpperCase(), textX, textY);
        }
        ctx.shadowBlur = 0;

        // SOUS-TITRE
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 22px "Space Mono", "Courier New", monospace';
        ctx.fillText(this.bossConfig.subtitle || '', textX, subtitleY);

        // LAYER INFO
        ctx.fillStyle = '#888';
        ctx.font = '14px "Space Mono", monospace';
        ctx.fillText(`[ LAYER ${this.layerLevel} ]`, textX, layerY);

        // CITATION avec typewriter
        const quoteStart = 1500;
        const quoteY = layerY + 30;

        if (this.timer > quoteStart && this.bossConfig.quote) {
            const charsToShow = Math.floor((this.timer - quoteStart) / 35);
            const fullQuote = this.bossConfig.quote;
            const currentQuote = fullQuote.substring(0, Math.min(charsToShow, fullQuote.length));

            ctx.fillStyle = '#ff6666';
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 8;
            ctx.font = 'italic 16px "Space Mono", "Courier New", monospace';

            const quoteLines = this.getWrappedLines(currentQuote, w * 0.4, ctx);
            this.wrapText(ctx, currentQuote, textX, quoteY, w * 0.4, 24);

            // Curseur clignotant
            if (charsToShow < fullQuote.length && Math.floor(this.timer / 300) % 2 === 0) {
                const lastLineY = quoteY + (quoteLines.length - 1) * 24;
                const lastLineWidth = ctx.measureText(quoteLines[quoteLines.length - 1] || '').width;
                ctx.fillText('█', textX + lastLineWidth, lastLineY);
            }

            ctx.shadowBlur = 0;

            // LIGNE DRAMATIQUE
            const quoteEndTime = quoteStart + fullQuote.length * 35 + 500;
            if (this.timer > quoteEndTime && this.bossConfig.dramaticLine) {
                this.renderDramaticLine(ctx, textX, quoteY + quoteLines.length * 24 + 40, quoteEndTime);
            }
        }
    }

    // ============================================
    // DRAMATIC LINE - Mot par mot
    // ============================================

    renderDramaticLine(ctx, textX, dramaticY, quoteEndTime) {
        const dramaticWords = this.bossConfig.dramaticLine.split(' ');
        const wordDelay = 600;
        const dramaticElapsed = this.timer - quoteEndTime;

        const wordsToShow = Math.min(
            Math.floor(dramaticElapsed / wordDelay) + 1,
            dramaticWords.length
        );

        ctx.save();
        ctx.textAlign = 'left';

        for (let i = 0; i < wordsToShow; i++) {
            const word = dramaticWords[i];
            const wordStartTime = quoteEndTime + i * wordDelay;
            const wordAge = this.timer - wordStartTime;

            const appearProgress = Math.min(1, wordAge / 200);
            const scale = 0.5 + appearProgress * 0.5;

            const isLastWord = (i === dramaticWords.length - 1);

            let wordX = textX;
            for (let j = 0; j < i; j++) {
                ctx.font = 'bold 28px "Bebas Neue", "Courier New", monospace';
                wordX += ctx.measureText(dramaticWords[j] + ' ').width;
            }

            ctx.save();

            // Tremblement pour le dernier mot
            if (isLastWord && wordAge > 200) {
                const shakeIntensity = Math.min(10, (wordAge - 200) / 40);
                const shakeX = (Math.random() - 0.5) * shakeIntensity;
                const shakeY = (Math.random() - 0.5) * shakeIntensity;
                ctx.translate(shakeX, shakeY);
            }

            ctx.globalAlpha = appearProgress;

            if (isLastWord) {
                ctx.fillStyle = '#ff3333';
                ctx.shadowColor = '#ff0000';
                ctx.shadowBlur = 25;
                ctx.font = 'bold 36px "Bebas Neue", "Courier New", monospace';
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 10;
                ctx.font = 'bold 28px "Bebas Neue", "Courier New", monospace';
            }

            ctx.translate(wordX, dramaticY);
            ctx.scale(scale, scale);
            ctx.translate(-wordX, -dramaticY);

            ctx.fillText(word, wordX, dramaticY);

            ctx.restore();
        }

        ctx.restore();
    }

    // ============================================
    // PROMPT - Press Enter
    // ============================================

    renderPrompt(ctx, w, h) {
        const pulseAlpha = (Math.sin(this.timer / 150) + 1) / 2;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 100, 100, ${0.4 + pulseAlpha * 0.6})`;
        ctx.font = 'bold 18px "Space Mono", "Courier New", monospace';
        ctx.shadowColor = '#ff3333';
        ctx.shadowBlur = 10 * pulseAlpha;
        ctx.fillText('[ APPUYEZ SUR ENTRÉE POUR PASSER AU COMBAT ]', w / 2, h * 0.9);
        ctx.restore();
    }

    // ============================================
    // SCANLINES GLOBALES
    // ============================================

    renderGlobalScanlines(ctx, w, h) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        for (let y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 2);
        }
    }

    // ============================================
    // UTILITAIRES
    // ============================================

    hexToRgba(hex, alpha) {
        // Handle rgba format
        if (hex.startsWith('rgba')) {
            const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
                return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
            }
        }

        // Handle hex format
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
        }
        return `rgba(255, 0, 0, ${alpha})`; // Fallback rouge
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line.trim(), x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), x, y);
    }

    getWrappedLines(text, maxWidth, ctx) {
        const words = text.split(' ');
        const lines = [];
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && n > 0) {
                lines.push(line.trim());
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());
        return lines;
    }

    isActive() {
        return this.active;
    }

    canSkip() {
        return this.active && this.phase === 'waiting';
    }

    // ============================================
    // TRANSFORMATION CINEMATIC - Mid-fight phase change
    // ============================================

    /**
     * Show a transformation cinematic (shorter than intro)
     * @param {object} transformData - { newName, newSubtitle, newColor, newShape, quote }
     * @param {object} phase2Config - Full phase2 config from boss
     */
    showTransformation(transformData, phase2Config) {
        this.active = true;
        this.finished = false;
        this.timer = 0;
        this.phase = 'transform_in';
        this.fadeIn = 0;
        this.glowPulse = 0;
        this.isTransformation = true;

        // Store transform data
        this.transformData = transformData;

        // Build a temporary bossConfig for rendering
        this.bossConfig = {
            name: phase2Config?.name || transformData.newName || 'TRANSFORMATION',
            name2: phase2Config?.name2 || '',
            subtitle: phase2Config?.subtitle || transformData.newSubtitle || 'NOUVELLE FORME',
            quote: phase2Config?.quote || transformData.quote || '',
            dramaticLine: transformData.newName ? `${transformData.newName} AWAKENS!` : 'TRANSFORMATION!',
            color: phase2Config?.color || transformData.newColor || '#ff0080',
            glowColor: phase2Config?.glowColor || transformData.newColor || '#ff0080',
            shape: phase2Config?.shape || transformData.newShape || 'hexagon',
            portrait: phase2Config?.portrait || null
        };

        // Reset portrait state
        this.portraitImage = null;
        this.portraitLoaded = false;
        this.portraitLoadFailed = false;

        // Load portrait if available
        if (this.bossConfig.portrait) {
            this.portraitImage = new Image();

            const loadTimeout = setTimeout(() => {
                if (!this.portraitLoaded) {
                    this.portraitLoadFailed = true;
                }
            }, this.portraitLoadTimeout);

            this.portraitImage.onload = () => {
                clearTimeout(loadTimeout);
                this.portraitLoaded = true;
                console.log(`[BossIntro] Transform portrait loaded: ${this.bossConfig.portrait}`);
            };

            this.portraitImage.onerror = () => {
                clearTimeout(loadTimeout);
                this.portraitLoadFailed = true;
            };

            this.portraitImage.src = this.bossConfig.portrait;
        } else {
            this.portraitLoadFailed = true;
        }

        // Create dummy enemy for fallback rendering
        this.dummyEnemy = null;

        console.log(`[BossIntro] Showing transformation: ${this.bossConfig.name}`);
    }

    /**
     * Update for transformation mode (faster than intro)
     */
    updateTransformation(deltaTime) {
        if (!this.active || !this.isTransformation) return false;

        this.timer += deltaTime;
        this.glowPulse += deltaTime * 0.004; // Faster pulse

        // Fast fade in
        if (this.fadeIn < 1) {
            this.fadeIn = Math.min(1, this.fadeIn + deltaTime * 0.004);
        }

        if (this.phase === 'transform_in') {
            // Show transformation for 2.5 seconds then auto-skip to waiting
            if (this.timer > 2500) {
                this.phase = 'waiting';
            }
        } else if (this.phase === 'waiting') {
            // Auto-exit after 1 second in waiting
            if (this.timer > 3500) {
                this.phase = 'transform_out';
            }
        } else if (this.phase === 'transform_out') {
            this.fadeIn -= deltaTime * 0.005;
            if (this.fadeIn <= 0) {
                this.active = false;
                this.finished = true;
                this.isTransformation = false;
                if (this.onComplete) {
                    this.onComplete();
                }
                return true;
            }
        }

        return false;
    }

    /**
     * Draw transformation cinematic (centered, dramatic)
     */
    drawTransformation() {
        if (!this.active || !this.isTransformation) return;

        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.save();

        // Flash effect at start
        if (this.timer < 300) {
            const flashAlpha = 1 - (this.timer / 300);
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.8})`;
            ctx.fillRect(0, 0, w, h);
        }

        // Dark overlay
        const bgAlpha = this.phase === 'transform_out' ? 0.7 * this.fadeIn : 0.85 * this.fadeIn;
        ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
        ctx.fillRect(0, 0, w, h);

        // Radial glow from center
        const accentColor = this.bossConfig.color || '#0089D6';
        const glowGradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, h * 0.6);
        glowGradient.addColorStop(0, this.hexToRgba(accentColor, 0.3 * this.fadeIn));
        glowGradient.addColorStop(0.5, this.hexToRgba(accentColor, 0.1 * this.fadeIn));
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, w, h);

        // Portrait (centered)
        if (this.timer > 200) {
            this.renderTransformPortrait(ctx, w, h);
        }

        // Text overlay
        if (this.timer > 400) {
            this.renderTransformText(ctx, w, h);
        }

        // Scanlines
        this.renderGlobalScanlines(ctx, w, h);

        // Skip prompt
        if (this.phase === 'waiting') {
            this.renderTransformPrompt(ctx, w, h);
        }

        ctx.restore();
    }

    renderTransformPortrait(ctx, w, h) {
        const centerX = w / 2;
        const centerY = h * 0.4;
        const size = Math.min(w * 0.35, h * 0.4) * this.fadeIn;

        const accentColor = this.bossConfig.glowColor || this.bossConfig.color || '#0089D6';
        const glowIntensity = 0.7 + Math.sin(this.glowPulse) * 0.3;

        // Floating animation
        const floatY = centerY + Math.sin(this.glowPulse * 0.8) * 8;

        // Aura
        this.renderAura(ctx, centerX, floatY, size, accentColor, glowIntensity);

        // Portrait or fallback
        if (this.portraitLoaded && this.portraitImage) {
            this.renderHologramImage(ctx, centerX, floatY, size, accentColor);
        } else {
            this.renderFallbackInitials(ctx, centerX, floatY, size, accentColor);
        }
    }

    renderTransformText(ctx, w, h) {
        const centerX = w / 2;
        const textY = h * 0.7;
        const accentColor = this.bossConfig.color || '#0089D6';

        ctx.textAlign = 'center';

        // "TRANSFORMATION" header
        ctx.fillStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 20;
        ctx.font = 'bold 18px "Space Mono", monospace';
        ctx.fillText('— TRANSFORMATION —', centerX, textY - 60);
        ctx.shadowBlur = 0;

        // Boss name (large)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 25;

        if (this.bossConfig.name2) {
            ctx.font = '900 42px "Bebas Neue", monospace';
            ctx.fillText(this.bossConfig.name.toUpperCase(), centerX, textY - 20);
            ctx.fillText(this.bossConfig.name2.toUpperCase(), centerX, textY + 25);
        } else {
            ctx.font = '900 52px "Bebas Neue", monospace';
            ctx.fillText(this.bossConfig.name.toUpperCase(), centerX, textY);
        }
        ctx.shadowBlur = 0;

        // Subtitle
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 16px "Space Mono", monospace';
        ctx.fillText(this.bossConfig.subtitle || '', centerX, textY + 55);
    }

    renderTransformPrompt(ctx, w, h) {
        const pulseAlpha = (Math.sin(this.timer / 120) + 1) / 2;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + pulseAlpha * 0.5})`;
        ctx.font = '14px "Space Mono", monospace';
        ctx.fillText('[ ENTRÉE POUR CONTINUER ]', w / 2, h * 0.92);
        ctx.restore();
    }
}
