// PWA-иконки Rega Rega — знак-дырокол (оранжевый диск с выбитой смещённой дыркой) на тёмном фоне.
// Геометрия знака из брендбука (viewBox 100): диск центр (50,50) r=50; дырка центр (64,64) r=12.
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, '..', 'public', 'icons');
const INK = '#0A0908';
const ORANGE = '#FF5E1A';

function drawIcon(S, pad) {
  const c = createCanvas(S, S);
  const ctx = c.getContext('2d');
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, S, S);
  const scale = (S * (1 - 2 * pad)) / 100;
  const ox = S * pad, oy = S * pad;
  // оранжевый диск
  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.arc(ox + 50 * scale, oy + 50 * scale, 50 * scale, 0, Math.PI * 2);
  ctx.fill();
  // дырка цветом фона (смещена в правый-нижний угол)
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(ox + 64 * scale, oy + 64 * scale, 12 * scale, 0, Math.PI * 2);
  ctx.fill();
  return c.toBuffer('image/png');
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'icon-192.png'), drawIcon(192, 0.12));
writeFileSync(join(OUT, 'icon-512.png'), drawIcon(512, 0.12));
writeFileSync(join(OUT, 'icon-maskable-512.png'), drawIcon(512, 0.22));
writeFileSync(join(OUT, 'apple-touch-icon.png'), drawIcon(180, 0.12));
console.log('[gen-icons] 192 / 512 / maskable-512 / apple-touch — готово в public/icons/');
