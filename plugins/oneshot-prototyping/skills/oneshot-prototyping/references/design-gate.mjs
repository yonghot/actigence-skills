#!/usr/bin/env node
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULTS = {
  routes: ['/'],
  homeRoute: null,
  viewports: [393, 1024, 1440, 1920],
  settleMs: 3200,
  scrollStepMs: 220,
  maxScrollSteps: 40,
  navTimeoutMs: 45000,
  heroCoverage: { desktop: 0.25, mobile: 0.18 },
  h1Ratio: { desktop: 3.0, mobile: 2.1 },
  h2Ratio: { desktop: 1.8, mobile: 1.55 },
  shadows: { home: [6, 3], other: [2, 1] },
  rhythm: { unique: 3, adjacentSame: 0, darkMin: 1, darkMax: 3 },
  patterns: { home: 3, other: 1 },
  textDepth: { home: 4, other: 2 },
  animNamesHome: 4,
  reactMaxMs: 200,
  ambientMax: 8,
  brandAssetPatterns: [],
  logoPatterns: ['logo'],
  brandHome: 3,
  characterPatterns: [],
  characterHome: 1,
  declineMax: 0.10,
  eyebrowRatio: 0.6,
  placeholderRe: 'IMG-\\d|placeholder|이미지 자리|lorem ipsum',
  cardSelector: 'article, li, [class*="card" i]',
  cardVisualRatio: 0.8,
  generatedPathRe: '/images/gen/',
  generatedHome: 4,
  touchMin: 44,
  emptyGrayMax: 0.35,
  sortViewMin: 6,
  standardFeatures: 7,
  leftAccentMax: 2,
  centeredMax: 0.5,
  imageTool: 'unknown',
  heroAllowVector: false,
  waive: {},
};

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
}

class MeasurerUnavailable extends Error {}

const FEATURES = ['search', 'filter', 'favorites', 'shortcuts', 'states', 'deeplink', 'notfound'];

function loadPlaywright() {
  const req = createRequire(path.join(process.cwd(), 'package.json'));
  for (const name of ['playwright', '@playwright/test', 'playwright-core']) {
    try {
      const m = req(name);
      if (m && m.chromium) return m;
    } catch {}
  }
  throw new MeasurerUnavailable('playwright not found in this project. Install: pnpm add -D @playwright/test && npx playwright install chromium');
}

function measureTop(o) {
  const px = (v) => parseFloat(v) || 0;
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  const h1s = [...document.querySelectorAll('h1')].filter(vis);
  let hero = null;
  if (h1s.length) {
    hero = h1s[0].closest('section, header, [class*="hero" i]') || h1s[0].parentElement;
    while (hero.parentElement && hero.parentElement !== document.body) {
      if (hero.getBoundingClientRect().height >= 280) break;
      if (hero.parentElement.getBoundingClientRect().height > innerHeight * 1.5) break;
      hero = hero.parentElement;
    }
  }
  const TAG = 'section, header, [class*="hero" i]';
  const cap = Math.max(innerHeight * 1.5, 1100);
  const cardsIn = (e) => [...e.querySelectorAll(o.cardSelector)].filter((c) => vis(c) && c.querySelector('h2, h3, h4, [role="heading"]')).length;
  const cands = hero ? [hero] : [];
  for (let e = hero && hero.parentElement; e && e !== document.body && e.tagName !== 'MAIN'; e = e.parentElement) {
    if (e.matches(TAG) && e.getBoundingClientRect().height <= cap && cardsIn(e) < 3) cands.push(e);
  }
  const cover = (hero) => {
    let raster = 0; const visuals = [];
    const hr = hero.getBoundingClientRect();
    const heroArea = Math.max(1, Math.min(hr.width, 1440) * hr.height);
    let area = 0;
    const clip = (r) => {
      const w = Math.max(0, Math.min(r.right, hr.right) - Math.max(r.left, hr.left));
      const h = Math.max(0, Math.min(r.bottom, hr.bottom) - Math.max(r.top, hr.top));
      return w * h;
    };
    for (const el of hero.querySelectorAll('*')) {
      if (!vis(el)) continue;
      const cs = getComputedStyle(el);
      if (px(cs.opacity) < 0.6) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 80 || r.height < 80) continue;
      const tag = el.tagName.toLowerCase();
      let isVisual = false;
      if (tag === 'img') isVisual = el.complete && el.naturalWidth > 0;
      else if (tag === 'video' || tag === 'canvas') isVisual = true;
      else if (tag === 'svg') isVisual = r.width >= 120 && r.height >= 120;
      else if (cs.backgroundImage.includes('url(')) {
        const size = cs.backgroundSize.split(' ').map(px);
        const sized = /cover|contain/.test(cs.backgroundSize);
        const tiled = cs.backgroundRepeat !== 'no-repeat' && !sized && !(size[0] > 220);
        isVisual = !tiled;
      }
      if (!isVisual) continue;
      if (tag !== 'svg' && tag !== 'canvas') raster++;
      area += clip(r);
      visuals.push(tag);
    }
    return { coverage: Math.min(1, area / heroArea), raster, visuals };
  };
  let best = { coverage: 0, raster: 0, visuals: [] };
  for (const c of cands) { const r = cover(c); if (r.coverage > best.coverage) best = r; }
  const { coverage, raster, visuals } = best;
  const dec = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
  const heroRoot = cands[cands.length - 1];
  const heroChars = !o.characterPatterns.length || !heroRoot ? null : [...heroRoot.querySelectorAll('img')]
    .filter((i) => vis(i) && i.complete && i.naturalWidth > 0 && o.characterPatterns.some((p) => (dec(i.currentSrc || i.src || '') + ' ' + (i.getAttribute('alt') || '')).toLowerCase().includes(p.toLowerCase()))).length;
  const anims = document.getAnimations ? document.getAnimations() : [];
  const names = new Set(window.__an || []);
  let ambientTop = 0;
  for (const a of anims) {
    if (a.transitionProperty) continue;
    const kf = a.effect && a.effect.getKeyframes ? a.effect.getKeyframes()[0] || {} : {};
    names.add(a.animationName || 'waapi:' + Object.keys(kf).filter((k) => !['offset', 'easing', 'composite', 'computedOffset'].includes(k)).join('+'));
    const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : {};
    const target = a.effect && a.effect.target;
    if (t.iterations === Infinity && a.playState === 'running' && target && target.getBoundingClientRect) {
      const r = target.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight && r.width > 0) ambientTop++;
    }
  }
  return { hasHero: !!hero, coverage, raster, heroChars, visualCount: visuals.length, animNames: [...names], ambientTop };
}

function measureOcclusion() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width >= 24 && r.height >= 24 && r.top >= 0 && r.bottom <= innerHeight;
  };
  const hits = [];
  for (const c of document.querySelectorAll('button, input, select, textarea, a[href]')) {
    if (!vis(c)) continue;
    const r = c.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (!top || c.contains(top) || top.contains(c)) continue;
    if (top.tagName === 'IMG' && (top.getAttribute('aria-hidden') === 'true' || top.getAttribute('alt') === '')) {
      hits.push((c.innerText || c.getAttribute('aria-label') || c.tagName).trim().slice(0, 40));
    }
  }
  return hits;
}

function measurePage(o) {
  const px = (v) => parseFloat(v) || 0;
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  const all = [...document.body.querySelectorAll('*')];
  const visible = all.filter(vis);
  let base = px(getComputedStyle(document.body).fontSize);
  if (base < 10) base = px(getComputedStyle(document.documentElement).fontSize) || 16;
  const sizes = (sel) => [...document.querySelectorAll(sel)].filter(vis).map((e) => px(getComputedStyle(e).fontSize));
  const h1 = Math.max(0, ...sizes('h1'));
  const h2s = sizes('h2').sort((a, b) => a - b);
  const h2 = h2s.length ? h2s[Math.floor(h2s.length / 2)] : 0;

  const splitTop = (s) => {
    const parts = []; let depth = 0; let cur = '';
    for (const ch of s) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
    }
    if (cur.trim()) parts.push(cur);
    return parts.map((p) => p.trim());
  };
  const elevation = (s) => {
    if (!s || s === 'none') return false;
    return splitTop(s).some((p) => {
      if (/\binset\b/.test(p)) return false;
      const nums = (p.replace(/rgba?\([^)]*\)|hsla?\([^)]*\)|#[0-9a-f]+/gi, '').match(/-?[\d.]+px/g) || []).map(px);
      return (nums[2] || 0) >= 4;
    });
  };
  const shadowSet = new Set();
  let shadowCount = 0;
  for (const el of visible) {
    const s = getComputedStyle(el).boxShadow;
    if (elevation(s)) { shadowCount++; shadowSet.add(s); }
  }

  // Chrome keeps oklch()/color()/lab() in computed styles; normalize through canvas.
  const cx2d = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgba = (c) => {
    if (!cx2d) { const n = (c.match(/[\d.]+/g) || [255, 255, 255]).map(Number); return [n[0], n[1], n[2], n[3] === undefined ? 1 : n[3]]; }
    cx2d.clearRect(0, 0, 2, 2); cx2d.fillStyle = '#000'; cx2d.fillStyle = c; cx2d.fillRect(0, 0, 1, 1); const d = cx2d.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const bgOf = (el) => {
    let e = el;
    while (e) {
      const c = getComputedStyle(e).backgroundColor;
      if (c && c !== 'transparent' && rgba(c)[3] > 0.05) return c;
      e = e.parentElement;
    }
    return 'rgb(255, 255, 255)';
  };
  const lum = (c) => {
    const m = rgba(c);
    const [r, g, b] = m.slice(0, 3).map((v) => { const x = (m[3] * Number(v) + (1 - m[3]) * 255) / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const hasPattern = (el) => {
    const cs = getComputedStyle(el);
    const tiledBg = cs.backgroundImage.includes('url(') && cs.backgroundRepeat !== 'no-repeat' && !/cover|contain/.test(cs.backgroundSize);
    const pseudo = ['::before', '::after'].some((p) => {
      const ps = getComputedStyle(el, p);
      if (!ps.content || ps.content === 'none' || ps.content === 'normal') return false;
      const mask = (ps.maskImage || ps.webkitMaskImage || 'none');
      return (mask && mask !== 'none') || (ps.backgroundImage && ps.backgroundImage.includes('url('));
    });
    return tiledBg || pseudo;
  };
  const container = document.querySelector('main') || document.body;
  const minW = Math.min(container.getBoundingClientRect().width * 0.9, innerWidth * 0.6);
  const collectBlocks = (root, depth) => {
    let kids = [...root.children].filter(vis);
    while (kids.length === 1 && depth < 4) { kids = [...kids[0].children].filter(vis); depth++; }
    const out = [];
    for (const c of kids) {
      const r = c.getBoundingClientRect();
      if (r.width >= minW && r.height >= 120) {
        if (depth < 3 && c.children.length >= 3 && !['SECTION', 'HEADER', 'FOOTER', 'NAV'].includes(c.tagName) && r.height > innerHeight * 3) out.push(...collectBlocks(c, depth + 1));
        else out.push(c);
      }
    }
    return out;
  };
  const blocks = collectBlocks(container, 0);
  const pageFooter = [...document.querySelectorAll('footer')].filter(vis).pop();
  if (pageFooter && !container.contains(pageFooter) && pageFooter.getBoundingClientRect().height >= 120) blocks.push(pageFooter);
  const sigs = blocks.map((b) => {
    const bg = bgOf(b);
    const bgi = getComputedStyle(b).backgroundImage;
    const tintDark = bgi !== 'none' && (bgi.match(/(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^)]*\)/g) || []).some((c) => lum(c) < 0.12);
    return { bg: bg + (bgi !== 'none' ? '|' + bgi.slice(0, 60) : ''), pat: hasPattern(b), dark: lum(bg) < 0.12 || tintDark };
  });
  const sigKey = (s) => s.bg + (s.pat ? '|p' : '');
  let adjacentSame = 0;
  for (let i = 1; i < sigs.length; i++) if (sigKey(sigs[i]) === sigKey(sigs[i - 1])) adjacentSame++;
  const rhythm = { blocks: sigs.length, unique: new Set(sigs.map(sigKey)).size, adjacentSame, dark: sigs.filter((s) => s.dark).length };

  let patternCount = 0; let textureCount = 0; let watermark = 0; let rootPattern = false;
  const clear = /rgba\([^)]*,\s*0\)|\/\s*0\)|transparent/;
  const pageH = document.documentElement.scrollHeight;
  for (const el of [document.documentElement, document.body, ...visible]) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width >= 200 && r.height >= 100 && hasPattern(el)) {
      patternCount++;
      const wrapsPage = (el.parentElement === document.body || (el.parentElement && el.parentElement.parentElement === document.body)) && r.width >= innerWidth * 0.95 && r.height >= pageH * 0.9;
      const backdrop = el === document.documentElement || el === document.body || wrapsPage || (cs.position === 'fixed' && r.width >= innerWidth * 0.8 && r.height >= innerHeight * 0.8);
      if (backdrop) rootPattern = true;
    }
    if (el.tagName === 'IMG' && px(cs.opacity) < 0.6 && r.width >= 200 && r.height >= 120) textureCount++;
    if (px(cs.webkitTextStrokeWidth) > 0 && (clear.test(cs.color) || clear.test(cs.webkitTextFillColor || ''))) watermark++;
  }

  let textDepth = 0;
  for (const el of visible) {
    const cs = getComputedStyle(el);
    if (cs.textShadow === 'none') continue;
    const big = px(cs.fontSize) >= 28 || /^H[1-3]$/.test(el.tagName);
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!big || !ownText) continue;
    const layers = splitTop(cs.textShadow).filter((l) => {
      const nums = (l.replace(/rgba?\([^)]*\)|hsla?\([^)]*\)|#[0-9a-f]+/gi, '').match(/-?[\d.]+px/g) || []).map(px);
      const a = (l.match(/rgba\([^)]*,\s*([\d.]+)\)/) || [])[1];
      return Math.abs(nums[0] || 0) + Math.abs(nums[1] || 0) >= 1 && (nums[2] || 0) <= 1 && (a === undefined || Number(a) > 0.05);
    });
    if (layers.length >= 2) textDepth++;
  }

  let maxTransition = 0; let transitionAll = 0; const slow = [];
  for (const el of visible) {
    const cs = getComputedStyle(el);
    const durs = cs.transitionDuration.split(',').map((d) => (d.includes('ms') ? px(d) : px(d) * 1000));
    const props = cs.transitionProperty.split(',').map((p) => p.trim());
    const sceneEl = !!el.closest('[data-motion-scene],[data-signature]');
    durs.forEach((d, i) => {
      const prop = props[i % props.length];
      if (d > 0 && prop !== 'none') {
        if (!sceneEl && d > maxTransition) maxTransition = d;
        if (!sceneEl && d > o.reactMaxMs && slow.length < 5) slow.push(`${el.tagName.toLowerCase()}.${(el.className && el.className.baseVal === undefined ? String(el.className) : '').split(' ').slice(0, 2).join('.')} ${prop} ${d}ms`);
        if (prop === 'all') transitionAll++;
      }
    });
  }

  const imgs = [...document.querySelectorAll('img')];
  const broken = imgs.filter((i) => i.complete && i.naturalWidth === 0 && (i.currentSrc || i.src)).map((i) => (i.currentSrc || i.src).slice(-60));
  const loaded = imgs.filter((i) => i.complete && i.naturalWidth > 0 && vis(i));
  const re = new RegExp(o.placeholderRe, 'gi');
  const placeholders = (document.body.innerText.match(re) || []).slice(0, 5);
  const dec = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
  const srcOf = (i) => (dec(i.currentSrc || i.src || '') + ' ' + (i.getAttribute('alt') || '')).toLowerCase();
  const brandImgs = o.brandAssetPatterns.length ? loaded.filter((i) => o.brandAssetPatterns.some((p) => srcOf(i).includes(p.toLowerCase()))).length : null;
  const logoSvgs = [...document.querySelectorAll('svg[aria-label], [data-brand-asset="logo"], header a[href="/"] img, header a[href="/"] svg')].filter((e) => vis(e) && (e.matches('[data-brand-asset="logo"], header a[href="/"] *') || /로고|logo/i.test(e.getAttribute('aria-label') || ''))).length;
  const logoImgs = logoSvgs + loaded.filter((i) => o.logoPatterns.some((p) => srcOf(i).includes(p.toLowerCase())) || /로고|logo/i.test(i.getAttribute('alt') || '')).length;
  const infiniteAnims = document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.getTiming().iterations === Infinity).length;
  const motionToggle = !!document.querySelector('[data-motion-toggle]');
  const tickerEls = [...document.querySelectorAll('[data-ticker], [class*="marquee" i], [class*="ticker" i]')]
    .filter((t) => vis(t) && (t.hasAttribute('data-ticker') || /(^|[\s_-])(ticker|marquee)/i.test(String(t.className && t.className.baseVal !== undefined ? t.className.baseVal : t.className))));
  const tickerNoStop = tickerEls.filter((t) => !tickerEls.some((p) => p !== t && p.contains(t)) && !t.querySelector('button') && !(t.parentElement && t.parentElement.querySelector('button'))).length;
  const genImgs = loaded.filter((i) => new RegExp(o.generatedPathRe).test(srcOf(i))).length;
  const hydrated = document.documentElement.classList.contains('m-on') || document.body.classList.contains('m-on') || !!document.querySelector('[data-hydrated]');

  let cards = 0; let cardsVis = 0;
  const maxCardW = innerWidth < 768 ? innerWidth : innerWidth * 0.7;
  const cand = [...document.querySelectorAll(o.cardSelector)].filter((el) => {
    if (!vis(el)) return false;
    const r = el.getBoundingClientRect();
    return r.width >= 160 && r.height >= 120 && r.width <= maxCardW && !!el.querySelector('h2, h3, h4, [role="heading"]');
  });
  const sig = (e) => e.tagName + '|' + String(e.className);
  const isWrapper = (el) => {
    const top = cand.filter((c) => c !== el && el.contains(c) && !cand.some((m) => m !== el && m !== c && el.contains(m) && m.contains(c)));
    return top.some((a, i) => top.some((b, j) => j > i && sig(a) === sig(b)));
  };
  const real = cand.filter((el) => !isWrapper(el));
  for (const el of real) {
    if (real.some((p) => p !== el && p.contains(el))) continue;
    cards++;
    const media = [...el.querySelectorAll('img, video')].some((v) => vis(v) && (v.tagName !== 'IMG' || v.naturalWidth > 0))
      || [...el.querySelectorAll('svg')].some((s) => { const b = s.getBoundingClientRect(); return b.width >= 96 && b.height >= 96; })
      || [el, ...el.querySelectorAll('*')].some((c) => getComputedStyle(c).backgroundImage.includes('url(') && c.getBoundingClientRect().width >= 80);
    if (media) cardsVis++;
  }

  let eyebrowed = 0; let h2count = 0;
  for (const h of [...document.querySelectorAll('h2')].filter(vis)) {
    h2count++;
    const prev = h.previousElementSibling;
    if (!prev) continue;
    const pcs = getComputedStyle(prev);
    const t = (prev.innerText || '').trim();
    if (t.length >= 1 && t.length <= 30 && px(pcs.fontSize) <= px(getComputedStyle(h).fontSize) * 0.6 && Number(pcs.fontWeight) >= 600) eyebrowed++;
  }
  let numeric = 0;
  for (const el of visible) {
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');
    if (!own || !/^[~≈]?[$€₩¥]?\d[\d,.]*\s?(%|[만억천kKmM+]|원|건|명)?$|^D-?\d+$|^D-day$/.test(own)) continue;
    const cs = getComputedStyle(el);
    if (Number(cs.fontWeight) >= 800 && px(cs.fontSize) >= base * 2.2) numeric++;
  }

  return {
    base, h1, h2,
    h1Ratio: base ? h1 / base : 0, h2Ratio: base ? h2 / base : 0,
    shadowCount, shadowUnique: shadowSet.size,
    rhythm, patternCount, textureCount, watermark, textDepth, rootPattern,
    maxTransition, transitionAll, slow,
    broken, placeholders, brandImgs, logoImgs, infiniteAnims, motionToggle, tickerNoStop,
    genImgs, hydrated, cards, cardsVis,
    eyebrowRatio: h2count ? eyebrowed / h2count : null, numeric,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    elementCount: visible.length, imgCount: loaded.length,
  };
}

function measureA11y(o) {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  const hiddenTree = (el) => !!el.closest('[aria-hidden="true"], [inert], [hidden]');
  const touch = innerWidth < 768;
  let total = 0; const small = [];
  if (touch) {
    const sel = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [role="tab"], [role="menuitem"]';
    for (const el of document.body.querySelectorAll(sel)) {
      if (!vis(el) || hiddenTree(el) || el.disabled) continue;
      const cs = getComputedStyle(el);
      const own = el.parentElement ? [...el.parentElement.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1) : false;
      if (el.tagName === 'A' && cs.display === 'inline' && own) continue;
      let box = el.getBoundingClientRect();
      if ((el.type === 'checkbox' || el.type === 'radio') && el.labels && el.labels[0]) box = el.labels[0].getBoundingClientRect();
      if (box.right <= 0 || box.left >= document.documentElement.scrollWidth) continue;
      total++;
      if (box.width < o.touchMin - 0.5 || box.height < o.touchMin - 0.5) small.push(`${(el.innerText || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 24)} ${Math.round(box.width)}x${Math.round(box.height)}`);
    }
  }
  const noAlt = [];
  const bad = /\.(png|jpe?g|webp|gif|svg|avif)$|^IMG[_-]?\d+/i;
  for (const el of document.body.querySelectorAll('img, input[type="image"], [role="img"]')) {
    if (hiddenTree(el) || ['presentation', 'none'].includes(el.getAttribute('role') || '')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    const tag = el.tagName;
    if (tag === 'IMG' || tag === 'INPUT') {
      const alt = el.getAttribute('alt');
      if (alt === null || bad.test(alt.trim())) noAlt.push((el.currentSrc || el.src || '').slice(-50));
    } else if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.querySelector('title')) noAlt.push(`role=img ${tag.toLowerCase()}`);
  }
  return { touch, total, small: small.length, smallSamples: small.slice(0, 4), noAlt: noAlt.length, noAltSamples: noAlt.slice(0, 4) };
}

function measureRichness(o) {
  const px = (v) => parseFloat(v) || 0;
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  const cx2d = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgba = (c) => {
    if (!cx2d) { const n = (c.match(/[\d.]+/g) || [255, 255, 255]).map(Number); return [n[0], n[1], n[2], n[3] === undefined ? 1 : n[3]]; }
    cx2d.clearRect(0, 0, 2, 2); cx2d.fillStyle = '#000'; cx2d.fillStyle = c; cx2d.fillRect(0, 0, 1, 1); const d = cx2d.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255];
  };
  const lum = (m) => {
    const [r, g, b] = m.slice(0, 3).map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const MEDIA = 'img, video, canvas, svg, iframe';
  const counted = [];
  let slotArea = 0; let grayArea = 0; let slots = 0;
  for (const el of document.body.querySelectorAll('*')) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 80 || r.height < 80) continue;
    if (counted.some((c) => c.contains(el))) continue;
    const tag = el.tagName.toLowerCase();
    const area = r.width * r.height;
    if (tag === 'img') {
      const ok = el.complete && el.naturalWidth > 0;
      slotArea += area; slots++; counted.push(el);
      if (!ok) grayArea += area;
    } else if (tag === 'video' || tag === 'canvas' || tag === 'iframe') {
      slotArea += area; slots++; counted.push(el);
    } else if (tag === 'svg') {
      if (r.width >= 96 && r.height >= 96) { slotArea += area; slots++; counted.push(el); }
    } else {
      const cs = getComputedStyle(el);
      if (cs.backgroundImage !== 'none' || el.querySelector(MEDIA) || (el.innerText || '').trim() || [...el.children].some(vis)) continue;
      const c = rgba(cs.backgroundColor);
      if (c[3] < 0.3) continue;
      slotArea += area; slots++; counted.push(el);
      const chroma = Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]);
      const l = lum(c);
      if (chroma <= 24 && l >= 0.04 && l < 0.97) grayArea += area;
    }
  }

  const inChrome = (e) => !!e.closest('nav, header, footer, [role="navigation"]');
  const itemSel = o.cardSelector + ', tr';
  let items = 0;
  for (const parent of [document.body, ...document.body.querySelectorAll('*')]) {
    if (inChrome(parent) && parent !== document.body) continue;
    const buckets = new Map();
    for (const k of parent.children) {
      if (!vis(k) || !k.matches(itemSel) || (k.innerText || '').trim().length < 2) continue;
      const r = k.getBoundingClientRect();
      if (r.width < 80 || r.height < 40) continue;
      const key = k.tagName + '|' + String(k.className && k.className.baseVal !== undefined ? k.className.baseVal : k.className);
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    for (const n of buckets.values()) if (n > items) items = n;
  }
  const sortRe = /정렬|sort|order by|최신순|인기순|순서/i;
  const sort = [...document.querySelectorAll('select, [role="combobox"], [aria-sort], [data-sort], button, [role="button"], label')]
    .some((e) => !inChrome(e) && (e.matches('[aria-sort], [data-sort]') || sortRe.test((e.getAttribute('aria-label') || '') + ' ' + (e.id || '') + ' ' + (e.getAttribute('name') || '') + ' ' + (e.tagName === 'SELECT' ? '' : (e.innerText || '')).slice(0, 40))));

  const q = (s) => document.querySelector(s);
  const text = document.body.textContent || '';
  const lbl = (e) => (e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('title') || '') + ' ' + (e.innerText || '').slice(0, 40);
  const clickables = [...document.querySelectorAll('button, [role="button"], a, label, [data-filter]')];
  const features = {
    search: !!q('input[type="search"], [role="search"], [role="searchbox"], input[name*="search" i], input[placeholder*="search" i], input[placeholder*="검색"], input[aria-label*="검색"], input[aria-label*="search" i]'),
    filter: !!q('[role="tablist"], [data-filter]') || document.querySelectorAll('[aria-pressed]').length >= 2 || document.querySelectorAll('input[type="checkbox"], input[type="radio"]').length >= 2
      || [...document.querySelectorAll('select')].some((e) => !sortRe.test((e.getAttribute('aria-label') || '') + ' ' + e.id + ' ' + (e.getAttribute('name') || '')))
      || clickables.some((e) => /필터|filter|카테고리|category/i.test(lbl(e))),
    favorites: !!q('[data-favorite], [data-bookmark]') || clickables.some((e) => /즐겨찾기|favorite|bookmark|북마크|찜|관심|좋아요/i.test(lbl(e))),
    shortcuts: !!q('[aria-keyshortcuts], kbd, [data-shortcut]') || /단축키|shortcut/i.test(text),
    states: (!!q('[data-empty], [data-state="empty"], [class*="empty" i]') || /결과가 없|no results|비어 있|데이터가 없/i.test(text))
      && (!!q('[aria-busy="true"], [data-loading], [data-state="loading"], [class*="skeleton" i], [role="status"]') || /불러오는 중|loading/i.test(text))
      && (!!q('[role="alert"], [data-error], [data-state="error"], [class*="error" i]') || /오류|에러|error/i.test(text)),
    deeplink: false,
  };
  let deeplink = null;
  for (const a of document.querySelectorAll('a[href]')) {
    if (inChrome(a)) continue;
    let u; try { u = new URL(a.href, location.href); } catch { continue; }
    if (u.origin !== location.origin || u.pathname === location.pathname) continue;
    if (u.pathname.split('/').filter(Boolean).length >= 2 || u.search) { deeplink = u.pathname + u.search; break; }
  }
  features.deeplink = !!deeplink;

  let leftAccent = 0; let centered = 0; let texty = 0;
  for (const el of document.body.querySelectorAll('*')) {
    if (!vis(el)) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width >= 120 && r.height >= 60 && px(cs.borderLeftWidth) >= 3 && cs.borderLeftStyle !== 'none' && px(cs.borderTopWidth) <= 1 && px(cs.borderRightWidth) <= 1 && px(cs.borderBottomWidth) <= 1) leftAccent++;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ');
    if (own.length >= 20) { texty++; if (cs.textAlign === 'center') centered++; }
  }
  return { grayRatio: slotArea ? grayArea / slotArea : 0, slots, items, sort, isList: items >= 3 || sort, features, deeplink, leftAccent, centeredRatio: texty ? centered / texty : null };
}

function hiddenInView() {
  const px = (v) => parseFloat(v) || 0;
  const skip = '[aria-hidden="true"], [inert], [hidden], [role="tooltip"], [role="menu"], [role="dialog"], [data-state="closed"], [data-motion-exempt], [aria-roledescription="slide"]:not([aria-current])';
  const out = [];
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
    if (el.closest(skip)) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.pointerEvents === 'none') continue;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1) && el.tagName !== 'IMG') continue;
    if (/group-hover|hover:opacity/.test(String(el.className))) continue;
    let o = 1; let e = el;
    while (e && e !== document.documentElement) { o *= px(getComputedStyle(e).opacity); e = e.parentElement; }
    if (o < 0.05) out.push((el.innerText || el.getAttribute('alt') || el.tagName).trim().slice(0, 40));
  }
  return out;
}

async function scrollThrough(page, stepMs, collectOcclusion, maxSteps, light) {
  const occ = []; const hid = []; let steps = 0; let capped = false;
  const scroller = await page.evaluate(() => {
    const c = [...document.querySelectorAll('*')].filter((e) => { const s = getComputedStyle(e); return /(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 200 && e.clientHeight > innerHeight * 0.5; }).sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
    if (!c || document.documentElement.scrollHeight > innerHeight + 200) return false;
    c.setAttribute('data-gate-scroller', '');
    return true;
  });
  const el = scroller ? 'document.querySelector("[data-gate-scroller]")' : 'document.scrollingElement';
  const height = () => page.evaluate(`${el}.scrollHeight`);
  const vh = await page.evaluate(() => innerHeight);
  for (let y = 0; y < (await height()); y += Math.floor(vh * 0.8)) {
    if (++steps > maxSteps) { capped = true; break; }
    await page.evaluate(`${el}.scrollTo(0, ${y})`);
    await page.waitForTimeout(stepMs);
    if (collectOcclusion) occ.push(...(await page.evaluate(measureOcclusion)));
    if (light) continue;
    const h = await page.evaluate(hiddenInView);
    if (h.length) {
      await page.waitForTimeout(900);
      const h2 = await page.evaluate(hiddenInView);
      hid.push(...h2.filter((t) => h.includes(t)));
    }
  }
  await page.evaluate(`${el}.scrollTo(0, ${el}.scrollHeight)`);
  await page.waitForTimeout(light ? 400 : 900);
  return { occ: [...new Set(occ)], hidden: [...new Set(hid)].slice(0, 8), capped };
}

let WAIVE = {};
function rule(results, id, level, route, vw, pass, value, expect, note) {
  const w = WAIVE[`${id}@${route}`] || WAIVE[id];
  if (w) { results.push({ id, level, route, vw, pass: null, value: 'N/A (waived)', expect, note: `가정: ${w}` }); return; }
  results.push({ id, level, route, vw, pass: pass === null ? null : !!pass, value, expect, note: note || '' });
}

function loadConfig(args) {
  const cfg = { ...DEFAULTS };
  const cfgPath = args.config || (fs.existsSync('design/uplift-gate.json') ? 'design/uplift-gate.json' : null);
  if (cfgPath) {
    if (!fs.existsSync(cfgPath)) throw new Error(`config not found: ${cfgPath}`);
    const user = JSON.parse(fs.readFileSync(cfgPath, 'utf8').replace(/^﻿/, ''));
    const unknownKeys = Object.keys(user).filter((k) => !(k in DEFAULTS));
    if (unknownKeys.length) console.error(`warning: unknown config keys (ignored): ${unknownKeys.join(', ')}`);
    for (const [k, v] of Object.entries(user)) {
      const nested = v && typeof v === 'object' && !Array.isArray(v) && cfg[k] && typeof cfg[k] === 'object' && !Array.isArray(cfg[k]);
      cfg[k] = nested ? { ...cfg[k], ...v } : v;
    }
  }
  return { cfg, cfgPath };
}

function explain(c) {
  const pc = (v) => `${Math.round(v * 100)}%`;
  const rows = [
    ['R0', 'required', 'route HTTP status and navigation success', '< 400 (nav or measure error = FAIL)'],
    ['R1', 'required', 'hero visual coverage: raster/video/canvas/svg area over the h1 hero candidate; tiled patterns excluded', `desktop >= ${c.heroCoverage.desktop}, 393 >= ${c.heroCoverage.mobile}, raster >= 1 unless heroAllowVector`],
    ['R2', 'required', 'broken images and placeholder text', '0, 0'],
    ['R3', 'required', 'hierarchy: h1/body and median h2/body font ratio', `h1 >= ${c.h1Ratio.desktop}x (393: ${c.h1Ratio.mobile}x), h2 >= ${c.h2Ratio.desktop}x (393: ${c.h2Ratio.mobile}x)`],
    ['R4', 'required', 'resting-state elevated shadows: elements / unique', `home >= ${c.shadows.home.join(' / ')}, other >= ${c.shadows.other.join(' / ')}`],
    ['R5', 'required', 'section rhythm (home): unique backgrounds, adjacent same, dark bands', `unique >= ${c.rhythm.unique}, adjacent <= ${c.rhythm.adjacentSame}, dark ${c.rhythm.darkMin}-${c.rhythm.darkMax}`],
    ['R6', 'required', 'pattern/texture elements and a root-level backdrop pattern', `home >= ${c.patterns.home}, other >= ${c.patterns.other}, root pattern present`],
    ['R7', 'required', 'large headings with a layered (>= 2) low-blur text-shadow', `home >= ${c.textDepth.home}, other >= ${c.textDepth.other}`],
    ['R8', 'required', 'distinct animation names started after load (home)', c.animNamesHome === 0 ? 'N/A (animNamesHome 0)' : `>= ${c.animNamesHome}`],
    ['R9', 'required', 'text invisible (opacity < 0.05) 1.1 s after entering view; under reduced-motion also running animations', '0 (reduce: 0, 0)'],
    ['R10', 'required', 'max transition duration and transition: all count', `<= ${c.reactMaxMs} ms, 0`],
    ['R11', 'required', 'infinite animations running in the first viewport', `<= ${c.ambientMax}`],
    ['R12', 'required', 'horizontal overflow', 'none'],
    ['R13', 'required', 'logo per route; home brand-asset images; home hero character images', `logo >= 1, brand >= ${c.brandHome} if brandAssetPatterns set, character >= ${c.characterHome} if characterPatterns set`],
    ['R14', 'required', 'deletion guard: peak element and image counts per route@viewport (needs --prev; --rebase resets a route)', `drop <= ${pc(c.declineMax)}`],
    ['R15', 'MAJOR', 'decorative aria-hidden image on top of a button/input center point', '0'],
    ['R16', 'required', 'WCAG 2.2.2: infinite animations need [data-motion-toggle]; every ticker needs a stop button', 'infinite 0 or toggle present, tickers without stop 0'],
    ['R17', 'required', 'cards with a visual (image, svg >= 96 px, background image); N/A under 3 cards', `>= ${pc(c.cardVisualRatio)}`],
    ['R18', 'required', 'generated images placed (home); only when imageTool is connected', `>= ${c.generatedHome} matching ${c.generatedPathRe}`],
    ['R19', 'required', 'hydration marker (home): html.m-on or [data-hydrated]', 'present'],
    ['R20', 'required', 'hydration console errors per route', '0'],
    ['R21', 'required', 'touch targets at the 393 viewport (inline text links exempt) and alt text on non-decorative images (missing alt, filename-like alt, unlabeled role=img)', `target >= ${c.touchMin} px both sides, missing alt 0`],
    ['RICH-GRAY', 'required', 'richness: empty gray area / visual slot area (media >= 80 px and empty leaf boxes with a solid fill; broken images count as gray)', `<= ${pc(c.emptyGrayMax)} at 393/1024/1440/1920`],
    ['RICH-ITEMS', 'required', 'richness: items in the largest repeated card/row group on a list or sort view; N/A when the route has neither', `>= ${c.sortViewMin}`],
    ['RICH-FEATURES', 'required', 'richness: standard features present across routes (search, filter, favorites, keyboard shortcuts, empty+loading+error states, 404 status on an unknown path, deep-link that resolves)', `>= ${c.standardFeatures}/7`],
    ['A1', 'advisory', 'eyebrow label ratio over h2 (home)', `>= ${c.eyebrowRatio}`],
    ['A2', 'advisory', 'bold large numeric elements (home)', '>= 1'],
    ['A3', 'advisory', 'page not fully scrolled (maxScrollSteps reached)', 'none'],
    ['A4', 'advisory', 'cards with a left-border-only accent (full run only)', `<= ${c.leftAccentMax}`],
    ['A5', 'advisory', 'share of text blocks with text-align center (full run only)', `<= ${pc(c.centeredMax)}`],
  ];
  const lines = ['ID | level | measures | threshold', '-- | -- | -- | --', ...rows.map((r) => r.join(' | '))];
  lines.push('', 'Viewports: ' + c.viewports.join('/') + ' plus 1440 reduced-motion (full run). Richness (RICH-*) shares the same capture.');
  lines.push('Exit codes: 0 pass, 1 required check failed, 2 tool or config defect, 3 measurer unavailable (playwright or browser missing).');
  lines.push('Flags: --base|--url U, --config F, --routes a,b, --viewports 393,1440, --out P, --prev F, --rebase a,b (a route list is required), --only richness, --explain.');
  lines.push('Config (design/uplift-gate.json, every key optional, unknown keys warn): ' + Object.keys(DEFAULTS).join(', ') + '.');
  lines.push('Config notes: routes must list every screen route; imageTool is connected|needs_auth|none|unknown (R18 runs only when connected); animNamesHome 0 makes R8 N/A; ambientMax 0 allows no infinite animation; emptyGrayMax is a fraction; waive maps "R<n>[@route]" to a PRD:|BRAND:|A11Y:|CARD:|STRUCT: basis.');
  lines.push('Run: one route at four viewports takes about a minute and a half, so a full run takes minutes; run it in the background or with a 600 s timeout, and pass --prev on every run after the first.');
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const base = (args.url || args.base || 'http://localhost:3000').replace(/\/$/, '');
  const { cfg, cfgPath } = loadConfig(args);
  if (args.explain) { console.log(explain(cfg)); return; }
  if (args.only !== undefined && args.only !== 'richness') throw new Error(`--only accepts: richness (got ${args.only})`);
  const onlyRich = args.only === 'richness';
  // Git Bash rewrites any argument starting with "/" into its install dir (<drive>/Program Files/Git/...).
  const gitFix = (s) => s.replace(/^[A-Za-z]:[\\/]Program Files[\\/]Git(?=[\\/]|$)/, '').replace(/\\/g, '/') || '/';
  const cliList = (v) => String(v).split(',').map((s) => gitFix(s.trim())).filter(Boolean);
  const norm = (p) => (p.length > 1 ? p.replace(/[/]+$/, '') : p);
  const checkRoutes = (list) => {
    if (!list.length) throw new Error('routes is empty');
    for (const r of list) if (!r.startsWith('/')) throw new Error(`route must start with /: ${r}`);
  };
  checkRoutes(cfg.routes);
  const home = cfg.homeRoute || (cfg.routes.includes('/') ? '/' : cfg.routes[0]);
  if (!cfg.routes.some((r) => norm(r) === norm(home))) throw new Error(`homeRoute ${home} not in routes [${cfg.routes.join(', ')}]`);
  if (!['connected', 'needs_auth', 'none', 'unknown'].includes(cfg.imageTool)) throw new Error(`invalid imageTool: ${cfg.imageTool}`);
  const inRoutes = (r) => cfg.routes.some((x) => norm(x) === norm(r));
  WAIVE = cfg.waive || {};
  for (const [k, v] of Object.entries(WAIVE)) {
    const [id, wr] = k.split('@');
    if (!/^(R([0-9]|1[0-9]|2[01])|A[1-5]|RICH-(GRAY|ITEMS|FEATURES))$/.test(id) || (wr !== undefined && !inRoutes(wr))) throw new Error(`waive key ${k}: unknown rule id or route`);
    if (!/^(PRD|BRAND|A11Y|CARD|STRUCT):.{4,}/.test(String(v))) throw new Error(`waive ${k} needs a basis prefixed PRD:|BRAND:|A11Y:|CARD:|STRUCT: (card Gate D D-2)`);
    if ((id === 'R0' || id === 'R13') && (wr === undefined || !String(v).startsWith('STRUCT:'))) throw new Error(`waive ${k}: ${id} is waivable only per route with a STRUCT: basis`);
  }
  const rebase = new Set(args.rebase ? cliList(args.rebase).map(norm) : []);
  for (const r of rebase) if (!inRoutes(r)) throw new Error(`--rebase route not in routes: ${r}`);
  if (args.routes) { cfg.routes = cliList(args.routes); checkRoutes(cfg.routes); }
  if (args.viewports) cfg.viewports = String(args.viewports).split(',').map(Number);
  const partial = !!(args.routes || args.viewports);
  const nav = async (pg, url) => {
    let resp;
    try { resp = await pg.goto(url, { waitUntil: 'load', timeout: cfg.navTimeoutMs }); } catch (e) {
      return { status: () => 599, navError: String((e && e.message) || e).split('\n')[0].slice(0, 140) };
    }
    await pg.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
    await pg.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    return resp;
  };
  const hydrationRe = /hydrat|did not match|Minified React error #(418|423|425)/i;
  const nextOut = () => {
    let n = 0;
    try { for (const f of fs.readdirSync('smoke-results')) { const mm = /^design-gate-c(\d+)\.json$/.exec(f); if (mm) n = Math.max(n, Number(mm[1])); } } catch {}
    return `smoke-results/design-gate-c${n + 1}`;
  };
  const out = args.out || nextOut();
  const prevMissing = !!(args.prev && !fs.existsSync(args.prev));
  const prev = args.prev && !prevMissing ? JSON.parse(fs.readFileSync(args.prev, 'utf8').replace(/^﻿/, '')) : null;
  const peak = { ...((prev && (prev.peak || prev.counts)) || {}) };

  const pw = loadPlaywright();
  const exe = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || process.env.CHROME_PATH;
  // Headless with a throwaway profile only; never attach to a user browser profile.
  let browser;
  try { browser = await pw.chromium.launch({ headless: true, ...(exe ? { executablePath: exe } : {}) }); } catch (e) {
    throw new MeasurerUnavailable(`browser launch failed: ${String((e && e.message) || e).split('\n')[0].slice(0, 200)}`);
  }
  const results = [];
  const counts = {};
  const consoleErrors = [];
  try {
    for (const vw of cfg.viewports) {
      const mobile = vw < 768;
      const ctx = await browser.newContext({ viewport: { width: vw, height: mobile ? 844 : 900 }, deviceScaleFactor: 1 });
      await ctx.addInitScript(() => { window.__an = new Set(); addEventListener('animationstart', (e) => { if (e.animationName) window.__an.add(e.animationName); }, true); });
      const page = await ctx.newPage();
      let routeErrors = [];
      const feat = {}; let deep = null; let richSeen = false;
      const onErr = (t) => { routeErrors.push(t); if (consoleErrors.length < 20) consoleErrors.push(`${vw} ${t.slice(0, 160)}`); };
      page.on('console', (m) => { if (m.type() === 'error') onErr(m.text()); });
      page.on('pageerror', (e) => onErr(String(e && e.message ? e.message : e)));
      for (const route of cfg.routes) {
        const isHome = norm(route) === norm(home);
        routeErrors = [];
        const resp = await nav(page, base + route);
        if (resp && resp.status() >= 400 && (resp.navError || !WAIVE[`R0@${route}`])) {
          rule(results, 'R0', 'required', route, vw, false, resp.navError ? `navigation error: ${resp.navError}` : `HTTP ${resp.status()}`, '< 400', resp.navError ? 'server down or route stalled; fix the app' : 'update routes in design/uplift-gate.json');
          continue;
        }
        let top; let occ; let hidden; let capped; let m; let a11y; let rich;
        try {
          await page.waitForTimeout(cfg.settleMs);
          if (onlyRich) {
            ({ capped } = await scrollThrough(page, cfg.scrollStepMs, false, cfg.maxScrollSteps, true));
          } else {
            top = await page.evaluate(measureTop, cfg);
            ({ occ, hidden, capped } = await scrollThrough(page, cfg.scrollStepMs, true, cfg.maxScrollSteps));
            m = await page.evaluate(measurePage, cfg);
            a11y = await page.evaluate(measureA11y, cfg);
          }
          rich = await page.evaluate(measureRichness, cfg);
        } catch (e) {
          rule(results, 'R0', 'required', route, vw, false, `measure error: ${String((e && e.message) || e).split('\n')[0].slice(0, 120)}`, 'measured', 'page or measurer error; fix per card Gate D D-2');
          continue;
        }
        console.log(`measured ${route} @${vw}`);
        richSeen = true;
        for (const k of FEATURES) if (rich.features[k]) feat[k] = true;
        if (!deep && rich.deeplink) deep = rich.deeplink;
        const emitRich = () => {
          rule(results, 'RICH-GRAY', 'required', route, vw, rich.grayRatio <= cfg.emptyGrayMax, `${(rich.grayRatio * 100).toFixed(1)}% (${rich.slots} slots)`, `<= ${Math.round(cfg.emptyGrayMax * 100)}%`);
          rule(results, 'RICH-ITEMS', 'required', route, vw, rich.isList ? rich.items >= cfg.sortViewMin : null, rich.isList ? `${rich.items} items${rich.sort ? ', sort control' : ''}` : 'N/A (no list or sort view)', `>= ${cfg.sortViewMin}`);
        };
        if (onlyRich) { emitRich(); continue; }
        if (capped) rule(results, 'A3', 'advisory', route, vw, false, `scroll capped at ${cfg.maxScrollSteps} steps`, 'whole page scrolled', 'long or infinite page: measured up to the cap only');
        const key = `${route}@${vw}`;
        const cur = { elements: m.elementCount, imgs: m.imgCount };
        counts[key] = cur;
        const p = peak[key];
        peak[key] = !p || rebase.has(norm(route)) ? cur : { elements: Math.max(p.elements, cur.elements), imgs: Math.max(p.imgs, cur.imgs) };
        const T = (d, mo) => (mobile ? mo : d);
        rule(results, 'R1', 'required', route, vw, top.hasHero && top.coverage >= T(cfg.heroCoverage.desktop, cfg.heroCoverage.mobile) && (cfg.heroAllowVector || top.raster >= 1), `${top.coverage.toFixed(2)} (raster ${top.raster})`, `>= ${T(cfg.heroCoverage.desktop, cfg.heroCoverage.mobile)}${cfg.heroAllowVector ? '' : ', raster >= 1'}`, top.hasHero ? '' : 'no visible h1/hero');
        rule(results, 'R2', 'required', route, vw, m.broken.length === 0 && m.placeholders.length === 0, `broken ${m.broken.length}, placeholder ${m.placeholders.length}`, '0, 0', [...m.broken, ...m.placeholders].join(' | '));
        rule(results, 'R3', 'required', route, vw, m.h1Ratio >= T(cfg.h1Ratio.desktop, cfg.h1Ratio.mobile) && (m.h2 === 0 || m.h2Ratio >= T(cfg.h2Ratio.desktop, cfg.h2Ratio.mobile)), `h1 ${m.h1Ratio.toFixed(2)}x, h2 ${m.h2Ratio.toFixed(2)}x (body ${m.base}px)`, `h1 >= ${T(cfg.h1Ratio.desktop, cfg.h1Ratio.mobile)}x, h2 >= ${T(cfg.h2Ratio.desktop, cfg.h2Ratio.mobile)}x`);
        const [sMin, sUniq] = isHome ? cfg.shadows.home : cfg.shadows.other;
        rule(results, 'R4', 'required', route, vw, m.shadowCount >= sMin && m.shadowUnique >= sUniq, `${m.shadowCount} / ${m.shadowUnique}`, `>= ${sMin} / ${sUniq}`);
        if (isHome) {
          const r = m.rhythm;
          rule(results, 'R5', 'required', route, vw, r.unique >= cfg.rhythm.unique && r.adjacentSame <= cfg.rhythm.adjacentSame && r.dark >= cfg.rhythm.darkMin && r.dark <= cfg.rhythm.darkMax, `blocks ${r.blocks}, unique ${r.unique}, adjacent ${r.adjacentSame}, dark ${r.dark}`, `unique >= ${cfg.rhythm.unique}, adjacent <= ${cfg.rhythm.adjacentSame}, dark ${cfg.rhythm.darkMin}-${cfg.rhythm.darkMax}`);
          if (cfg.animNamesHome === 0) rule(results, 'R8', 'required', route, vw, null, 'N/A', 'animNamesHome 0');
          else rule(results, 'R8', 'required', route, vw, top.animNames.length >= cfg.animNamesHome, `${top.animNames.length} (${top.animNames.slice(0, 8).join(', ')})`, `>= ${cfg.animNamesHome}`);
          rule(results, 'R19', 'required', route, vw, m.hydrated, m.hydrated ? 'yes' : 'no', 'html.m-on or [data-hydrated]');
          if (cfg.imageTool === 'connected') rule(results, 'R18', 'required', route, vw, m.genImgs >= cfg.generatedHome, m.genImgs, `>= ${cfg.generatedHome} from ${cfg.generatedPathRe}`);
          else rule(results, 'R18', 'required', route, vw, null, 'N/A', `imageTool ${cfg.imageTool}`);
          rule(results, 'A1', 'advisory', route, vw, m.eyebrowRatio === null ? null : m.eyebrowRatio >= cfg.eyebrowRatio, m.eyebrowRatio === null ? 'no h2' : m.eyebrowRatio.toFixed(2), `>= ${cfg.eyebrowRatio}`);
          rule(results, 'A2', 'advisory', route, vw, m.numeric >= 1, m.numeric, '>= 1');
        }
        const pMin = isHome ? cfg.patterns.home : cfg.patterns.other;
        rule(results, 'R6', 'required', route, vw, m.patternCount + m.textureCount >= pMin && m.rootPattern, `pattern ${m.patternCount}, texture ${m.textureCount}, root ${m.rootPattern ? 'yes' : 'no'}, watermark ${m.watermark}`, `pattern+texture >= ${pMin}, root pattern`);
        const dMin = isHome ? cfg.textDepth.home : cfg.textDepth.other;
        rule(results, 'R7', 'required', route, vw, m.textDepth >= dMin, m.textDepth, `>= ${dMin}`);
        rule(results, 'R10', 'required', route, vw, m.maxTransition <= cfg.reactMaxMs && m.transitionAll === 0, `max ${Math.round(m.maxTransition)}ms, all ${m.transitionAll}`, `<= ${cfg.reactMaxMs}ms, 0`, m.slow.join(' | '));
        rule(results, 'R11', 'required', route, vw, top.ambientTop <= cfg.ambientMax, top.ambientTop, `<= ${cfg.ambientMax}`);
        rule(results, 'R12', 'required', route, vw, !m.overflow, m.overflow ? 'overflow' : 'ok', 'no horizontal overflow');
        rule(results, 'R9', 'required', route, vw, hidden.length === 0, `hidden in view ${hidden.length}`, '0', hidden.join(' | '));
        const brandCheck = isHome && cfg.brandAssetPatterns.length > 0;
        const charCheck = isHome && cfg.characterPatterns.length > 0;
        rule(results, 'R13', 'required', route, vw, m.logoImgs >= 1 && (!brandCheck || m.brandImgs >= cfg.brandHome) && (!charCheck || top.heroChars >= cfg.characterHome),
          `logo ${m.logoImgs}, brand ${m.brandImgs === null ? 'N/A' : m.brandImgs}${charCheck ? `, hero character ${top.heroChars}` : ''}`,
          `logo >= 1${brandCheck ? `, brand >= ${cfg.brandHome}` : ''}${charCheck ? `, hero character >= ${cfg.characterHome}` : ''}`);
        rule(results, 'R15', 'major', route, vw, occ.length === 0, occ.length, '0', occ.slice(0, 4).join(' | '));
        rule(results, 'R16', 'required', route, vw, (m.infiniteAnims === 0 || m.motionToggle) && m.tickerNoStop === 0, `infinite ${m.infiniteAnims}, toggle ${m.motionToggle ? 'yes' : 'no'}, ticker w/o stop ${m.tickerNoStop}`, 'infinite 0 or [data-motion-toggle]; every ticker has a stop button');
        rule(results, 'R17', 'required', route, vw, m.cards < 3 ? null : m.cardsVis / m.cards >= cfg.cardVisualRatio, `${m.cardsVis}/${m.cards}`, `>= ${Math.round(cfg.cardVisualRatio * 100)}% of cards have a visual (cards >= 3)`);
        const hyd = routeErrors.filter((t) => hydrationRe.test(t));
        rule(results, 'R20', 'required', route, vw, hyd.length === 0, hyd.length, '0', hyd.length ? hyd[0].slice(0, 140) : '');
        rule(results, 'R21', 'required', route, vw, a11y.small === 0 && a11y.noAlt === 0, `${a11y.touch ? `touch <${cfg.touchMin}px ${a11y.small}/${a11y.total}` : 'touch n/a (393 only)'}, alt missing ${a11y.noAlt}`, `touch >= ${cfg.touchMin}px (393), alt missing 0`, [...a11y.smallSamples, ...a11y.noAltSamples].join(' | '));
        emitRich();
        rule(results, 'A4', 'advisory', route, vw, rich.leftAccent <= cfg.leftAccentMax, rich.leftAccent, `<= ${cfg.leftAccentMax}`);
        rule(results, 'A5', 'advisory', route, vw, rich.centeredRatio === null ? null : rich.centeredRatio <= cfg.centeredMax, rich.centeredRatio === null ? 'no text' : rich.centeredRatio.toFixed(2), `<= ${cfg.centeredMax}`);
        if (prev && p && !rebase.has(norm(route))) {
          const dropE = p.elements ? (p.elements - m.elementCount) / p.elements : 0;
          const dropI = p.imgs ? (p.imgs - m.imgCount) / p.imgs : 0;
          rule(results, 'R14', 'required', route, vw, dropE <= cfg.declineMax && dropI <= cfg.declineMax, `peak elements ${p.elements}->${m.elementCount}, imgs ${p.imgs}->${m.imgCount}`, `drop <= ${cfg.declineMax * 100}%`);
        }
      }
      if (richSeen) {
        const probe = async (p) => { try { return (await ctx.request.get(new URL(p, base).href, { maxRedirects: 3, timeout: 10000 })).status(); } catch { return 599; } };
        feat.notfound = (await probe('/__design-gate-404-probe__')) === 404;
        if (feat.deeplink) feat.deeplink = !!deep && (await probe(deep)) < 400;
        const have = FEATURES.filter((k) => feat[k]);
        rule(results, 'RICH-FEATURES', 'required', '*', vw, have.length >= cfg.standardFeatures, `${have.length}/${FEATURES.length} (missing: ${FEATURES.filter((k) => !feat[k]).join(',') || 'none'})`, `>= ${cfg.standardFeatures}/${FEATURES.length}`);
      }
      await ctx.close();
    }
    if (!onlyRich) {
    const rctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const rpage = await rctx.newPage();
    for (const route of cfg.routes) {
      const resp = await nav(rpage, base + route);
      if (resp && resp.status() >= 400 && (resp.navError || !WAIVE[`R0@${route}`])) continue;
      let running; let hidden;
      try {
        await rpage.waitForTimeout(1500);
        running = await rpage.evaluate(() => (document.getAnimations ? document.getAnimations() : []).filter((a) => a.playState === 'running' && a.effect && a.effect.getTiming && Number(a.effect.getTiming().duration) > 0).map((a) => a.animationName || 'waapi'));
        ({ hidden } = await scrollThrough(rpage, cfg.scrollStepMs, false, cfg.maxScrollSteps));
      } catch (e) {
        rule(results, 'R0', 'required', route, '1440-reduce', false, `measure error: ${String((e && e.message) || e).split('\n')[0].slice(0, 120)}`, 'measured', 'page or measurer error; fix per card Gate D D-2');
        continue;
      }
      rule(results, 'R9', 'required', route, '1440-reduce', running.length === 0 && hidden.length === 0, `running ${running.length}, hidden ${hidden.length}`, '0, 0', [...new Set(running)].slice(0, 6).join(', ') + (hidden.length ? ' | ' + hidden.join(' | ') : ''));
    }
    await rctx.close();
    }
  } finally {
    await browser.close();
  }

  if (prevMissing && !onlyRich) rule(results, 'R14', 'required', '*', '*', false, `--prev not found: ${args.prev}`, 'previous cycle json');
  const scored = results.filter((r) => r.pass !== null);
  const req = scored.filter((r) => r.level === 'required');
  if (!req.length) throw new Error('no scored required checks (everything waived or N/A)');
  const reqFail = req.filter((r) => !r.pass);
  const major = scored.filter((r) => r.level === 'major' && !r.pass);
  const adv = scored.filter((r) => r.level === 'advisory' && !r.pass);
  const na = results.filter((r) => r.pass === null);
  const verdict = (reqFail.length === 0 ? 'PASS' : 'FAIL') + (partial ? ' (partial)' : '') + (onlyRich ? ' (richness)' : '');
  const r14Note = prevMissing ? `skipped (--prev not found: ${args.prev})` : prev ? `compared with peak from ${args.prev}${rebase.size ? `, rebased ${[...rebase].join(',')}` : ''}` : 'skipped (no --prev)';
  const waived = Object.entries(WAIVE).map(([k, v]) => `${k}: ${v}`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(`${out}.json`, JSON.stringify({ base, verdict, partial, only: onlyRich ? 'richness' : null, config: cfgPath, routes: cfg.routes, viewports: cfg.viewports, results, counts, peak, waived, consoleErrors }, null, 2));
  const row = (r) => `| ${r.id} | ${r.level} | ${r.route} | ${r.vw} | ${r.pass === null ? 'N/A' : r.pass ? 'PASS' : 'FAIL'} | ${String(r.value).replace(/\|/g, '/')} | ${r.expect} | ${String(r.note).replace(/\|/g, '/').slice(0, 160)} |`;
  const head = '| ID | 등급 | 라우트 | 뷰포트 | 판정 | 값 | 기준 | 메모 |\n|--|--|--|--|--|--|--|--|';
  const md = [
    `# 디자인 업리프트 게이트 — ${verdict}`,
    '',
    `- 대상: ${base} · 라우트 ${cfg.routes.length}개 · 뷰포트 ${cfg.viewports.join('/')}${onlyRich ? ' · richness only' : ' + 1440 reduced-motion'}`,
    `- 필수 ${req.length - reqFail.length}/${req.length} 통과 · MAJOR 실패 ${major.length} · 참고 미달 ${adv.length} · N/A ${na.length}`,
    `- config: ${cfgPath || 'defaults (routes ["/"], R13 brand·R18 off)'} · R14: ${r14Note}${partial ? ' · partial run (--routes/--viewports): not a gate verdict' : ''}`,
    waived.length ? `- 면제: ${waived.join(' / ')}` : '- 면제 없음',
    consoleErrors.length ? `- 콘솔 오류 ${consoleErrors.length}건(첫 줄: ${consoleErrors[0]})` : '- 콘솔 오류 0건',
    '',
    '## 필수 실패',
    reqFail.length ? head + '\n' + reqFail.map(row).join('\n') : '없음',
    '',
    '## MAJOR·참고',
    major.length + adv.length ? head + '\n' + [...major, ...adv].map(row).join('\n') : '없음',
    '',
    '## 전체',
    head + '\n' + results.map(row).join('\n'),
    '',
  ].join('\n');
  fs.writeFileSync(`${out}.md`, md);
  console.log(`${verdict} required ${req.length - reqFail.length}/${req.length}, major ${major.length}, advisory ${adv.length} -> ${out}.md`);
  console.log(`config ${cfgPath || 'defaults'} · R14 ${r14Note}${waived.length ? ` · waived ${waived.length}` : ''}`);
  process.exit(reqFail.length === 0 ? 0 : 1);
}

main().catch((e) => {
  if (e instanceof MeasurerUnavailable) { console.error('design-gate measurer unavailable:', e.message); process.exit(3); }
  console.error('design-gate error:', e && e.stack ? e.stack : e);
  process.exit(2);
});
