// Kopierar de filer Capacitor faktiskt buntar in i appen från repo-roten till
// `www/` (Capacitors `webDir`). index.html i repo-roten förblir SANNINGEN
// (samma princip som `src/*.js speglar index.html`, se CODEMAP.md) — den här
// filen är bara en spegling, aldrig en källa att redigera direkt.
// Körs: `npm run cap:sync` (kör sedan `npx cap copy android` för att pusha
// www/ vidare in i det native Android-projektet).
import { copyFileSync, existsSync, mkdirSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const WWW = join(ROOT, 'www');

if (!existsSync(WWW)) mkdirSync(WWW, { recursive: true });

const FILES = ['index.html', 'sw.js', 'manifest.webmanifest'];
for (const f of FILES) {
  const src = join(ROOT, f);
  if (existsSync(src)) {
    copyFileSync(src, join(WWW, f));
    console.log(`kopierad: ${f}`);
  } else {
    console.log(`hoppar över (finns inte än): ${f}`);
  }
}

const iconsDir = join(ROOT, 'icons');
if (existsSync(iconsDir)) {
  cpSync(iconsDir, join(WWW, 'icons'), { recursive: true });
  console.log('kopierad: icons/');
} else {
  console.log('hoppar över (finns inte än): icons/');
}
