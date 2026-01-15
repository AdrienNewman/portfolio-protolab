// ============================================
// VISUAL: Standard
// Diamond shape enemy
// ============================================

import { PORTFOLIO_COLORS } from '../../config/gameConfig.js';

/**
 * Draw standard diamond-shaped enemy
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} enemy - Enemy instance
 * @param {string} color - Display color
 */
export function drawStandard(ctx, enemy, color) {
    const half = enemy.size / 2;

    // Outer diamond
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
