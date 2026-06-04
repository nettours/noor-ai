// Generates all PWA icons + screenshots referenced by public/manifest.json.
// Run: node scripts/generate-icons.mjs   (sharp renders SVG via librsvg)
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ICONS_DIR = join(ROOT, 'public', 'icons');
const SHOTS_DIR = join(ROOT, 'public', 'screenshots');

const GREEN_A = '#10B981';
const GREEN_B = '#047857';
const GOLD = '#FCD34D';

/** Brand glyph: a crescent (gold) + small star on a green gradient tile. */
function iconSvg(size, { maskable = false } = {}) {
  const r = maskable ? Math.round(size * 0.5) : Math.round(size * 0.22); // maskable = full bleed circle-safe
  const cx = size / 2;
  const cy = size / 2;
  const cr = size * (maskable ? 0.3 : 0.34); // crescent outer radius
  const cut = cr * 0.82;
  const cutDx = cr * 0.42;
  const star = size * 0.07;
  const sx = cx + cr * 0.55;
  const sy = cy - cr * 0.55;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${GREEN_A}"/>
      <stop offset="1" stop-color="${GREEN_B}"/>
    </linearGradient>
    <mask id="crescent">
      <rect width="${size}" height="${size}" fill="black"/>
      <circle cx="${cx}" cy="${cy}" r="${cr}" fill="white"/>
      <circle cx="${cx + cutDx}" cy="${cy - cr * 0.12}" r="${cut}" fill="black"/>
    </mask>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <circle cx="${cx}" cy="${cy}" r="${cr}" fill="${GOLD}" mask="url(#crescent)"/>
  <path d="M ${sx} ${sy - star} L ${sx + star * 0.31} ${sy + star * 0.4} L ${sx - star * 0.5} ${sy - star * 0.18} L ${sx + star * 0.5} ${sy - star * 0.18} L ${sx - star * 0.31} ${sy + star * 0.4} Z" fill="${GOLD}"/>
</svg>`;
}

/** Monochrome badge (white crescent on transparent) for notifications. */
function badgeSvg(size) {
  const cx = size / 2, cy = size / 2, cr = size * 0.38, cut = cr * 0.82, cutDx = cr * 0.42;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs><mask id="m"><rect width="${size}" height="${size}" fill="black"/>
    <circle cx="${cx}" cy="${cy}" r="${cr}" fill="white"/>
    <circle cx="${cx + cutDx}" cy="${cy - cr * 0.12}" r="${cut}" fill="black"/></mask></defs>
  <circle cx="${cx}" cy="${cy}" r="${cr}" fill="white" mask="url(#m)"/>
</svg>`;
}

function screenshotSvg(label) {
  const W = 390, H = 844;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0A1628"/><stop offset="1" stop-color="#030712"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <circle cx="${W / 2}" cy="300" r="120" fill="#10B98122"/>
  <g transform="translate(${W / 2 - 56}, 240)">${iconSvg(112).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>
  <text x="${W / 2}" y="430" text-anchor="middle" fill="#FAFAF9" font-family="Cairo, Tahoma, sans-serif" font-size="34" font-weight="700" direction="rtl">${label}</text>
  <text x="${W / 2}" y="470" text-anchor="middle" fill="#8B96A8" font-family="Cairo, Tahoma, sans-serif" font-size="18" direction="rtl">نور AI — رفيقك الإيماني</text>
</svg>`;
}

async function png(svg, size, outPath) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outPath);
  console.log('✓', outPath.replace(ROOT, '.'));
}

async function main() {
  await mkdir(ICONS_DIR, { recursive: true });
  await mkdir(SHOTS_DIR, { recursive: true });

  for (const s of [72, 96, 128, 144, 152, 192, 384, 512]) {
    await png(iconSvg(s), s, join(ICONS_DIR, `icon-${s}x${s}.png`));
  }
  // Maskable variants (Android adaptive)
  await png(iconSvg(192, { maskable: true }), 192, join(ICONS_DIR, 'icon-192x192-maskable.png'));
  await png(iconSvg(512, { maskable: true }), 512, join(ICONS_DIR, 'icon-512x512-maskable.png'));

  // Notification badge
  await png(badgeSvg(72), 72, join(ICONS_DIR, 'badge-72x72.png'));

  // Shortcut icons (reuse brand glyph)
  for (const name of ['quran', 'prayer', 'ai', 'azkar']) {
    await png(iconSvg(96), 96, join(ICONS_DIR, `shortcut-${name}.png`));
  }

  // Screenshots
  const shots = { home: 'الصفحة الرئيسية', quran: 'القرآن الكريم', ai: 'المساعد الإسلامي' };
  for (const [file, label] of Object.entries(shots)) {
    const out = join(SHOTS_DIR, `${file}.png`);
    await sharp(Buffer.from(screenshotSvg(label))).png().toFile(out);
    console.log('✓', out.replace(ROOT, '.'));
  }

  // Plain favicon.svg for browsers/metadata fallback
  await writeFile(join(ROOT, 'public', 'favicon.svg'), iconSvg(64));
  console.log('✓ ./public/favicon.svg');

  console.log('\nDone — all PWA assets generated.');
}

main().catch((e) => { console.error(e); process.exit(1); });
