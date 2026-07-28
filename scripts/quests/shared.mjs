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
    return res.ok ? res.text() : null;
  } catch { return null; }
}

export function extractImages(html) {
  const imgs = [];
  const regex = /<figure[^>]*>[\s\S]*?<img[^>]*src="(\/(?:upload|file)\/[^"]+\.(?:jpg|png))"[^>]*>[\s\S]*?<\/figure>/gi;
  for (const [, src] of html.matchAll(regex)) {
    imgs.push(src);
  }
  return [...new Set(imgs)].slice(0, 5); // max 5 images per quest
}

export async function download(url, filePath) {
  const res = await fetch(`https://mw2.wiki${url}`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return false;
  writeFileSync(filePath, Buffer.from(await res.arrayBuffer()));
  return true;
}
