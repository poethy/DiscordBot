const { createCanvas } = require('@napi-rs/canvas');

const CW      = 72;   // card width
const CH      = 100;  // card height
const RADIUS  = 7;
const GAP     = 6;
const PAD     = 10;
const ROW_GAP = 14;
const LABEL_H = 18;

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h,     x, y + h - r,     r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y,         x + r, y,         r);
  ctx.closePath();
}

function drawCard(ctx, card, x, y) {
  const red = card.suit === '♥' || card.suit === '♦';

  // Drop shadow
  ctx.save();
  ctx.shadowColor   = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur    = 5;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#FFFFFF';
  roundedRect(ctx, x, y, CW, CH, RADIUS);
  ctx.fill();
  ctx.restore();

  // Border
  ctx.strokeStyle = '#CCCCCC';
  ctx.lineWidth   = 1;
  roundedRect(ctx, x, y, CW, CH, RADIUS);
  ctx.stroke();

  const color = red ? '#C41E3A' : '#1A1A2E';
  ctx.fillStyle = color;

  // Top-left value
  ctx.font      = 'bold 15px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(card.value, x + 5, y + 17);

  // Top-left suit (small)
  ctx.font = '12px Arial';
  ctx.fillText(card.suit, x + 5, y + 30);

  // Center suit (large)
  ctx.font      = '34px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(card.suit, x + CW / 2, y + CH / 2 + 12);

  // Bottom-right (rotated)
  ctx.save();
  ctx.translate(x + CW - 5, y + CH - 5);
  ctx.rotate(Math.PI);
  ctx.textAlign = 'left';
  ctx.fillStyle = color;
  ctx.font      = 'bold 15px Arial';
  ctx.fillText(card.value, 0, 13);
  ctx.font = '12px Arial';
  ctx.fillText(card.suit, 0, 26);
  ctx.restore();
}

function drawHiddenCard(ctx, x, y) {
  ctx.save();
  ctx.shadowColor   = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur    = 5;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#1E3A6E';
  roundedRect(ctx, x, y, CW, CH, RADIUS);
  ctx.fill();
  ctx.restore();

  // Diagonal stripe pattern
  ctx.save();
  roundedRect(ctx, x, y, CW, CH, RADIUS);
  ctx.clip();
  ctx.strokeStyle = '#2A4F96';
  ctx.lineWidth   = 6;
  for (let i = -CH; i < CW + CH; i += 14) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + CH, y + CH);
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = '#AAAACC';
  ctx.lineWidth   = 1;
  roundedRect(ctx, x, y, CW, CH, RADIUS);
  ctx.stroke();

  // "?" in center
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font      = 'bold 30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('?', x + CW / 2, y + CH / 2 + 10);
}

function drawLabel(ctx, text, x, y) {
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font      = 'bold 13px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(text, x, y);
}

/**
 * Renders a Blackjack game state as a PNG buffer.
 * Shows dealer hand on top (with optional hidden 2nd card) and player hand below.
 */
function renderBlackjack(playerCards, dealerCards, hideDealer = false) {
  const maxCards = Math.max(playerCards.length, dealerCards.length);
  const width    = PAD * 2 + maxCards * CW + (maxCards - 1) * GAP;
  const height   = PAD * 2 + LABEL_H * 2 + CH * 2 + ROW_GAP;

  const canvas = createCanvas(width, height);
  const ctx    = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#2B2D31';
  ctx.fillRect(0, 0, width, height);

  // Dealer row
  const dealerY = PAD + LABEL_H;
  drawLabel(ctx, 'DEALER', PAD, PAD + LABEL_H - 4);
  for (let i = 0; i < dealerCards.length; i++) {
    const x = PAD + i * (CW + GAP);
    if (hideDealer && i === 1) drawHiddenCard(ctx, x, dealerY);
    else drawCard(ctx, dealerCards[i], x, dealerY);
  }

  // Player row
  const playerY = PAD + LABEL_H + CH + ROW_GAP + LABEL_H;
  drawLabel(ctx, 'TU MANO', PAD, PAD + LABEL_H + CH + ROW_GAP + LABEL_H - 4);
  for (let i = 0; i < playerCards.length; i++) {
    drawCard(ctx, playerCards[i], PAD + i * (CW + GAP), playerY);
  }

  return canvas.toBuffer('image/png');
}

/**
 * Renders a single card (for Higher or Lower) as a PNG buffer.
 */
function renderCard(card) {
  const width  = PAD * 2 + CW;
  const height = PAD * 2 + CH;

  const canvas = createCanvas(width, height);
  const ctx    = canvas.getContext('2d');

  ctx.fillStyle = '#2B2D31';
  ctx.fillRect(0, 0, width, height);
  drawCard(ctx, card, PAD, PAD);

  return canvas.toBuffer('image/png');
}

module.exports = { renderBlackjack, renderCard };
