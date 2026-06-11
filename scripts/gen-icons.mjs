// PWA-иконки Rega Rega — ОФИЦИАЛЬНЫЙ ФАВИКОННЫЙ ВЫРЕЗ из брендбука (rega-favicon-orange.svg):
// диск центр (50,50) r=50; дырка центр (62,62) r=16.5 (крупнее «знака», чтобы читалась в малом размере).
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, '..', 'public', 'icons');
// светлый вариант: знак-дырокол оранжевым на кремовом фоне (дырка = цвет фона)
const BG = '#FAF7F0';
const ORANGE = '#FF5E1A';

function drawIcon(S, pad) {
  const c = createCanvas(S, S);
  const ctx = c.getContext('2d');
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, S, S);
  const scale = (S * (1 - 2 * pad)) / 100;
  const ox = S * pad, oy = S * pad;
  // оранжевый диск
  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.arc(ox + 50 * scale, oy + 50 * scale, 50 * scale, 0, Math.PI * 2);
  ctx.fill();
  // дырка цветом фона — фавиконный вырез (62,62) r=16.5, смещена в правый-нижний угол
  ctx.fillStyle = BG;
  ctx.beginPath();
  ctx.arc(ox + 62 * scale, oy + 62 * scale, 16.5 * scale, 0, Math.PI * 2);
  ctx.fill();
  return c.toBuffer('image/png');
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'icon-192.png'), drawIcon(192, 0.12));
writeFileSync(join(OUT, 'icon-512.png'), drawIcon(512, 0.12));
writeFileSync(join(OUT, 'icon-maskable-512.png'), drawIcon(512, 0.22));
writeFileSync(join(OUT, 'apple-touch-icon.png'), drawIcon(180, 0.12));
console.log('[gen-icons] 192 / 512 / maskable-512 / apple-touch — готово в public/icons/');
