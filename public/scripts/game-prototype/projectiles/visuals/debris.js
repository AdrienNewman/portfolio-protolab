// ============================================
// VISUAL: Debris
// Irregular rotating polygon
// ============================================

import { PORTFOLIO_COLORS } from '../../config/gameConfig.js';

/**
 * Draw debris projectile
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} projectile - Projectile instance
 */
export function drawDebris(ctx, projectile) {
    const size = projectile.size;
    const halfSize = size / 2;

    // Use pre-calculated points if available
    if (projectile.debrisPoints && projectile.debrisPoints.length > 0) {
        ctx.beginPath();
        for (let i = 0; i < projectile.debrisPoints.length; i++) {
            const point = projectile.debrisPoints[i];
            const radius = halfSize * point.radiusFactor;
            const px = Math.cos(point.angle) * radius;
            const py = Math.sin(point.angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    } else {
        // Fallback: simple pentagon
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i;
            const px = Math.cos(angle) * halfSize;
            const py = Math.sin(angle) * halfSize;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }

    // Outline
    ctx.strokeStyle = PORTFOLIO_COLORS.white;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
}
