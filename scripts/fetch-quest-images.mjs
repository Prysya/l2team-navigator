import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const txt = readFileSync(resolve(root, 'src/data/quests/questIds.ts'), 'utf-8');
const nameToId = {};
for (const [, name, id] of txt.matchAll(/'([^']+)':\s*(\d+)/g)) {
  nameToId[name] = parseInt(id, 10);
}

function slug(n) {
  return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function tryFetch(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    return res.ok ? res.text() : null;
  } catch { return null; }
}

function extract(html) {
  const imgs = [];
  for (const [, src] of html.matchAll(/<figure[^>]*>[\s\S]*?<img[^>]*src="([^"]+\.(?:jpg|png))"[^>]*>[\s\S]*?<\/figure>/gi)) {
    imgs.push(src);
  }
  return [...new Set(imgs)];
}

async function dl(url, path) {
  const res = await fetch(`https://mw2.wiki${url}`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return false;
  writeFileSync(path, Buffer.from(await res.arrayBuffer()));
  return true;
}

const imgDir = resolve(root, 'public/images/quests');
mkdirSync(imgDir, { recursive: true });
const result = {};
const entries = Object.entries(nameToId);

for (let i = 0; i < entries.length; i++) {
  const [name, id] = entries[i];
  const s = slug(name);

  const questUrl = `https://mw2.wiki/lu4/quest/${id}`;
  const postUrl = `https://mw2.wiki/lu4/posts/post/${id}`;

  process.stdout.write(`[${i + 1}/${entries.length}] ${name}... `);

  let html = await tryFetch(questUrl);
  let source = 'quest';
  if (!html) { html = await tryFetch(postUrl); source = 'post'; }
  if (!html) { console.log('no page'); continue; }

  const urls = extract(html);
  if (!urls.length) { console.log('no images'); continue; }

  const files = [];
  for (let j = 0; j < urls.length; j++) {
    const ext = urls[j].split('.').pop();
    const fn = `${s}-${j + 1}.${ext}`;
    const fp = resolve(imgDir, fn);
    if (!existsSync(fp)) {
      const ok = await dl(urls[j], fp);
      if (!ok) { console.log(`  FAIL: ${urls[j]}`); continue; }
    }
    files.push(fn);
  }

  result[name] = files;
  console.log(`${files.length} imgs [${source}]`);

  await new Promise(r => setTimeout(r, 200));
}

const outPath = resolve(root, 'src/data/quests/QUEST_IMAGES.json');
writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(`\nDone. ${Object.keys(result).length} quests with images.`);
