import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const root = resolve(import.meta.dirname, '..', '..');

export function loadQuestIds() {
  const txt = readFileSync(resolve(root, 'src/data/quests/questIds.ts'), 'utf-8');
  const map = {};
  for (const line of txt.split('\n')) {
    const m = line.match(/^\s*(['\"])(.+?)\1\s*:\s*(\d+)/);
    if (m) map[m[2]] = parseInt(m[3], 10);
  }
  return map;
}

export function loadQuestImages() {
  try {
    return JSON.parse(readFileSync(resolve(root, 'src/data/quests/QUEST_IMAGES.json'), 'utf-8'));
  } catch { return {}; }
}

export function saveQuestImages(data) {
  writeFileSync(resolve(root, 'src/data/quests/QUEST_IMAGES.json'), JSON.stringify(data, null, 2));
}

export function slug(n) {
  return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function imgDir() {
  const d = resolve(root, 'public/images/quests');
  mkdirSync(d, { recursive: true });
  return d;
}

export async function tryFetch(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const html = await res.text();
    if (!html || html.length < 500) return null;
    return html;
  } catch { return null; }
}

export function extractImages(html) {
  // Only extract images from the #article-content div (quest walkthrough)
  const content = html.match(/<div id="article-content">[\s\S]*?<\/div>\s*<\/div>/i);
  if (!content) return [];
  const imgs = [];
  const regex = /<figure[^>]*>[\s\S]*?<img[^>]*src="(\/(?:upload|file)\/[^"]+\.(?:jpg|png))"[^>]*>[\s\S]*?<\/figure>/gi;
  for (const [, src] of content[0].matchAll(regex)) {
    imgs.push(src);
  }
  return [...new Set(imgs)];
}

export async function download(url, filePath) {
  const res = await fetch(`https://mw2.wiki${url}`, { signal: AbortSignal.timeout(10000) });
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) return false;
  writeFileSync(filePath, buf);
  return true;
}
