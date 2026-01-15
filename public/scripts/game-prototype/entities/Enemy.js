// ============================================
// ENEMY CLASS - NetDefender
// OSI-themed cyber threats with boss support
// ============================================

import { OSI_COLORS, PORTFOLIO_COLORS, DEV_MODE } from '../config/gameConfig.js';
import { BossBehaviorController } from '../bosses/BossBehaviorController.js';
import { BOSS_BEHAVIORS } from '../bosses/index.js';

export class Enemy {
    constructor(config, layerLevel, x, y, canvasWidth, canvasHeight = 800) {
        this.x = x;
        this.y = y;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // From config
        this.type = config.type;
        this.name = config.name;
        this.maxHealth = config.health;
        this.health = config.health;
        this.baseSpeed = config.speed;
        this.speed = config.speed;
        this.points = config.points;
        this.behavior = config.behavior;
        this.size = config.size || 30;

        // Boss-specific properties
        this.isBoss = config.behavior === 'boss' || config.bossId !== undefined;
        this.bossId = config.bossId || null;
        this.bossController = null;

        // Initialize boss behavior controller if this is a boss
        if (this.isBoss && this.bossId && BOSS_BEHAVIORS[this.bossId]) {
            const bossConfig = BOSS_BEHAVIORS[this.bossId];
            this.bossController = new BossBehaviorController(bossConfig, canvasWidth, canvasHeight);
            // Override stats from boss config (avec DEV_MODE diviseur)
            const hpDivisor = DEV_MODE.enabled ? DEV_MODE.bossHPDivisor : 1;
            this.maxHealth = Math.ceil(bossConfig.health / hpDivisor);
            this.health = Math.ceil(bossConfig.health / hpDivisor);
            this.size = bossConfig.size;
            this.points = bossConfig.points;
            this.speed = bossConfig.speed;
            this.baseSpeed = bossConfig.speed;
            this.color = bossConfig.color;
            this.glowColor = bossConfig.glowColor;
            this.bossShape = bossConfig.shape;
        }

        // Layer styling (fallback if not boss)
        this.layerLevel = layerLevel;
        this.layerConfig = OSI_COLORS[layerLevel];
        if (!this.isBoss || !this.bossId) {
            this.color = this.layerConfig.color;
            this.glowColor = this.layerConfig.glow;
        }

        // Behavior state
        this.angle = Math.random() * Math.PI * 2;
        this.phaseVisible = true;
        this.phaseTimer = 0;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.teleportCooldown = 0;

        // Visual state
        this.rotation = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.damageFlash = 0;

        // Slow-mo effect from powerup
        this.slowMoMultiplier = 1;

        // Boss result storage (projectiles, hazards, etc.)
        this.bossUpdateResult = null;
    }

    update(deltaTime, player = null) {
        this.angle += 0.05;
        this.rotation += 0.02;
        this.pulsePhase += 0.1;

        if (this.damageFlash > 0) {
            this.damageFlash -= deltaTime;
        }

        // Boss behavior update
        if (this.bossController && player) {
            this.bossUpdateResult = this.bossController.update(deltaTime, this, player);
            this.bossController.cleanup();
            return;
        }

        const effectiveSpeed = this.speed * this.slowMoMultiplier;

        switch (this.behavior) {
            case 'zigzag':
                this.y += effectiveSpeed;
                this.x += Math.sin(this.angle * 3) * 3;
                break;

            case 'fast':
                this.y += effectiveSpeed * 1.2;
                break;

            case 'diagonal':
                this.y += effectiveSpeed;
                this.x += effectiveSpeed * 0.8 * this.direction;
                if (this.x < 50 || this.x > this.canvasWidth - 50) {
                    this.direction *= -1;
                }
                break;

            case 'boss':
                // Fallback for bosses without bossController
                this.y += effectiveSpeed * 0.6;
                this.x += Math.sin(this.angle * 0.5) * 2.5;
                break;

            case 'phase':
                this.y += effectiveSpeed;
                this.phaseTimer++;
                if (this.phaseTimer > 60) {
                    this.phaseVisible = !this.phaseVisible;
                    this.phaseTimer = 0;
                }
                break;

            case 'teleport':
                this.y += effectiveSpeed;
                this.teleportCooldown--;
                if (this.teleportCooldown <= 0 && Math.random() < 0.01) {
                    this.x = 80 + Math.random() * (this.canvasWidth - 160);
                    this.teleportCooldown = 60;
                }
                break;

            case 'swarm':
                this.y += effectiveSpeed;
                this.x += Math.sin(this.angle * 5 + this.waveOffset) * 2;
                break;

            case 'wave':
                this.y += effectiveSpeed * 0.8;
                this.x += Math.sin(this.angle * 2 + this.waveOffset) * 4;
                break;

            case 'erratic':
                this.y += effectiveSpeed;
                this.x += (Math.random() - 0.5) * 8;
                // Keep in bounds
                this.x = Math.max(50, Math.min(this.canvasWidth - 50, this.x));
                break;

            case 'slow_tank':
                this.y += effectiveSpeed * 0.7;
                break;

            case 'heavy':
                this.y += effectiveSpeed * 0.8;
                this.x += Math.sin(this.angle) * 1.5;
                break;

            default:
                this.y += effectiveSpeed;
        }
    }

    takeDamage(amount = 1) {
        // Boss shield handling
        if (this.bossController) {
            const actualDamage = this.bossController.takeDamage(amount);
            if (actualDamage > 0) {
                this.health -= actualDamage;
                this.damageFlash = 150;
            }
        } else {
            this.health -= amount;
            this.damageFlash = 150; // Flash duration in ms
        }
        return this.health <= 0;
    }

    draw(ctx) {
        // Phase enemies can be invisible
        if (!this.phaseVisible && this.behavior === 'phase') {
            // Draw faint outline when phased
            ctx.globalAlpha = 0.2;
            this.drawBody(ctx);
            ctx.globalAlpha = 1;
            return;
        }

        // Boss invisibility
        if (this.bossController && this.bossController.isInvisible()) {
            ctx.globalAlpha = this.bossController.getAlpha();
            this.drawBody(ctx);
            ctx.globalAlpha = 1;
            return;
        }

        // Effet glitch pendant téléportation (boss_explorer)
        if (this.bossController && this.bossController.isGlitching) {
            // Duplication décalée (effet VHS/lag)
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.translate(6, 0);
            this.drawBody(ctx);
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.translate(-6, 0);
            this.drawBody(ctx);
            ctx.restore();

            // Boss principal avec teinte rouge
            ctx.save();
            ctx.globalAlpha = 0.7;
            this.drawBody(ctx);
            ctx.restore();
            return;
        }

        this.drawBody(ctx);

        // Draw boss effects (shield, beams, etc.)
        if (this.bossController) {
            this.bossController.drawEffects(ctx, this);
            this.bossController.drawProjectiles(ctx);
        }
    }

    drawBody(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Damage flash effect
        const flashActive = this.damageFlash > 0 && Math.floor(this.damageFlash / 30) % 2 === 0;
        const displayColor = flashActive ? '#ffffff' : this.color;
        const displayGlow = flashActive ? 'rgba(255, 255, 255, 0.8)' : this.glowColor;

        // Pulsing glow - OPTIMISATION: shadowBlur uniquement pour les boss (coûteux)
        if (this.isBoss || this.behavior === 'boss') {
            const pulseIntensity = Math.sin(this.pulsePhase) * 3 + 8; // Réduit de 20-25 à 5-11
            ctx.shadowColor = displayGlow;
            ctx.shadowBlur = pulseIntensity;
        }

        // Draw based on enemy type or boss shape
        if (this.isBoss && this.bossShape) {
            this.drawBossShape(ctx, displayColor, this.bossShape);
        } else if (this.behavior === 'boss') {
            this.drawBoss(ctx, displayColor);
        } else if (this.behavior === 'slow_tank' || this.behavior === 'heavy') {
            this.drawTank(ctx, displayColor);
        } else if (this.behavior === 'swarm') {
            this.drawSwarm(ctx, displayColor);
        } else {
            this.drawStandard(ctx, displayColor);
        }

        // Reset rotation for text
        ctx.rotate(-this.rotation);

        // Draw health bar for multi-hit enemies
        if (this.maxHealth > 1) {
            this.drawHealthBar(ctx);
        }

        // Draw name label
        this.drawLabel(ctx);

        ctx.restore();
    }

    drawStandard(ctx, color) {
        // Diamond shape
        const half = this.size / 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -half);
        ctx.lineTo(half, 0);
        ctx.lineTo(0, half);
        ctx.lineTo(-half, 0);
        ctx.closePath();
        ctx.fill();

        // Inner dark core
        ctx.fillStyle = PORTFOLIO_COLORS.black;
        ctx.beginPath();
        const inner = half * 0.5;
        ctx.moveTo(0, -inner);
        ctx.lineTo(inner, 0);
        ctx.lineTo(0, inner);
        ctx.lineTo(-inner, 0);
        ctx.closePath();
        ctx.fill();

        // Center dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBoss(ctx, color) {
        // Hexagon boss shape
        const radius = this.size / 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const px = radius * Math.cos(angle);
            const py = radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Inner hexagon
        ctx.fillStyle = PORTFOLIO_COLORS.black;
        const innerRadius = radius * 0.6;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const px = innerRadius * Math.cos(angle);
            const py = innerRadius * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Glowing core - OPTIMISATION: réduit de 15 à 8
        ctx.fillStyle = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Corner accents
        ctx.fillStyle = color;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const px = (radius + 5) * Math.cos(angle);
            const py = (radius + 5) * Math.sin(angle);
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawTank(ctx, color) {
        // Square tank shape
        const half = this.size / 2;
        ctx.fillStyle = color;
        ctx.fillRect(-half, -half, this.size, this.size);

        // Inner square
        ctx.fillStyle = PORTFOLIO_COLORS.black;
        const innerHalf = half * 0.6;
        ctx.fillRect(-innerHalf, -innerHalf, innerHalf * 2, innerHalf * 2);

        // Corner accents
        ctx.fillStyle = color;
        const cornerSize = 8;
        ctx.fillRect(-half, -half, cornerSize, cornerSize);
        ctx.fillRect(half - cornerSize, -half, cornerSize, cornerSize);
        ctx.fillRect(-half, half - cornerSize, cornerSize, cornerSize);
        ctx.fillRect(half - cornerSize, half - cornerSize, cornerSize, cornerSize);

        // Health cores (visual indicator)
        const coreCount = Math.min(this.health, 5);
        const coreSpacing = 8;
        const startX = -((coreCount - 1) * coreSpacing) / 2;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        for (let i = 0; i < coreCount; i++) {
            ctx.beginPath();
            ctx.arc(startX + i * coreSpacing, 0, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawSwarm(ctx, color) {
        // Small triangle swarm unit
        const half = this.size / 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -half);
        ctx.lineTo(half * 0.7, half * 0.7);
        ctx.lineTo(-half * 0.7, half * 0.7);
        ctx.closePath();
        ctx.fill();
    }

    drawBossShape(ctx, color, shape) {
        const radius = this.size / 2;

        switch (shape) {
            case 'hexagon':
                this.drawBoss(ctx, color);
                break;

            case 'heart_broken':
                this.drawHeartBroken(ctx, color, radius);
                break;

            case 'circle_fangs':
                this.drawCircleFangs(ctx, color, radius);
                break;

            case 'ship':
                this.drawShip(ctx, color, radius);
                break;

            case 'mask':
                this.drawMask(ctx, color, radius);
                break;

            case 'table':
                this.drawTable(ctx, color, radius);
                break;

            case 'tower':
                this.drawTower(ctx, color, radius);
                break;

            case 'paperclip':
                this.drawClippe(ctx, radius);
                break;

            case 'explorer_logo':
                this.drawExplorer(ctx, color, radius);
                break;

            case 'messenger':
                this.drawMessenger(ctx, color, radius);
                break;

            case 'update_logo':
                this.drawUpdateLogo(ctx, color, radius);
                break;

            case 'norton_shield':
                this.drawNortonShield(ctx, color, radius);
                break;

            case 'hub_box':
                this.drawHubBox(ctx, color, radius);
                break;

            case 'gates_cyborg':
                this.drawGatesCyborg(ctx, color, radius);
                break;

            case 'azure_cloud':
                this.drawAzureCloud(ctx, color, radius);
                break;

            default:
                this.drawBoss(ctx, color);
        }
    }

    drawHeartBroken(ctx, color, radius) {
        // Broken heart shape for Heartbleed boss
        ctx.fillStyle = color;
        ctx.beginPath();
        // Left lobe
        ctx.arc(-radius * 0.35, -radius * 0.2, radius * 0.45, Math.PI, 0);
        // Right lobe
        ctx.arc(radius * 0.35, -radius * 0.2, radius * 0.45, Math.PI, 0);
        // Bottom point
        ctx.lineTo(0, radius * 0.8);
        ctx.closePath();
        ctx.fill();

        // Crack line
        ctx.strokeStyle = PORTFOLIO_COLORS.black;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.5);
        ctx.lineTo(-radius * 0.1, -radius * 0.2);
        ctx.lineTo(radius * 0.1, 0);
        ctx.lineTo(-radius * 0.05, radius * 0.3);
        ctx.lineTo(0, radius * 0.6);
        ctx.stroke();

        // Glowing core
        ctx.fillStyle = color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCircleFangs(ctx, color, radius) {
        // Cookie monster style for Session boss
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-radius * 0.35, -radius * 0.2, radius * 0.2, 0, Math.PI * 2);
        ctx.arc(radius * 0.35, -radius * 0.2, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = PORTFOLIO_COLORS.black;
        ctx.beginPath();
        ctx.arc(-radius * 0.35, -radius * 0.15, radius * 0.1, 0, Math.PI * 2);
        ctx.arc(radius * 0.35, -radius * 0.15, radius * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Mouth with fangs
        ctx.fillStyle = PORTFOLIO_COLORS.black;
        ctx.beginPath();
        ctx.arc(0, radius * 0.2, radius * 0.5, 0, Math.PI);
        ctx.fill();

        // Fangs
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-radius * 0.3, radius * 0.2);
        ctx.lineTo(-radius * 0.2, radius * 0.5);
        ctx.lineTo(-radius * 0.1, radius * 0.2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(radius * 0.1, radius * 0.2);
        ctx.lineTo(radius * 0.2, radius * 0.5);
        ctx.lineTo(radius * 0.3, radius * 0.2);
        ctx.fill();
    }

    drawShip(ctx, color, radius) {
        // Battleship shape for SYN Flood boss
        ctx.fillStyle = color;

        // Hull
        ctx.beginPath();
        ctx.moveTo(-radius, radius * 0.3);
        ctx.lineTo(-radius * 0.7, -radius * 0.5);
        ctx.lineTo(radius * 0.7, -radius * 0.5);
        ctx.lineTo(radius, radius * 0.3);
        ctx.lineTo(radius * 0.8, radius * 0.5);
        ctx.lineTo(-radius * 0.8, radius * 0.5);
        ctx.closePath();
        ctx.fill();

        // Bridge
        ctx.fillStyle = PORTFOLIO_COLORS.black;
        ctx.fillRect(-radius * 0.3, -radius * 0.3, radius * 0.6, radius * 0.4);

        // Cannons
        ctx.fillStyle = color;
        ctx.fillRect(-radius * 0.7, -radius * 0.2, radius * 0.15, radius * 0.4);
        ctx.fillRect(radius * 0.55, -radius * 0.2, radius * 0.15, radius * 0.4);

        // Core
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    drawMask(ctx, color, radius) {
        // Mask shape for IP Masquerader
        ctx.fillStyle = color;

        // Outer mask
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye holes
        ctx.fillStyle = PORTFOLIO_COLORS.black;
        ctx.beginPath();
        ctx.ellipse(-radius * 0.35, -radius * 0.1, radius * 0.2, radius * 0.15, -0.2, 0, Math.PI * 2);
        ctx.ellipse(radius * 0.35, -radius * 0.1, radius * 0.2, radius * 0.15, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Mysterious smile
        ctx.strokeStyle = PORTFOLIO_COLORS.black;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, radius * 0.1, radius * 0.4, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Question marks in eyes
        ctx.fillStyle = color;
        ctx.font = `bold ${radius * 0.25}px "Space Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('?', -radius * 0.35, -radius * 0.05);
        ctx.fillText('?', radius * 0.35, -radius * 0.05);
    }

    drawTable(ctx, color, radius) {
        // Database table shape for ARP Corruptor
        ctx.fillStyle = color;

        // Table top
        ctx.fillRect(-radius, -radius * 0.6, radius * 2, radius * 0.3);

        // Table legs/columns
        for (let i = 0; i < 4; i++) {
            const x = -radius * 0.75 + (i * radius * 0.5);
            ctx.fillRect(x, -radius * 0.3, radius * 0.15, radius);
        }

        // Corruption effect (glitched cells)
        ctx.fillStyle = PORTFOLIO_COLORS.black;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (Math.random() > 0.5) {
                    ctx.fillRect(
                        -radius * 0.6 + i * radius * 0.4,
                        -radius * 0.1 + j * radius * 0.25,
                        radius * 0.3,
                        radius * 0.2
                    );
                }
            }
        }

        // Glowing core
        ctx.fillStyle = color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, radius * 0.2, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawTower(ctx, color, radius) {
        // Tower shape for Cable Guardian (final boss)
        ctx.fillStyle = color;

        // Main tower body
        ctx.beginPath();
        ctx.moveTo(-radius * 0.4, radius);
        ctx.lineTo(-radius * 0.6, -radius * 0.3);
        ctx.lineTo(-radius * 0.3, -radius);
        ctx.lineTo(radius * 0.3, -radius);
        ctx.lineTo(radius * 0.6, -radius * 0.3);
        ctx.lineTo(radius * 0.4, radius);
        ctx.closePath();
        ctx.fill();

        // Inner structure
        ctx.fillStyle = PORTFOLIO_COLORS.black;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.25, radius * 0.7);
        ctx.lineTo(-radius * 0.4, -radius * 0.2);
        ctx.lineTo(-radius * 0.2, -radius * 0.7);
        ctx.lineTo(radius * 0.2, -radius * 0.7);
        ctx.lineTo(radius * 0.4, -radius * 0.2);
        ctx.lineTo(radius * 0.25, radius * 0.7);
        ctx.closePath();
        ctx.fill();

        // Antenna
        ctx.fillStyle = color;
        ctx.fillRect(-radius * 0.05, -radius * 1.2, radius * 0.1, radius * 0.3);

        // Power nodes
        ctx.shadowBlur = 15;
        const nodePositions = [
            { x: 0, y: -radius * 0.6 },
            { x: -radius * 0.25, y: 0 },
            { x: radius * 0.25, y: 0 },
            { x: 0, y: radius * 0.4 }
        ];
        nodePositions.forEach(pos => {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius * 0.12, 0, Math.PI * 2);
            ctx.fill();
        });

        // Cables extending outward
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.6, -radius * 0.3);
        ctx.lineTo(-radius * 1.1, -radius * 0.5);
        ctx.moveTo(radius * 0.6, -radius * 0.3);
        ctx.lineTo(radius * 1.1, -radius * 0.5);
        ctx.moveTo(-radius * 0.4, radius * 0.5);
        ctx.lineTo(-radius * 0.9, radius * 0.8);
        ctx.moveTo(radius * 0.4, radius * 0.5);
        ctx.lineTo(radius * 0.9, radius * 0.8);
        ctx.stroke();
    }

    drawClippe(ctx, size) {
        // CLIPP-E - Trombone maléfique (version optimisée)
        ctx.save();

        const eyeY = -size * 0.35;
        const eyeSpacing = size * 0.12;

        // === CORPS DU TROMBONE (sans shadowBlur pour performance) ===
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = size * 0.12;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.arc(0, -size * 0.35, size * 0.25, Math.PI, 0, false);
        ctx.lineTo(size * 0.25, size * 0.1);
        ctx.arc(0, size * 0.1, size * 0.25, 0, Math.PI, false);
        ctx.lineTo(-size * 0.25, -size * 0.15);
        ctx.arc(0, -size * 0.15, size * 0.15, Math.PI, 0, true);
        ctx.lineTo(size * 0.15, size * 0.0);
        ctx.stroke();

        // === YEUX ROUGES (un seul glow pour les deux) ===
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, size * 0.08, 0, Math.PI * 2);
        ctx.arc(eyeSpacing, eyeY, size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // === PUPILLES + REFLETS (sans shadow) ===
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, size * 0.04, 0, Math.PI * 2);
        ctx.arc(eyeSpacing, eyeY, size * 0.04, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-eyeSpacing - size * 0.02, eyeY - size * 0.02, size * 0.02, 0, Math.PI * 2);
        ctx.arc(eyeSpacing - size * 0.02, eyeY - size * 0.02, size * 0.02, 0, Math.PI * 2);
        ctx.fill();

        // === SOURCILS (combinés en un seul path) ===
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = size * 0.04;
        ctx.beginPath();
        ctx.moveTo(-eyeSpacing - size * 0.08, eyeY - size * 0.12);
        ctx.lineTo(-eyeSpacing + size * 0.04, eyeY - size * 0.16);
        ctx.moveTo(eyeSpacing + size * 0.08, eyeY - size * 0.12);
        ctx.lineTo(eyeSpacing - size * 0.04, eyeY - size * 0.16);
        ctx.stroke();

        ctx.restore();
    }

    drawExplorer(ctx, color, radius) {
        // Internet Diabolicus Ex-Plorer - Logo 'e' maléfique avec orbite et tentacules
        ctx.save();

        // === TENTACULES (câbles USB en couronne) ===
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = radius * 0.08;
        ctx.lineCap = 'round';

        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2 / 5) + this.rotation;
            const startX = Math.cos(angle) * radius * 0.6;
            const startY = Math.sin(angle) * radius * 0.6;
            const endX = Math.cos(angle) * radius * 1.3;
            const endY = Math.sin(angle) * radius * 1.3;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Connecteur au bout
            ctx.fillStyle = '#666666';
            ctx.beginPath();
            ctx.arc(endX, endY, radius * 0.1, 0, Math.PI * 2);
            ctx.fill();
        }

        // === ORBITE JAUNE (inclinée) ===
        ctx.strokeStyle = '#F2C811';
        ctx.lineWidth = radius * 0.06;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 0.9, radius * 0.35, this.rotation * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // === CORPS 'e' (dégradé bleu métallisé) ===
        const gradient = ctx.createLinearGradient(-radius * 0.5, -radius * 0.5, radius * 0.5, radius * 0.5);
        gradient.addColorStop(0, '#4169E1');
        gradient.addColorStop(1, '#000066');

        ctx.fillStyle = gradient;
        ctx.font = `bold ${radius * 1.4}px "Arial", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('e', 0, 0);

        // Contour blanc
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeText('e', 0, 0);

        // === OEIL ROUGE (style Sauron) ===
        ctx.fillStyle = '#FF0000';
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(radius * 0.05, -radius * 0.1, radius * 0.15, radius * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pupille noire
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(radius * 0.05, -radius * 0.1, radius * 0.05, radius * 0.03, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawMessenger(ctx, color, radius) {
        // MSN Messenger - Bonhomme vert avec yeux spirales et emoticons
        ctx.save();

        // === CORPS (bonhomme stylisé) ===
        ctx.fillStyle = color;

        // Tête ronde
        ctx.beginPath();
        ctx.arc(0, -radius * 0.3, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Corps trapézoïdal
        ctx.beginPath();
        ctx.moveTo(-radius * 0.4, radius * 0.1);
        ctx.lineTo(radius * 0.4, radius * 0.1);
        ctx.lineTo(radius * 0.35, radius * 0.7);
        ctx.lineTo(-radius * 0.35, radius * 0.7);
        ctx.closePath();
        ctx.fill();

        // === YEUX SPIRALES (hypnotiques) ===
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;

        // Oeil gauche
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            ctx.arc(-radius * 0.18, -radius * 0.35, radius * 0.08 + i * 3, 0, Math.PI * 1.5);
        }
        ctx.stroke();

        // Oeil droit
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            ctx.arc(radius * 0.18, -radius * 0.35, radius * 0.08 + i * 3, 0, Math.PI * 1.5);
        }
        ctx.stroke();

        // === SOURIRE FIGÉ ===
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, -radius * 0.15, radius * 0.2, 0, Math.PI);
        ctx.fill();

        // === EMOTICONS FLOTTANTS ===
        ctx.font = `${radius * 0.25}px Arial`;
        ctx.textAlign = 'center';
        const emojis = [':)', ';)', ':D', '<3'];
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI * 2 / 4) + this.rotation * 2;
            const ex = Math.cos(angle) * radius * 0.9;
            const ey = Math.sin(angle) * radius * 0.9;
            ctx.fillStyle = '#FFFF00';
            ctx.fillText(emojis[i], ex, ey);
        }

        ctx.restore();
    }

    drawUpdateLogo(ctx, color, radius) {
        // Windows Update - 4 carrés + barre de progression 99%
        ctx.save();

        // === LOGO 4 CARRÉS WINDOWS ===
        const gap = radius * 0.08;
        const squareSize = radius * 0.4;

        ctx.fillStyle = color;
        // Carré haut-gauche
        ctx.fillRect(-squareSize - gap/2, -squareSize - gap/2 - radius * 0.2, squareSize, squareSize);
        // Carré haut-droit
        ctx.fillRect(gap/2, -squareSize - gap/2 - radius * 0.2, squareSize, squareSize);
        // Carré bas-gauche
        ctx.fillRect(-squareSize - gap/2, gap/2 - radius * 0.2, squareSize, squareSize);
        // Carré bas-droit
        ctx.fillRect(gap/2, gap/2 - radius * 0.2, squareSize, squareSize);

        // === BARRE DE PROGRESSION 99% ===
        const barWidth = radius * 1.6;
        const barHeight = radius * 0.2;
        const barY = radius * 0.5;

        // Fond gris
        ctx.fillStyle = '#333333';
        ctx.fillRect(-barWidth/2, barY, barWidth, barHeight);

        // Progression cyan (99%)
        ctx.fillStyle = '#00BCF2';
        ctx.shadowColor = '#00BCF2';
        ctx.shadowBlur = 10;
        ctx.fillRect(-barWidth/2, barY, barWidth * 0.99, barHeight);

        // Texte 99%
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${radius * 0.18}px "Space Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('99%', 0, barY + barHeight + radius * 0.15);

        // === CERCLE DE CHARGEMENT ROTATIF ===
        ctx.strokeStyle = '#00BCF2';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, radius * 0.9, radius * 0.12, this.rotation * 3, this.rotation * 3 + Math.PI * 1.5);
        ctx.stroke();

        ctx.restore();
    }

    drawNortonShield(ctx, color, radius) {
        // Norton Antivirus - Bouclier jaune avec X rouge et scanners
        ctx.save();

        // === BOUCLIER (forme classique) ===
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.8);
        ctx.quadraticCurveTo(radius * 0.9, -radius * 0.6, radius * 0.8, 0);
        ctx.quadraticCurveTo(radius * 0.7, radius * 0.6, 0, radius * 0.9);
        ctx.quadraticCurveTo(-radius * 0.7, radius * 0.6, -radius * 0.8, 0);
        ctx.quadraticCurveTo(-radius * 0.9, -radius * 0.6, 0, -radius * 0.8);
        ctx.closePath();
        ctx.fill();

        // === BORDURE PLUS SOMBRE ===
        ctx.strokeStyle = '#CC9900';
        ctx.lineWidth = 3;
        ctx.stroke();

        // === X ROUGE (menace détectée) ===
        ctx.strokeStyle = '#FF0000';
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 10;
        ctx.lineWidth = radius * 0.12;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(-radius * 0.3, -radius * 0.3);
        ctx.lineTo(radius * 0.3, radius * 0.3);
        ctx.moveTo(radius * 0.3, -radius * 0.3);
        ctx.lineTo(-radius * 0.3, radius * 0.3);
        ctx.stroke();

        // === LIGNES DE SCAN (effet radar) ===
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 1;

        for (let i = 0; i < 3; i++) {
            const scanY = -radius * 0.5 + ((this.rotation * 50 + i * 50) % (radius * 1.4));
            ctx.beginPath();
            ctx.moveTo(-radius * 0.6, scanY);
            ctx.lineTo(radius * 0.6, scanY);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawHubBox(ctx, color, radius) {
        // Hub 10BASE-T - Boîtier gris avec 12 ports RJ45 et LEDs
        ctx.save();

        // === BOÎTIER PRINCIPAL ===
        ctx.fillStyle = color;
        ctx.fillRect(-radius, -radius * 0.5, radius * 2, radius);

        // === FAÇADE AVANT (plus sombre) ===
        ctx.fillStyle = '#888888';
        ctx.fillRect(-radius * 0.95, -radius * 0.45, radius * 1.9, radius * 0.9);

        // === PORTS RJ45 (12 ports, 2 rangées) ===
        ctx.fillStyle = '#222222';
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 6; col++) {
                const px = -radius * 0.75 + col * radius * 0.28;
                const py = -radius * 0.3 + row * radius * 0.35;
                ctx.fillRect(px, py, radius * 0.18, radius * 0.22);
            }
        }

        // === LEDs (clignotantes) ===
        for (let i = 0; i < 6; i++) {
            const ledX = -radius * 0.7 + i * radius * 0.28;
            const ledY = radius * 0.35;

            // LED verte ou orange (alternance)
            const isActive = Math.sin(this.rotation * 5 + i) > 0;
            ctx.fillStyle = isActive ? '#00FF00' : '#FF6600';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = isActive ? 8 : 4;
            ctx.beginPath();
            ctx.arc(ledX, ledY, radius * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }

        // === LABEL "10BASE-T" ===
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${radius * 0.12}px "Space Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('10BASE-T', 0, -radius * 0.35);

        ctx.restore();
    }

    drawGatesCyborg(ctx, color, radius) {
        // Bill Gates Phase 1 - Silhouette cyborg avec lunettes bleues
        ctx.save();

        // === TÊTE/VISAGE (silhouette) ===
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(0, -radius * 0.35, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // === LUNETTES BLEUES LUMINEUSES ===
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;

        // Verre gauche
        ctx.beginPath();
        ctx.roundRect(-radius * 0.35, -radius * 0.45, radius * 0.28, radius * 0.18, 3);
        ctx.fill();

        // Verre droit
        ctx.beginPath();
        ctx.roundRect(radius * 0.07, -radius * 0.45, radius * 0.28, radius * 0.18, 3);
        ctx.fill();

        // Pont des lunettes
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.07, -radius * 0.36);
        ctx.lineTo(radius * 0.07, -radius * 0.36);
        ctx.stroke();

        // === CORPS CYBORG (armure serveurs) ===
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.moveTo(-radius * 0.5, radius * 0.05);
        ctx.lineTo(radius * 0.5, radius * 0.05);
        ctx.lineTo(radius * 0.6, radius * 0.8);
        ctx.lineTo(-radius * 0.6, radius * 0.8);
        ctx.closePath();
        ctx.fill();

        // === CIRCUITS LUMINEUX (sur l'armure) ===
        ctx.strokeStyle = '#FFD700';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2;

        // Lignes de circuit
        ctx.beginPath();
        ctx.moveTo(-radius * 0.3, radius * 0.2);
        ctx.lineTo(-radius * 0.3, radius * 0.5);
        ctx.lineTo(0, radius * 0.5);
        ctx.lineTo(0, radius * 0.7);
        ctx.moveTo(radius * 0.3, radius * 0.2);
        ctx.lineTo(radius * 0.3, radius * 0.4);
        ctx.lineTo(radius * 0.1, radius * 0.4);
        ctx.stroke();

        // === LOGO WINDOWS (sur le torse) ===
        ctx.shadowBlur = 0;
        const logoSize = radius * 0.12;
        const logoY = radius * 0.25;
        ctx.fillStyle = color;
        ctx.fillRect(-logoSize - 1, logoY - logoSize - 1, logoSize, logoSize);
        ctx.fillRect(1, logoY - logoSize - 1, logoSize, logoSize);
        ctx.fillRect(-logoSize - 1, logoY + 1, logoSize, logoSize);
        ctx.fillRect(1, logoY + 1, logoSize, logoSize);

        ctx.restore();
    }

    drawAzureCloud(ctx, color, radius) {
        // Azure Cloud - Nuage bleu avec tentacules de données
        ctx.save();

        // === TENTACULES (flux de données) ===
        ctx.strokeStyle = '#50E6FF';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2 / 6) + Math.PI / 2;
            const startX = Math.cos(angle) * radius * 0.5;
            const startY = Math.sin(angle) * radius * 0.4;

            ctx.beginPath();
            ctx.moveTo(startX, startY);

            // Tentacule ondulant
            for (let j = 1; j <= 3; j++) {
                const wave = Math.sin(this.rotation * 3 + i + j) * 10;
                const tx = startX + Math.cos(angle) * j * radius * 0.3;
                const ty = startY + Math.sin(angle) * j * radius * 0.3 + wave;
                ctx.lineTo(tx, ty);
            }
            ctx.stroke();

            // Point lumineux au bout
            ctx.fillStyle = '#50E6FF';
            ctx.shadowColor = '#50E6FF';
            ctx.shadowBlur = 8;
            const endX = startX + Math.cos(angle) * radius * 0.9;
            const endY = startY + Math.sin(angle) * radius * 0.9;
            ctx.beginPath();
            ctx.arc(endX, endY, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // === NUAGE PRINCIPAL ===
        ctx.shadowBlur = 0;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;

        // Forme de nuage (cercles combinés)
        ctx.beginPath();
        ctx.arc(-radius * 0.25, 0, radius * 0.4, 0, Math.PI * 2);
        ctx.arc(radius * 0.2, -radius * 0.1, radius * 0.35, 0, Math.PI * 2);
        ctx.arc(radius * 0.35, radius * 0.15, radius * 0.25, 0, Math.PI * 2);
        ctx.arc(-radius * 0.35, radius * 0.1, radius * 0.28, 0, Math.PI * 2);
        ctx.arc(0, radius * 0.2, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // === SYMBOLE AZURE (au centre) ===
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${radius * 0.35}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('A', 0, 0);

        // === DATACENTERS (icônes serveurs) ===
        ctx.fillStyle = '#FFFFFF';
        const dcPositions = [
            { x: -radius * 0.5, y: -radius * 0.3 },
            { x: radius * 0.5, y: -radius * 0.2 },
            { x: 0, y: radius * 0.35 }
        ];

        dcPositions.forEach(pos => {
            ctx.fillRect(pos.x - 4, pos.y - 6, 8, 12);
            // Lignes de serveur
            ctx.fillStyle = color;
            ctx.fillRect(pos.x - 2, pos.y - 4, 4, 2);
            ctx.fillRect(pos.x - 2, pos.y, 4, 2);
            ctx.fillStyle = '#FFFFFF';
        });

        ctx.restore();
    }

    drawHealthBar(ctx) {
        const barWidth = this.size + 10;
        const barHeight = 4;
        const barY = this.size / 2 + 8;

        // Background
        ctx.fillStyle = PORTFOLIO_COLORS.grayMid;
        ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

        // Health fill
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 5;
        ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);
    }

    drawLabel(ctx) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 9px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.name.substring(0, 14), 0, this.size / 2 + 22);
    }

    getBounds() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }

    isOffScreen(canvasHeight) {
        return this.y > canvasHeight + this.size;
    }

    isCollidable() {
        // Phase enemies are not collidable when invisible
        if (this.behavior === 'phase' && !this.phaseVisible) {
            return false;
        }
        // Boss invisibility
        if (this.bossController && this.bossController.isInvisible()) {
            return false;
        }
        return true;
    }

    /**
     * Get boss projectiles for collision detection
     * @returns {Array} Array of projectile objects
     */
    getBossProjectiles() {
        if (!this.bossController) return [];
        return this.bossController.getProjectiles();
    }

    /**
     * Get boss hazards for collision detection
     * @returns {Array} Array of hazard objects
     */
    getBossHazards() {
        if (!this.bossController) return [];
        return this.bossController.getHazards();
    }

    /**
     * Get boss active attacks (beams, rings) for collision detection
     * @returns {Array} Array of attack objects
     */
    getBossActiveAttacks() {
        if (!this.bossController) return [];
        return this.bossController.getActiveAttacks();
    }

    /**
     * Get the latest boss update result
     * @returns {object|null} Result containing projectiles, hazards, screen effects, etc.
     */
    getBossUpdateResult() {
        return this.bossUpdateResult;
    }

    /**
     * Clear the boss update result after processing
     */
    clearBossUpdateResult() {
        this.bossUpdateResult = null;
    }

    /**
     * Check if this is a boss enemy
     * @returns {boolean}
     */
    isBossEnemy() {
        return this.isBoss;
    }

    /**
     * Get the boss name for display
     * @returns {string}
     */
    getBossName() {
        if (this.bossController && this.bossController.config) {
            return this.bossController.config.name;
        }
        return this.name;
    }

    /**
     * Get the boss subtitle for display
     * @returns {string}
     */
    getBossSubtitle() {
        if (this.bossController && this.bossController.config) {
            return this.bossController.config.subtitle;
        }
        return '';
    }

    /**
     * Check if boss is in enraged state
     * @returns {boolean}
     */
    isBossEnraged() {
        return this.bossController ? this.bossController.enraged : false;
    }
}
