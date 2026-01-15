// ============================================
// OSI RENDERER - 7-Layer Visual System
//
// Dessine le joueur comme 7 anneaux concentriques
// représentant les couches OSI du core (L1) au shell (L7).
//
// Chaque couche a un état visuel :
// - locked    : Sombre, pointillé
// - unlocked  : Couleur vive, glow pulsé
// - damaged   : Flicker rapide
// - destroyed : Non rendu (disparu)
//
// Performance : Gradients radiaux, pas de shadowBlur
// ============================================

import { CONFIG } from '../../config/gameConfig.js';
import { LAYER_STATES } from './OSIHealthSystem.js';

// ============================================
// COULEURS DISTINCTES PAR COUCHE
// Chaque layer a sa propre couleur unique
// ============================================
const LAYER_COLORS = {
    7: { color: '#ff0080', glow: 'rgba(255, 0, 128, 0.5)', name: 'APPLICATION' },   // Magenta vif
    6: { color: '#ff6600', glow: 'rgba(255, 102, 0, 0.5)', name: 'PRESENTATION' },  // Orange
    5: { color: '#00ff88', glow: 'rgba(0, 255, 136, 0.5)', name: 'SESSION' },       // Vert néon
    4: { color: '#00ffff', glow: 'rgba(0, 255, 255, 0.5)', name: 'TRANSPORT' },     // Cyan
    3: { color: '#0088ff', glow: 'rgba(0, 136, 255, 0.5)', name: 'NETWORK' },       // Bleu
    2: { color: '#aa00ff', glow: 'rgba(170, 0, 255, 0.5)', name: 'DATA LINK' },     // Violet
    1: { color: '#ffff00', glow: 'rgba(255, 255, 0, 0.5)', name: 'PHYSICAL' }       // Jaune (core)
};

export class OSIRenderer {
    constructor() {
        // Récupère les rayons depuis la config
        this.radii = CONFIG.PLAYER_OSI?.LAYER_RADII || {
            1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28
        };

        // Épaisseur des anneaux pour effet arc-en-ciel
        this.thickness = CONFIG.PLAYER_OSI?.LAYER_THICKNESS || 3;

        // Couleurs par couche (distinctes)
        this.layerColors = LAYER_COLORS;

        // Timings d'animation
        this.flickerSpeed = CONFIG.PLAYER_OSI?.FLICKER_SPEED || 150;
        this.unlockAnimDuration = CONFIG.PLAYER_OSI?.UNLOCK_ANIM_DURATION || 800;

        // État d'animation par couche
        this.animationState = {};
        for (let i = 1; i <= 7; i++) {
            this.animationState[i] = {
                flickerPhase: 0,
                unlockProgress: 0,      // 0-1 pour animation unlock
                destructionProgress: 0, // 0-1 pour animation destruction
                isUnlocking: false,
                isDestroying: false
            };
        }

        // Phase globale pour pulse synchronisé
        this.globalPulsePhase = 0;
    }

    // ============================================
    // MAIN DRAW METHOD
    // ============================================

    /**
     * Dessine toutes les couches OSI
     * ORDRE RÉSEAU : L7 au centre (données) → L1 à l'extérieur (physique)
     * Comme l'encapsulation d'un vrai paquet !
     */
    draw(ctx, x, y, layerStates, deltaTime) {
        ctx.save();

        // Update animations
        this.updateAnimations(deltaTime);

        // 1. Dessine le glow global (fond)
        this.drawGlobalGlow(ctx, x, y, layerStates);

        // 2. Dessine de l'extérieur vers l'intérieur pour le Z-order
        // (les couches internes doivent être dessinées par-dessus)
        // Ordre de dessin : L1 (externe) → L7 (centre)
        const drawOrder = [1, 2, 3, 4, 5, 6, 7]; // L1 d'abord (plus grand rayon)

        for (const i of drawOrder) {
            const state = layerStates[i];
            if (!state) continue;

            const anim = this.animationState[i];
            const radius = this.radii[i];

            // Switch selon l'état
            switch (state.state) {
                case LAYER_STATES.LOCKED:
                    this.drawLockedLayer(ctx, x, y, i, radius, state);
                    break;
                case LAYER_STATES.UNLOCKED:
                    this.drawUnlockedLayer(ctx, x, y, i, radius, state, anim);
                    break;
                case LAYER_STATES.DAMAGED:
                    this.drawDamagedLayer(ctx, x, y, i, radius, state, anim);
                    break;
                case LAYER_STATES.DESTROYED:
                    // Animation de destruction si en cours
                    if (anim.isDestroying) {
                        this.drawDestructionEffect(ctx, x, y, i, radius, state, anim);
                    }
                    // Sinon ne rien dessiner
                    break;
            }
        }

        // 3. Dessine le core indicator (petit point central)
        this.drawCoreIndicator(ctx, x, y, layerStates);

        ctx.restore();
    }

    // ============================================
    // LAYER RENDERING METHODS
    // ============================================

    /**
     * Couche verrouillée : anneau fantôme (très discret)
     */
    drawLockedLayer(ctx, x, y, layerNum, radius, state) {
        const innerRadius = radius - this.thickness;
        const outerRadius = radius;

        // Anneau très discret (fantôme de la future couche)
        ctx.beginPath();
        ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
        ctx.arc(x, y, Math.max(0, innerRadius), 0, Math.PI * 2, true);
        ctx.closePath();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fill();

        // Contour pointillé subtil
        ctx.beginPath();
        ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
    }

    /**
     * Couche débloquée : anneau épais coloré (effet arc-en-ciel)
     */
    drawUnlockedLayer(ctx, x, y, layerNum, radius, state, anim) {
        // Utilise les couleurs distinctes par layer
        const layerStyle = this.layerColors[layerNum];
        const color = layerStyle.color;
        const glow = layerStyle.glow;

        // Pulse effect (breathing)
        const pulse = 0.9 + Math.sin(this.globalPulsePhase + layerNum * 0.3) * 0.1;

        // Calcul des rayons intérieur/extérieur pour l'anneau épais
        const innerRadius = radius - this.thickness;
        const outerRadius = radius;

        // Glow externe subtil
        const glowGradient = ctx.createRadialGradient(x, y, outerRadius, x, y, outerRadius + 4);
        glowGradient.addColorStop(0, this.adjustAlpha(glow, 0.4 * pulse));
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, outerRadius + 4, 0, Math.PI * 2);
        ctx.fill();

        // Dessine l'anneau épais (arc rempli)
        ctx.beginPath();
        ctx.arc(x, y, outerRadius, 0, Math.PI * 2);        // Cercle extérieur
        ctx.arc(x, y, Math.max(0, innerRadius), 0, Math.PI * 2, true);  // Cercle intérieur (sens inverse)
        ctx.closePath();

        // Remplissage de l'anneau
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9 * pulse;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Contour lumineux externe
        ctx.beginPath();
        ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3 * pulse;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Animation unlock en cours
        if (anim.isUnlocking) {
            this.drawUnlockEffect(ctx, x, y, radius, color, anim.unlockProgress);
        }
    }

    /**
     * Couche endommagée : anneau épais avec flicker
     */
    drawDamagedLayer(ctx, x, y, layerNum, radius, state, anim) {
        // Utilise les couleurs distinctes par layer
        const layerStyle = this.layerColors[layerNum];
        const color = layerStyle.color;

        // Calcul du flicker (alternance visible/invisible)
        const flickerOn = Math.sin(anim.flickerPhase * 10) > -0.3;

        if (flickerOn) {
            // Calcul des rayons intérieur/extérieur
            const innerRadius = radius - this.thickness;
            const outerRadius = radius;

            // Dessine l'anneau épais avec teinte rouge
            ctx.beginPath();
            ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
            ctx.arc(x, y, Math.max(0, innerRadius), 0, Math.PI * 2, true);
            ctx.closePath();

            // Couleur mixée avec rouge pour indiquer les dégâts
            ctx.fillStyle = this.mixColor(color, '#ff0000', 0.4);
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Petits arcs de "fissure" pour feedback visuel
        this.drawCrackEffect(ctx, x, y, radius, anim.flickerPhase);
    }

    // ============================================
    // EFFECTS
    // ============================================

    /**
     * Glow global combiné - couleur du CORE (L7)
     */
    drawGlobalGlow(ctx, x, y, layerStates) {
        // Trouve la couche externe active (L1 est le plus externe maintenant)
        let outermostLayer = 1;
        for (let i = 1; i <= 7; i++) {
            const state = layerStates[i];
            if (state && (state.state === LAYER_STATES.UNLOCKED || state.state === LAYER_STATES.DAMAGED)) {
                outermostLayer = i;
                break;
            }
        }

        // Utilise la couleur de la couche externe pour le glow
        const glowColor = this.layerColors[outermostLayer].color;

        // Grand glow de fond basé sur la taille de la couche la plus externe unlocked
        const outerRadius = this.radii[outermostLayer] + 10;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, outerRadius);
        gradient.addColorStop(0, this.adjustAlpha(glowColor, 0.2));
        gradient.addColorStop(0.6, this.adjustAlpha(glowColor, 0.05));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(x - outerRadius, y - outerRadius, outerRadius * 2, outerRadius * 2);
    }

    /**
     * Point central = L7 (Application/données)
     * C'est le CORE du joueur
     */
    drawCoreIndicator(ctx, x, y, layerStates) {
        const coreState = layerStates[7]; // L7 est maintenant le core
        if (!coreState || coreState.state === LAYER_STATES.DESTROYED) {
            return; // Core détruit = mort
        }

        // Le core est L7 (magenta) - le centre des données
        const coreColor = this.layerColors[7].color;
        const coreGlow = this.layerColors[7].glow;
        const coreRadius = 3;
        const pulse = 0.85 + Math.sin(this.globalPulsePhase * 2) * 0.15;

        // Glow du core (magenta)
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, coreRadius + 3);
        gradient.addColorStop(0, this.adjustAlpha(coreGlow, 0.8 * pulse));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, coreRadius + 3, 0, Math.PI * 2);
        ctx.fill();

        // Point central coloré (magenta = données)
        ctx.fillStyle = coreColor;
        ctx.globalAlpha = pulse;
        ctx.beginPath();
        ctx.arc(x, y, coreRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Petit highlight blanc
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.6 * pulse;
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    /**
     * Effet d'unlock (cercle qui s'étend)
     */
    drawUnlockEffect(ctx, x, y, radius, color, progress) {
        // Réduit pour la nouvelle taille
        const expandRadius = radius + (10 * progress);
        const alpha = (1 - progress) * 0.8;

        ctx.beginPath();
        ctx.arc(x, y, expandRadius, 0, Math.PI * 2);
        ctx.strokeStyle = this.adjustAlpha(color, alpha);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * Effet de destruction (fragments qui s'éloignent)
     */
    drawDestructionEffect(ctx, x, y, layerNum, radius, state, anim) {
        const progress = anim.destructionProgress;
        // Utilise les couleurs distinctes
        const color = this.layerColors[layerNum].color;

        // 6 fragments qui s'éloignent (réduit)
        const fragmentCount = 6;
        for (let i = 0; i < fragmentCount; i++) {
            const angle = (i / fragmentCount) * Math.PI * 2;
            const distance = radius + (15 * progress);
            const fx = x + Math.cos(angle) * distance;
            const fy = y + Math.sin(angle) * distance;
            const alpha = (1 - progress) * 0.8;
            const size = 2 * (1 - progress * 0.5);

            ctx.fillStyle = this.adjustAlpha(color, alpha);
            ctx.beginPath();
            ctx.arc(fx, fy, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Petits arcs de fissure sur couche endommagée
     */
    drawCrackEffect(ctx, x, y, radius, phase) {
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
        ctx.lineWidth = 1;

        // 3 fissures à positions fixes
        const crackAngles = [0.3, 2.1, 4.5];
        for (const angle of crackAngles) {
            const startAngle = angle + Math.sin(phase) * 0.1;
            ctx.beginPath();
            ctx.arc(x, y, radius, startAngle, startAngle + 0.3);
            ctx.stroke();
        }
    }

    // ============================================
    // ANIMATION TRIGGERS
    // ============================================

    /**
     * Déclenche l'animation d'unlock pour une couche
     */
    triggerUnlockEffect(layerNumber) {
        this.animationState[layerNumber].isUnlocking = true;
        this.animationState[layerNumber].unlockProgress = 0;
    }

    /**
     * Déclenche l'animation de destruction pour une couche
     */
    triggerDestructionEffect(layerNumber) {
        this.animationState[layerNumber].isDestroying = true;
        this.animationState[layerNumber].destructionProgress = 0;
    }

    // ============================================
    // UPDATE
    // ============================================

    updateAnimations(deltaTime) {
        // Normalise deltaTime (assume ~16.67ms par frame)
        const dt = deltaTime / 16.67;

        // Pulse global
        this.globalPulsePhase += 0.05 * dt;

        // Update chaque couche
        for (let i = 1; i <= 7; i++) {
            const anim = this.animationState[i];

            // Flicker phase (tjs actif pour damaged)
            anim.flickerPhase += 0.1 * dt;

            // Unlock animation
            if (anim.isUnlocking) {
                anim.unlockProgress += (deltaTime / this.unlockAnimDuration);
                if (anim.unlockProgress >= 1) {
                    anim.isUnlocking = false;
                    anim.unlockProgress = 0;
                }
            }

            // Destruction animation
            if (anim.isDestroying) {
                anim.destructionProgress += (deltaTime / 500); // 500ms destruction
                if (anim.destructionProgress >= 1) {
                    anim.isDestroying = false;
                    anim.destructionProgress = 0;
                }
            }
        }
    }

    // ============================================
    // HELPERS
    // ============================================

    /**
     * Ajuste l'alpha d'une couleur rgba ou hex
     */
    adjustAlpha(color, alpha) {
        // Si c'est déjà rgba
        if (color.startsWith('rgba')) {
            return color.replace(/[\d.]+\)$/, `${alpha})`);
        }
        // Si c'est hex, convertit
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Mélange deux couleurs hex
     */
    mixColor(color1, color2, ratio) {
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
     * Reset complet des animations
     */
    reset() {
        for (let i = 1; i <= 7; i++) {
            this.animationState[i] = {
                flickerPhase: 0,
                unlockProgress: 0,
                destructionProgress: 0,
                isUnlocking: false,
                isDestroying: false
            };
        }
        this.globalPulsePhase = 0;
    }
}
