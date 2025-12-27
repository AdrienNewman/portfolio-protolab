// ============================================
// GRID BACKGROUND - NetDefender
// Portfolio-style animated grid
// ============================================

import { CONFIG, PORTFOLIO_COLORS, OSI_COLORS } from '../config/gameConfig.js';

export class GridBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.gridSize = CONFIG.GRID_SIZE;
        this.baseOpacity = 0.03;
        this.currentColor = PORTFOLIO_COLORS.neonCyan;
        this.targetColor = PORTFOLIO_COLORS.neonCyan;

        // Animation
        this.scrollOffset = 0;
        this.scrollSpeed = 0.3;
        this.pulsePhase = 0;

        // Glow points (random accent glows)
        this.glowPoints = this.generateGlowPoints();
    }

    generateGlowPoints() {
        const points = [];
        const count = 5;

        for (let i = 0; i < count; i++) {
            points.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 100 + Math.random() * 150,
                phase: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.02
            });
        }

        return points;
    }

    setLayerColor(layerLevel) {
        const layerConfig = OSI_COLORS[layerLevel];
        if (layerConfig) {
            this.targetColor = layerConfig.color;
        }
    }

    update() {
        // Scroll effect
        this.scrollOffset += this.scrollSpeed;
        if (this.scrollOffset >= this.gridSize) {
            this.scrollOffset = 0;
        }

        // Pulse effect
        this.pulsePhase += 0.02;

        // Update glow points
        this.glowPoints.forEach(point => {
            point.phase += point.speed;
        });

        // Color transition
        // (In a full implementation, this would lerp between colors)
        this.currentColor = this.targetColor;
    }

    draw(ctx) {
        // Draw radial glow accents
        this.drawGlowAccents(ctx);

        // Draw grid lines
        this.drawGrid(ctx);

        // Draw scanlines effect
        this.drawScanlines(ctx);
    }

    drawGrid(ctx) {
        const pulseIntensity = Math.sin(this.pulsePhase) * 0.01 + this.baseOpacity;

        // Extract RGB from hex color
        const rgb = this.hexToRgb(this.currentColor);
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${pulseIntensity})`;
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }

        // Horizontal lines (with scroll offset for movement effect)
        for (let y = -this.gridSize + this.scrollOffset; y <= this.canvas.height; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }

    drawGlowAccents(ctx) {
        this.glowPoints.forEach(point => {
            const intensity = (Math.sin(point.phase) + 1) / 2 * 0.08;
            const rgb = this.hexToRgb(this.currentColor);

            const gradient = ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, point.radius
            );
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity})`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.fillRect(
                point.x - point.radius,
                point.y - point.radius,
                point.radius * 2,
                point.radius * 2
            );
        });
    }

    drawScanlines(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';

        for (let y = 0; y < this.canvas.height; y += 4) {
            ctx.fillRect(0, y, this.canvas.width, 2);
        }
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 255, b: 255 };
    }

    resize() {
        this.glowPoints = this.generateGlowPoints();
    }
}
