import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';

const root = resolve(import.meta.dirname, '..');

const questsJson = resolve(root, 'src/data/quests/QUEST_IMAGES.json');
const imgDir = resolve(root, 'public/images/quests');

const data = JSON.parse(readFileSync(questsJson, 'utf-8'));

const hashToFile = {};
let removedCount = 0;

for (const [quest, files] of Object.entries(data)) {
  const keep = [];
  for (const f of files) {
    const fp = resolve(imgDir, f);
    if (!existsSync(fp)) {
      keep.push(f);
      continue;
    }
    const buf = readFileSync(fp);
    const h = createHash('md5').update(buf).digest('hex');
    if (hashToFile[h] && hashToFile[h] !== f) {
      unlinkSync(fp);
      removedCount++;
      console.log(`  ${f} → ${hashToFile[h]} (same md5, quest: ${quest})`);
      keep.push(hashToFile[h]);
    } else {
      if (!hashToFile[h]) hashToFile[h] = f;
      keep.push(f);
    }
  }
  data[quest] = keep;
}

writeFileSync(questsJson, JSON.stringify(data, null, 2));
console.log(`\nDone. Removed ${removedCount} duplicate files, references updated.`);
