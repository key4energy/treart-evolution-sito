// Pagine già pronte per i motori di ricerca: apre il sito appena generato in un browser (Playwright),
// una pagina alla volta con il suo indirizzo vero (/contatti/, /cybersecurity/...), e salva in un file JSON
// titolo, descrizione e contenuto delle parti fisse della pagina. build_hosting.py li usa per scrivere
// un file index.html per ogni pagina. Il sito, aprendosi, ridisegna comunque tutto da sé.
//
// Uso: node prerender.cjs CARTELLA_DEL_SITO FILE_JSON_DI_USCITA
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [, , cartella, out] = process.argv;
if (!cartella || !out) { console.error('uso: node prerender.cjs CARTELLA FILE_JSON'); process.exit(2); }
const dir = path.resolve(cartella);
const ORIGIN = 'http://127.0.0.1:8765';
const PARTI = ['util', 'hdr', 'drawer', 'main', 'ftr', 'fab'];
const TIPI = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json' };
const indice = fs.readFileSync(path.join(dir, 'index.html'));

async function pagina(browser, tok) {
  const ctx = await browser.newContext({ locale: 'it-IT', viewport: { width: 1280, height: 900 } });
  const errori = [];
  // il sito è servito dalla cartella: un file se esiste, altrimenti la pagina principale (come farebbe il server)
  await ctx.route(ORIGIN + '/**', (r) => {
    const p = decodeURIComponent(new URL(r.request().url()).pathname);
    const f = path.join(dir, p);
    if (!p.endsWith('/') && f.startsWith(dir) && fs.existsSync(f) && fs.statSync(f).isFile()) {
      return r.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TIPI[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    }
    return r.fulfill({ status: 200, body: indice, contentType: 'text/html; charset=utf-8' });
  });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errori.push(String(e)));
  await page.goto(ORIGIN + (tok === 'home' ? '/' : `/${tok}/`), { waitUntil: 'load' });
  await page.waitForTimeout(150);
  const dati = await page.evaluate((parti) => ({
    tok: current(),
    title: document.title,
    desc: (document.querySelector('meta[name="description"]') || {}).content || '',
    h1: (document.querySelector('#main h1') || {}).textContent || '',
    parti: Object.fromEntries(parti.map((id) => [id, document.getElementById(id).innerHTML])),
  }), PARTI);
  await ctx.close();
  if (errori.length) throw new Error(`errori nella pagina ${tok}: ${errori.join(' | ')}`);
  if (dati.tok !== tok) throw new Error(`la pagina /${tok}/ si apre come «${dati.tok}»`);
  return dati;
}

(async () => {
  const browser = await chromium.launch();
  // elenco delle pagine, letto dal sito stesso
  const ctx = await browser.newContext();
  await ctx.route(ORIGIN + '/**', (r) => r.fulfill({ status: 200, body: indice, contentType: 'text/html; charset=utf-8' }));
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, (r) => r.abort());
  const p0 = await ctx.newPage();
  await p0.goto(ORIGIN + '/', { waitUntil: 'load' });
  const toks = (await p0.evaluate(() => Object.keys(ROUTES))).filter((t) => t !== '404');
  await ctx.close();
  const pagine = {};
  for (const tok of toks) pagine[tok] = await pagina(browser, tok);
  await browser.close();
  fs.writeFileSync(out, JSON.stringify(pagine));
  console.log(`pagine pronte per i motori di ricerca: ${toks.length}`);
})().catch((e) => { console.error(String(e && e.stack || e)); process.exit(1); });
