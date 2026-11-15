import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const [out, ...srcs] = process.argv.slice(2);
if (!out || !srcs.length) {
  console.log('usage: node export-dc-pdf.mjs <out.pdf> <Main.dc.html|page.html> [...]');
  process.exit(2);
}
const outPdf = resolve(out);
if (!/\.pdf$/i.test(outPdf)) {
  console.log('output name must end in .pdf');
  process.exit(2);
}
mkdirSync(dirname(outPdf), { recursive: true });
const links = new Set(), styles = [], pages = [];
for (const src of srcs) {
  const dc = readFileSync(src, 'utf8');
  const a = dc.indexOf('<x-dc>');
  let body = a >= 0 ? dc.slice(a + 6, dc.indexOf('</x-dc>')) : (dc.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [, dc])[1].replace(/<script[\s\S]*?<\/script>/gi, '');
  const helmet = (body.match(/<helmet>([\s\S]*?)<\/helmet>/) || [, ''])[1];
  for (const l of helmet.match(/<link[^>]*>/g) || []) links.add(l);
  for (const s of helmet.match(/<style>([\s\S]*?)<\/style>/g) || []) styles.push(s);
  pages.push(body.replace(/<helmet>[\s\S]*?<\/helmet>/, ''));
}
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">${[...links].join('')}
<style>@page{size:794px 1123px;margin:0}html,body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}.pg{width:794px;height:1123px;overflow:hidden;break-after:page}.pg:last-child{break-after:auto}</style>
${styles.join('\n')}</head><body>${pages.map((p) => `<div class="pg">${p}</div>`).join('')}</body></html>`;
const htmlPath = outPdf.replace(/\.pdf$/i, '.html');
writeFileSync(htmlPath, html);

const env = process.env;
const roots = [env.ProgramFiles, env['ProgramFiles(x86)'], env.LOCALAPPDATA].filter(Boolean);
const winBins = roots.flatMap((r) => [
  join(r, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  join(r, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  join(r, 'Chromium', 'Application', 'chrome.exe'),
]);
const macBins = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  join(homedir(), 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
];
const linuxBins = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/microsoft-edge', '/snap/bin/chromium'];
const pwRoots = [join(homedir(), '.cache', 'ms-playwright'), env.LOCALAPPDATA && join(env.LOCALAPPDATA, 'ms-playwright')].filter((p) => p && existsSync(p));
const pwBins = pwRoots.flatMap((r) => readdirSync(r).flatMap((d) => ['chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome-linux/headless_shell', 'chrome-win/chrome.exe', 'chrome-win64/chrome.exe'].map((b) => join(r, d, b))));
const chrome = [env.CHROME, ...winBins, ...macBins, ...linuxBins, ...pwBins].find((p) => p && existsSync(p));
if (!chrome) {
  console.log('NO_BROWSER: no Chrome/Edge/Chromium found (set CHROME to a browser executable). html only ->', htmlPath);
  process.exit(3);
}
const profile = mkdtempSync(join(tmpdir(), 'contract-review-pdf-'));
const args = ['--headless=new', '--disable-gpu', `--user-data-dir=${profile}`, '--virtual-time-budget=15000', '--no-pdf-header-footer', `--print-to-pdf=${outPdf}`, pathToFileURL(htmlPath).href];
if (process.platform === 'linux') args.unshift('--no-sandbox');
try {
  execFileSync(chrome, args, { stdio: 'ignore' });
} finally {
  rmSync(profile, { recursive: true, force: true });
}
const pdf = readFileSync(outPdf).toString('latin1');
console.log('browser', chrome);
console.log('pages', (pdf.match(/\/Type\s*\/Page[^s]/g) || []).length, 'bytes', pdf.length, 'html', htmlPath);
