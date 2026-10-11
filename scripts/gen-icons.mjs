/* تولید آیکن‌های PNG بدون وابستگی — سبز با حرف «ر» سفید.
   اجرا: node scripts/gen-icons.mjs */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "icons");
mkdirSync(OUT, { recursive: true });

/* ── نوشتن PNG (RGBA، فیلتر none) ── */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
function writePNG(path, size, pixels /* Uint8Array RGBA */) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    Buffer.from(pixels.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1);
  }
  writeFileSync(
    path,
    Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]),
  );
  console.log("✓", path);
}

/* ── رسم: مربع گرد سبز + حرف «ر» سفید (شبیه‌سازی با دایره و خط) ── */
const GREEN = [5, 150, 105, 255]; // #059669
const WHITE = [255, 255, 255, 255];

const inRoundedRect = (x, y, w, h, r) => {
  const cx = Math.min(Math.max(x, r), w - r);
  const cy = Math.min(Math.max(y, r), h - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
};

function render(size, { rounded = true, glyphScale = 1 } = {}) {
  const px = new Uint8Array(size * size * 4);
  const r = rounded ? size * 0.22 : 0;

  // «ر»: کمان + دُم — از دو شکل ساده ساخته می‌شود
  const g = glyphScale;
  const cx = size / 2;
  const cy = size / 2;
  // دایرهٔ باز (کمان «ر»)
  const arcR = size * 0.2 * g;
  const arcCx = cx + size * 0.02 * g;
  const arcCy = cy - size * 0.03 * g;
  const stroke = size * 0.075 * g;
  // دُمِ «ر»: مستطیل مورب پایین-چپ
  const tailX = cx - size * 0.19 * g;
  const tailY = cy + size * 0.02 * g;
  const tailW = size * 0.3 * g;
  const tailH = stroke;
  const tailAngle = 0.28; // رادیان

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const inside = rounded ? inRoundedRect(x + 0.5, y + 0.5, size, size, r) : true;
      let c = inside ? GREEN : [0, 0, 0, 0];
      if (inside) {
        // کمان «ر»: نیم‌دایرهٔ پایین‌رو
        const d = Math.hypot(x + 0.5 - arcCx, y + 0.5 - arcCy);
        const dy = y + 0.5 - arcCy;
        const inArcBand = Math.abs(d - arcR) <= stroke / 2 && dy > -arcR * 0.55;
        // دُم: چرخش نقاط به فضای مستطیل
        const dx = x + 0.5 - tailX;
        const dyT = y + 0.5 - tailY;
        const rx = dx * Math.cos(tailAngle) + dyT * Math.sin(tailAngle);
        const ry = -dx * Math.sin(tailAngle) + dyT * Math.cos(tailAngle);
        const inTail = rx >= 0 && rx <= tailW && Math.abs(ry) <= tailH / 2;
        if (inArcBand || inTail) c = WHITE;
      }
      px[i] = c[0];
      px[i + 1] = c[1];
      px[i + 2] = c[2];
      px[i + 3] = c[3];
    }
  }
  return px;
}

writePNG(join(OUT, "icon-192.png"), 192, render(192));
writePNG(join(OUT, "icon-512.png"), 512, render(512));
// maskable: بدون گوشهٔ گرد و گلیف کوچک‌تر ( safezone )
writePNG(join(OUT, "icon-maskable-512.png"), 512, render(512, { rounded: false, glyphScale: 0.72 }));
writePNG(join(OUT, "apple-touch-icon.png"), 180, render(180, { rounded: false, glyphScale: 0.9 }));
