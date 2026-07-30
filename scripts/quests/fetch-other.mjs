import { existsSync } from 'fs';
import { resolve } from 'path';
import { loadQuestIds, loadQuestImages, saveQuestImages, slug, imgDir, tryFetch, extractImages, download } from './shared.mjs';

const ids = loadQuestIds();
const imgs = loadQuestImages();
const dir = imgDir();

// Non-path/3in1/kusto quests that have images on mw2.wiki
const others = Object.entries(ids).filter(
  ([name]) =>
    !name.startsWith('Path of ') &&
    !name.startsWith('3 in ') &&
    !(ids[name] >= 87 && ids[name] <= 95),
);

for (const [name, id] of others) {
  const url = `https://mw2.wiki/lu4/posts/post/${id}-${slug(name)}`;
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
