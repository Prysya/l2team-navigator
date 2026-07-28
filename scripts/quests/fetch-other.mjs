import { existsSync } from 'fs';
import { resolve } from 'path';
import { loadQuestIds, loadQuestImages, saveQuestImages, slug, imgDir, tryFetch, extractImages, download } from './shared.mjs';

const ids = loadQuestIds();
const imgs = loadQuestImages();
const dir = imgDir();

// Trial of Geomancer — only non-path/3in1/kusto quest with images
const others = Object.entries(ids).filter(([name]) => name === 'Trial of Geomancer');

for (const [name, id] of others) {
  const url = `https://mw2.wiki/lu4/posts/post/${id}`;
  process.stdout.write(`Other: ${name}... `);
  const html = await tryFetch(url);
  if (!html) { console.log('no page'); continue; }
  const urls = extractImages(html);
  if (!urls.length) { console.log('no images'); continue; }
  const s = slug(name);
  const files = [];
  for (let j = 0; j < urls.length; j++) {
    const ext = urls[j].split('.').pop();
    const fn = `${s}-${j + 1}.${ext}`;
    const fp = resolve(dir, fn);
    if (!existsSync(fp)) {
      const ok = await download(urls[j], fp);
      if (!ok) continue;
    }
    files.push(fn);
  }
  imgs[name] = files;
  console.log(`${files.length} imgs`);
}

saveQuestImages(imgs);
console.log('Other done.');
