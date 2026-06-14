// PWA-иконки Rega Rega — ОФИЦИАЛЬНЫЙ APP-ICON ВЫРЕЗ из брендбука (раздел «app icon & avatar»):
// «Mark only — standalone, centred, with the standard cut». Диск центр (50,50) r=50;
// дырка СТАНДАРТНЫЙ вырез центр (64,64) r=12 (НЕ фавиконный 62,62/16.5 — тот только для крошечных вкладок).
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
  // дырка цветом фона — СТАНДАРТНЫЙ вырез app-icon (64,64) r=12, смещена в правый-нижний угол
  ctx.fillStyle = BG;
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
