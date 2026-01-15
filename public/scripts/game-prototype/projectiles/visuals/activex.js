// ============================================
// VISUAL: ActiveX
// Hexagon component style
// ============================================

/**
 * Draw ActiveX component projectile
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} projectile - Projectile instance
 */
export function drawActivex(ctx, projectile) {
    const size = projectile.size;
    const halfSize = size / 2;

    // Hexagon shape
    ctx.fillStyle = '#1E90FF';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const x = Math.cos(angle) * halfSize;
        const y = Math.sin(angle) * halfSize;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // "AX" label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.35}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AX', 0, 0);

    // Danger border
    ctx.strokeStyle = '#FF4444';
    ctx.lineWidth = 2;
    ctx.stroke();
}
