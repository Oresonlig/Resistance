#!/usr/bin/env node
/**
 * check_themes.js — mekanisk granskning av tema-CSS:en i index.html
 *
 * Bakgrund: tema-riktlinjerna finns (CLAUDE.md §5 + feedback_teman_arkitektur),
 * men de är prosa som ska tillämpas ur minnet i det ögonblick man skriver 150
 * rader CSS. Samma buggklasser återkommer därför gång på gång. Det här skriptet
 * flyttar de mekaniskt kontrollerbara delarna från minne till kod.
 *
 * Fem checkar, i fallande träffsäkerhet:
 *
 *  0. KOMMENTARSBALANS (error)
 *     Ett "*​/" utan öppnande "/*" betyder att en kommentar stängts tidigare än
 *     avsett — prosan därefter blir LEVANDE CSS, webbläsaren läser den som en
 *     selektor och kastar tyst hela nästa regel. Buggen fanns i 3.82.0 och
 *     upptäcktes först i 3.84.1: Full Moons done-regel för chain-tab hade
 *     aldrig körts i en browser, och fyra försök att "fixa vilodagsgrafiken"
 *     justerade färger i en regel ingen läste. Checken körs FÖRE
 *     kommentarsstrippningen — regexen i stripComments döljer felet annars.
 *
 *  1. CHAIN-TAB REST-DAY-ASYMMETRI (error)
 *     Om ETT temas samtliga regler för ett tillstånd bär `:not(.rest-day)` får
 *     vilodagsbrickan ingen tema-behandling alls i det tillståndet och ärver
 *     bas-CSS:en. Exakt buggen i 3.81.1 (fixad i 3.81.2) — den uppstår för att
 *     vilodagens guld är låst med !important, så reflexen blir att scopa bort
 *     hela vilodagen istället för bara färgen.
 *
 *  2. VARIANT-PARITET (warn)
 *     Två syskonvarianter av samma komponent i samma tema (t.ex. mörkt kort
 *     kollapsat vs expanderat) ska styla ungefär samma barn. Stor skillnad =
 *     någon variant är halvgjord. Exakt buggen i 3.82.0 punkt 1: 16 färgregler
 *     i ena varianten, 3 i den andra.
 *
 *  3. BLANDAD POLARITET (warn)
 *     Ett tema som har LJUSA surface-tokens men samtidigt egna MÖRKA
 *     komponentbakgrunder får bas-CSS:ens `background:var(--surface-X)` målad
 *     ljus ovanpå sina mörka ytor. Exakt buggen i 3.82.0 punkt 2.
 *
 *  4. KONTRAST I SAMMA REGEL (warn)
 *     color + background i samma block med ratio under 3:1.
 *
 * Körning:  node check_themes.js [--verbose]
 * Exit 1 vid error, 0 annars.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// Valfri fil-arg så checken kan köras mot en äldre revision
// (`git show <sha>:index.html > tmp.html`) för att verifiera att den faktiskt
// fångar en känd bugg — en check som aldrig testats mot ett rött fall är bara
// en check som säger "grönt".
const FILE = process.argv.slice(2).find((a) => a.endsWith('.html')) || path.join(HERE, 'index.html');
const VERBOSE = process.argv.includes('--verbose');

// ── CSS-extraktion ────────────────────────────────────────────────
function extractStyles(html) {
  const out = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out.join('\n');
}

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * CHECK 0 — kommentarsbalans. Körs mot RÅ html (före stripComments) och
 * rapporterar radnummer i index.html, inte i det extraherade CSS-blocket.
 * Citattecken spåras så att ett "*​/" inuti en sträng eller data-URI inte larmar.
 */
function checkCommentBalance(html) {
  const out = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(html))) {
    const body = m[1];
    const bodyStart = m.index + m[0].indexOf(body);
    let line = html.slice(0, bodyStart).split('\n').length;
    let inC = false, openLine = 0, quote = '';
    for (let i = 0; i < body.length; i++) {
      const ch = body[i];
      if (ch === '\n') { line++; continue; }
      const two = ch + (body[i + 1] || '');
      if (inC) {
        if (two === '*/') { inC = false; i++; }
        continue;
      }
      if (quote) {
        if (ch === '\\') { i++; continue; }
        if (ch === quote) quote = '';
        continue;
      }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (two === '/*') { inC = true; openLine = line; i++; continue; }
      if (two === '*/') {
        out.push(
          `[kommentar] rad ${line}: "*/" utan öppnande "/*".\n` +
          `             En kommentar har stängts tidigare än avsett. Texten däremellan är\n` +
          `             LEVANDE CSS — webbläsaren läser den som en selektor och kastar tyst\n` +
          `             hela regeln som följer. Buggen syns inte i appen, den syns som att\n` +
          `             "fixen inte tog". Se 3.84.1.`
        );
        i++;
      }
    }
    if (inC) {
      out.push(`[kommentar] rad ${openLine}: "/*" stängs aldrig — resten av <style> är utkommenterad.`);
    }
  }
  return out;
}

/**
 * Platt regel-lista. CSS i den här kodbasen nästlar inte utöver at-rules,
 * så en enkel brace-stack räcker. Regler inuti @keyframes plockas bort —
 * `0%`/`to` är inte selektorer i den mening checkarna bryr sig om.
 */
function parseRules(css) {
  const out = [];
  const stack = [];
  let buf = '';
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') {
      stack.push({ at: buf.trim().startsWith('@'), sel: buf.trim() });
      buf = '';
      continue;
    }
    if (ch === '}') {
      const top = stack.pop();
      if (top && !top.at) {
        const inKeyframes = stack.some((s) => s.at && /^@(-\w+-)?keyframes/i.test(s.sel));
        if (!inKeyframes) {
          out.push({
            sel: top.sel,
            decls: parseDecls(buf),
            media: stack.filter((s) => s.at).map((s) => s.sel),
          });
        }
      }
      buf = '';
      continue;
    }
    buf += ch;
  }
  return out;
}

function parseDecls(body) {
  const parts = [];
  let depth = 0, buf = '';
  for (const ch of body) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ';' && depth === 0) { parts.push(buf); buf = ''; continue; }
    buf += ch;
  }
  parts.push(buf);
  const out = [];
  for (const p of parts) {
    const s = p.trim();
    if (!s) continue;
    const i = s.indexOf(':');
    if (i < 0) continue;
    out.push({
      prop: s.slice(0, i).trim().toLowerCase(),
      value: s.slice(i + 1).replace(/!important\s*$/i, '').trim(),
      important: /!important\s*$/i.test(s),
    });
  }
  return out;
}

/** Split på toppnivå-kommatecken (respekterar :not(...), color-mix(...) osv). */
function splitTop(str, sep) {
  const out = [];
  let depth = 0, buf = '';
  for (const ch of str) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === sep && depth === 0) { out.push(buf.trim()); buf = ''; continue; }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

/** Dela en selektor i compounds (whitespace + kombinatorer, parens-medvetet). */
function compounds(sel) {
  const out = [];
  let depth = 0, buf = '';
  for (const ch of sel) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (depth === 0 && (ch === ' ' || ch === '>' || ch === '+' || ch === '~')) {
      if (buf.trim()) out.push(buf.trim());
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

/** Klasser i en compound, uppdelat på krävda och negerade (:not(.x)). */
function classesOf(compound) {
  const negated = new Set();
  const notRe = /:not\(([^)]*)\)/g;
  let m;
  while ((m = notRe.exec(compound))) {
    for (const c of m[1].matchAll(/\.([\w-]+)/g)) negated.add(c[1]);
  }
  const bare = compound.replace(/:not\([^)]*\)/g, '');
  const required = new Set();
  for (const c of bare.matchAll(/\.([\w-]+)/g)) required.add(c[1]);
  return { required, negated };
}

// ── färg ──────────────────────────────────────────────────────────
function parseColor(v) {
  if (!v) return null;
  const s = v.trim();
  let m = /^#([0-9a-f]{3,8})$/i.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }
  m = /^rgba?\(([^)]+)\)$/i.exec(s);
  if (m) {
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (p.length < 3 || p.slice(0, 3).some(Number.isNaN)) return null;
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 && !Number.isNaN(p[3]) ? p[3] : 1 };
  }
  return null; // color-mix / namngivna / var() hanteras av anroparen
}

/** Första färgen i ett värde (klarar gradients). */
function firstColor(value) {
  if (!value) return null;
  const direct = parseColor(value);
  if (direct) return direct;
  const m = value.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/i);
  return m ? parseColor(m[0]) : null;
}

function luminance(c) {
  const f = (v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// ── tema-uppdelning ───────────────────────────────────────────────
function themeOf(sel) {
  const m = /body\.theme-([\w-]+)/.exec(sel);
  return m ? m[1] : null;
}

/** Selektorn utan sitt ledande body.theme-X-ankare. */
function stripThemeAnchor(sel) {
  return sel.replace(/^\s*body\.theme-[\w-]+\s*/, '').trim();
}

// ── main ──────────────────────────────────────────────────────────
const html = fs.readFileSync(FILE, 'utf8');
const css = stripComments(extractStyles(html));
const rules = parseRules(css);

// Ett selektor-fragment per rad (kommaseparerade selektorer expanderas).
const flat = [];
for (const r of rules) {
  for (const sel of splitTop(r.sel, ',')) {
    flat.push({ sel, decls: r.decls, media: r.media });
  }
}

// Temalista ur THEMES-arrayen (id + cat), så rapporten kan säga "ljust tema".
const themeMeta = new Map();
{
  const block = /const THEMES = \[([\s\S]*?)\n\];/.exec(html);
  if (block) {
    for (const m of block[1].matchAll(/\{id:\s*'([\w-]+)'[^}]*?cat:\s*'(\w+)'[^}]*?class:\s*'([^']*)'/g)) {
      themeMeta.set(m[1], { cat: m[2], cls: m[3] });
    }
  }
}
/** class:'theme-fullmoon' → nyckeln som används i selektorerna. */
const clsToId = new Map();
for (const [id, meta] of themeMeta) {
  if (meta.cls) clsToId.set(meta.cls.replace(/^theme-/, ''), id);
}
const metaFor = (key) => themeMeta.get(clsToId.get(key) ?? key) ?? null;

const errors = [];
const warns = [];
const info = [];

// ══════════════════════════════════════════════════════════════════
// CHECK 0 — kommentarsbalans (mot rå html, före stripComments)
// ══════════════════════════════════════════════════════════════════
errors.push(...checkCommentBalance(html));

// ══════════════════════════════════════════════════════════════════
// CHECK 1 — chain-tab: rest-day-asymmetri + tillståndsmatris
// ══════════════════════════════════════════════════════════════════
const TAB_STATES = [
  { key: 'distant', need: [] },
  { key: 'adjacent', need: ['adjacent'] },
  { key: 'done', need: ['done'] },
  { key: 'adjacent.done', need: ['adjacent', 'done'] },
];

function chainTabCompound(sel) {
  for (const c of compounds(sel)) {
    if (/^\.chain-tab(?![\w-])/.test(c)) return c;
  }
  return null;
}

const tabThemes = new Map(); // theme -> { rules:[], custom:bool }
for (const r of flat) {
  const t = themeOf(r.sel);
  if (!t) continue;
  const comp = chainTabCompound(r.sel);
  if (!comp) continue;
  if (!tabThemes.has(t)) tabThemes.set(t, { rules: [], custom: false });
  const entry = tabThemes.get(t);
  const { required, negated } = classesOf(comp);
  entry.rules.push({ sel: r.sel, required, negated, decls: r.decls });
  // "Eget formspråk" = temat ritar om brickans form eller bokstavens yta.
  const last = compounds(r.sel).pop() || '';
  const touchesLetter = /\.chain-tab-letter/.test(last);
  for (const d of r.decls) {
    if (d.prop === 'clip-path' || (touchesLetter && /^(background|border-radius)/.test(d.prop))) {
      entry.custom = true;
    }
  }
}

for (const [theme, entry] of [...tabThemes].sort()) {
  if (!entry.custom) continue; // ärver bas-hexagonen medvetet — inget att kräva
  const matrix = [];
  for (const st of TAB_STATES) {
    for (const rest of [false, true]) {
      const have = new Set(st.need);
      if (rest) have.add('rest-day');
      const covering = entry.rules.filter((rule) => {
        if (rule.required.has('active')) return false; // eget tillstånd, utanför de sex
        for (const req of rule.required) {
          if (req === 'chain-tab') continue;
          if (!have.has(req)) return false;
        }
        for (const neg of rule.negated) if (have.has(neg)) return false;
        return true;
      });
      matrix.push({ state: st.key, rest, count: covering.length });
    }
  }
  // Asymmetrin. Mäts på TILLSTÅNDSSPECIFIKA regler — alltså sådana som faktiskt
  // kräver tillståndets klass. Generiska `.chain-tab{clip-path:none}`-regler
  // matchar tekniskt varje kombination och maskerar annars felet helt (första
  // versionen av den här checken var tyst på 3.81.1, där buggen fanns).
  for (const st of TAB_STATES) {
    if (!st.need.length) continue; // "distant" har ingen egen klass att kräva
    const stateRules = entry.rules.filter((rule) => {
      if (rule.required.has('active')) return false;
      const req = [...rule.required].filter((c) => c !== 'chain-tab' && c !== 'rest-day');
      if (!req.length) return false; // generisk regel — säger inget om tillståndet
      return req.every((c) => st.need.includes(c));
    });
    if (!stateRules.length) continue;
    const appliesToRest = stateRules.filter((rule) => !rule.negated.has('rest-day'));
    if (!appliesToRest.length) {
      errors.push(
        `[chain-tab] theme-${theme}: tillståndet "${st.key}" stylas av ${stateRules.length} regler ` +
        `och SAMTLIGA bär :not(.rest-day) — vilodagsbrickan får noll tema-behandling där\n` +
        `             och ramlar tillbaka på bas-CSS:en. Rätt uppdelning: färg/fas på\n` +
        `             .chain-tab-letter med :not(.rest-day) (guldet är låst), dämpning/kapsel på\n` +
        `             .chain-tab UTAN scope så alla brickor följer med. Se CLAUDE.md §5.`
      );
    }
  }

  if (VERBOSE) {
    const cells = matrix
      .map((c) => `${c.state}${c.rest ? '+rest' : ''}=${c.count}`)
      .join('  ');
    info.push(`[chain-tab] theme-${theme}: ${cells}`);
  }
}

// ══════════════════════════════════════════════════════════════════
// CHECK 2 — variant-paritet
// ══════════════════════════════════════════════════════════════════
const byTheme = new Map();
for (const r of flat) {
  const t = themeOf(r.sel);
  if (!t) continue;
  const rest = stripThemeAnchor(r.sel);
  if (!rest) continue;
  const parts = compounds(rest);
  if (!parts.length) continue;
  const scope = parts[0];
  const leaf = parts.length > 1 ? parts[parts.length - 1] : '(self)';
  const baseM = /^\.([\w-]+)/.exec(scope);
  if (!baseM) continue;
  if (!byTheme.has(t)) byTheme.set(t, new Map());
  const perBase = byTheme.get(t);
  if (!perBase.has(baseM[1])) perBase.set(baseM[1], new Map());
  const perScope = perBase.get(baseM[1]);
  if (!perScope.has(scope)) perScope.set(scope, new Set());
  perScope.get(scope).add(leaf.replace(/:(hover|focus|active|disabled)\b/g, ''));
}

/**
 * Kvalificerare = allt i scopen utöver basklassen (extra klasser + pseudon).
 * Klasserna plockas ur den :not()-STRIPPADE strängen — annars räknas `.collapsed`
 * inuti `:not(.collapsed)` som en krävd klass, och `.x:nth-child(odd):not(.collapsed)`
 * ser ut som en specialisering av `.x.collapsed:nth-child(odd)` fast de är
 * varandras motsatser. (Det gjorde att variant-checken tystnade helt.)
 */
function qualifiers(scope, base) {
  const q = new Set();
  const bare = scope.replace(/:not\([^)]*\)/g, '');
  for (const c of bare.matchAll(/\.([\w-]+)/g)) if (c[1] !== base) q.add('.' + c[1]);
  for (const p of bare.matchAll(/:(?!not\b)[\w-]+(\([^)]*\))?/g)) q.add(p[0]);
  for (const p of scope.matchAll(/:not\([^)]*\)/g)) q.add(p[0]);
  return q;
}

for (const [theme, perBase] of [...byTheme].sort()) {
  for (const [base, perScope] of [...perBase].sort()) {
    const all = [...perScope]
      .map(([scope, leaves]) => ({ scope, leaves, q: qualifiers(scope, base) }))
      .filter((s) => s.q.size > 0); // bara kvalificerade varianter jämförs
    // En scope som är en STRIKT specialisering av en annan scope i samma grupp
    // (t.ex. `.x.collapsed:nth-child(odd).saved` ovanpå `.x.collapsed:nth-child(odd)`)
    // är en DELTA-regel: den ska bara bära sina egna avvikelser och är per
    // definition mager. Den utesluts helt, annars larmar den mot varenda
    // fullständig variant i temat.
    const scopes = all.filter((s) =>
      !all.some((o) => o !== s && o.q.size < s.q.size && [...o.q].every((x) => s.q.has(x)))
    );
    if (scopes.length < 2) continue;
    for (let i = 0; i < scopes.length; i++) {
      for (let j = i + 1; j < scopes.length; j++) {
        // Rapportera varje PAR en gång, ur den fattigare variantens perspektiv.
        const [a, b] = scopes[i].leaves.size >= scopes[j].leaves.size
          ? [scopes[i], scopes[j]]
          : [scopes[j], scopes[i]];
        if (a.leaves.size < 5) continue;
        // Syskon = delar minst en kvalificerare (samma variant-familj)...
        const shared = [...a.q].some((x) => b.q.has(x));
        if (!shared) continue;
        // ...men INTE när den ena är en specialisering av den andra
        // (t.ex. `.x.collapsed:nth-child(odd).saved` ovanpå `.x.collapsed:nth-child(odd)`).
        // En delta-regel ska bara bära sina egna avvikelser och är inte halvgjord.
        const superset = [...a.q].every((x) => b.q.has(x)) || [...b.q].every((x) => a.q.has(x));
        if (superset) continue;
        const missing = [...a.leaves].filter((l) => !b.leaves.has(l) && l !== '(self)');
        if (missing.length >= 3) {
          warns.push(
            `[variant] theme-${theme}: "${b.scope}" stylar ${b.leaves.size} barn där ` +
            `syskonvarianten "${a.scope}" stylar ${a.leaves.size}.\n` +
            `             Saknas i ${b.scope}: ${missing.slice(0, 10).join(', ')}` +
            `${missing.length > 10 ? ` (+${missing.length - 10} till)` : ''}\n` +
            `             Verifiera att skillnaden är avsiktlig — vissa barn renderas inte i alla varianter.`
          );
        }
      }
    }
  }
}

// ══════════════════════════════════════════════════════════════════
// CHECK 3 — blandad polaritet (ljusa tokens + egna mörka ytor)
// ══════════════════════════════════════════════════════════════════
// Bas-CSS-regler som målar med var(--surface-*): de följer med in i VARJE tema.
const basePainters = [];
for (const r of flat) {
  if (themeOf(r.sel)) continue;
  for (const d of r.decls) {
    if (/^background/.test(d.prop) && /var\(--surface-[\w-]+\)/.test(d.value)) {
      const tok = /var\((--surface-[\w-]+)\)/.exec(d.value)[1];
      basePainters.push({ sel: r.sel, token: tok });
    }
  }
}

for (const [theme] of [...byTheme].sort()) {
  // Temats egna token-värden.
  const tokens = new Map();
  for (const r of flat) {
    if (themeOf(r.sel) !== theme) continue;
    if (stripThemeAnchor(r.sel) !== '') continue; // bara body.theme-X{...}
    for (const d of r.decls) {
      if (d.prop.startsWith('--surface-')) {
        const c = firstColor(d.value);
        if (c) tokens.set(d.prop, { color: c, lum: luminance(c), raw: d.value });
      }
    }
  }
  if (!tokens.size) continue;
  // En token räknas som en ljus YTA bara om den är både ljus och tillräckligt
  // opak. `--surface-overlay:rgba(255,255,255,0.35)` på ett mörkt tema är en
  // hover-TINT ovanpå mörkret, inte en ljus yta — utan alfa-villkoret larmar
  // checken på Cosmic Horror/Obsidian/Void där allt är som det ska.
  const lightTokens = [...tokens].filter(([, v]) => v.lum > 0.35 && (v.color.a ?? 1) >= 0.6);
  if (!lightTokens.length) continue;
  const lightNames = new Set(lightTokens.map(([k]) => k));

  // Har temat samtidigt EGNA mörka komponentbakgrunder?
  const darkSurfaces = [];
  for (const r of flat) {
    if (themeOf(r.sel) !== theme) continue;
    const scope = compounds(stripThemeAnchor(r.sel))[0] || '';
    if (/chain-tab|set-log-btn|btn-primary|ex-done-primary|logo|header/.test(scope)) continue;
    for (const d of r.decls) {
      if (!/^background(-color|-image)?$/.test(d.prop)) continue;
      const c = firstColor(d.value);
      if (c && luminance(c) < 0.06) darkSurfaces.push(r.sel);
    }
  }
  if (!darkSurfaces.length) continue;

  // Bas-regler temat redan tagit hand om själv — då är frågan besvarad.
  // Matchningen är avsiktligt suddig (samma basklass + samma bladselektor) och
  // inte exakt sträng, eftersom temat oftast scopar sin fix SNÄVARE än
  // bas-regeln: `.ex-block.collapsed.saved .ex-collapsed-summary` hanteras av
  // `.ex-block.collapsed:nth-child(odd).saved .ex-collapsed-summary`.
  const handled = [];
  for (const r of flat) {
    if (themeOf(r.sel) !== theme) continue;
    const parts = compounds(stripThemeAnchor(r.sel));
    if (!parts.length) continue;
    const b = /^\.([\w-]+)/.exec(parts[0]);
    if (b) handled.push({ base: b[1], leaf: parts[parts.length - 1] });
  }
  const isHandled = (sel) => {
    const parts = compounds(sel);
    const b = /^\.([\w-]+)/.exec(parts[0] || '');
    if (!b) return false;
    const leaf = parts[parts.length - 1];
    return handled.some((h) => h.base === b[1] && h.leaf === leaf);
  };

  const relevant = basePainters.filter((p) => {
    if (!lightNames.has(p.token)) return false; // just DEN token är mörk → ofarlig
    if (isHandled(p.sel)) return false;
    return darkSurfaces.some((ds) => {
      // Basklassen ur den TEMA-STRIPPADE scopen — annars matchar regexen
      // `.theme-fullmoon` ur ankaret och ingenting hittas någonsin.
      const dsBase = /^\.([\w-]+)/.exec(compounds(stripThemeAnchor(ds))[0] || '');
      return dsBase && p.sel.includes('.' + dsBase[1]);
    });
  });
  if (!relevant.length) continue;

  const uniq = [...new Set(relevant.map((p) => `${p.sel}  →  ${p.token}`))];
  warns.push(
    `[polaritet] theme-${theme} har LJUSA surface-tokens ` +
    `(${lightTokens.map(([k, v]) => `${k} L=${v.lum.toFixed(2)}`).join(', ')}) ` +
    `men ${darkSurfaces.length} egna MÖRKA komponentbakgrunder.\n` +
    `             Bas-CSS målar dessa med den ljusa token — verifiera att de inte landar ovanpå en mörk variant:\n` +
    uniq.slice(0, 6).map((u) => `               ${u}`).join('\n') +
    (uniq.length > 6 ? `\n               (+${uniq.length - 6} till)` : '')
  );
}

// ══════════════════════════════════════════════════════════════════
// CHECK 4 — kontrast inom samma regel
// ══════════════════════════════════════════════════════════════════
// Tröskeln är medvetet LÅG (2.0, inte WCAG:s 4.5). Kodbasen dämpar avsiktligt
// en hel del — Irons LOG-knapp ska "ligga lågt", :disabled ska se avstängd ut,
// placeholders ska vara svaga. Vid 3.0 blev checken nästan bara falsklarm och
// hade tränat bort läsvanan. 2.0 fångar det som faktiskt är oläsbart, som
// vit-på-vit-knappen i 3.72.0-regressionen (ratio ≈ 1.0).
for (const r of flat) {
  if (/:disabled|::placeholder|:-\w+-input-placeholder/.test(r.sel)) continue;
  let fg = null, bg = null;
  for (const d of r.decls) {
    if (d.prop === 'color') fg = firstColor(d.value);
    if (/^background(-color|-image)?$/.test(d.prop)) bg = firstColor(d.value) ?? bg;
  }
  if (!fg || !bg) continue;
  if ((fg.a ?? 1) < 0.9 || (bg.a ?? 1) < 0.9) continue; // genomskinligt → kan inte avgöras statiskt
  const ratio = contrast(fg, bg);
  if (ratio < 2) {
    warns.push(`[kontrast] ${r.sel} — ratio ${ratio.toFixed(2)}:1 (color vs background i samma regel)`);
  }
}

// ── rapport ───────────────────────────────────────────────────────
const themeCount = new Set([...byTheme.keys()]).size;
console.log(`check_themes — ${rules.length} CSS-regler, ${themeCount} teman med egna block\n`);

for (const i of info) console.log('  ' + i);
if (info.length) console.log('');

if (errors.length) {
  console.log(`ERROR (${errors.length})`);
  for (const e of errors) console.log('  ✗ ' + e + '\n');
}
if (warns.length) {
  console.log(`WARN (${warns.length})`);
  for (const w of warns) console.log('  ! ' + w + '\n');
}
if (!errors.length && !warns.length) console.log('Inga fynd.');

console.log(`\n${errors.length} error, ${warns.length} warn`);
process.exit(errors.length ? 1 : 0);
