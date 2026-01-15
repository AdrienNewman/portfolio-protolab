// ============================================
// VISUAL: Tank
// Square heavy enemy with corner accents
// ============================================

import { PORTFOLIO_COLORS } from '../../config/gameConfig.js';

/**
 * Draw tank-shaped enemy (square with accents)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} enemy - Enemy instance
 * @param {string} color - Display color
 */
export function drawTank(ctx, enemy, color) {
    const half = enemy.size / 2;

    // Main square
    ctx.fillStyle = color;
    ctx.fillRect(-half, -half, enemy.size, enemy.size);

    // Inner square (dark)
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
    const coreCount = Math.min(enemy.health, 5);
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
    ctx.shadowBlur = 0;
}
