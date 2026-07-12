import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../src/data/skills.json');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Failed to parse ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching skills index...');
  const index = await fetch('https://lu4db.ru/api/skills');

  const classIds = [];
  for (const section of index.sections) {
    for (const cls of section.classes) {
      classIds.push({ id: cls.id, slug: cls.slug, name: cls.name, race: section.title });
    }
  }

  console.log(`Found ${classIds.length} classes. Fetching skills for each...\n`);

  const result = {};
  for (const cls of classIds) {
    process.stdout.write(`  [${cls.id.padStart(3)}] ${cls.name.padEnd(22)} `);
    try {
      const data = await fetch(`https://lu4db.ru/api/skills/classes/${cls.id}`);
      result[cls.name] = {
        id: cls.id,
        slug: cls.slug,
        race: cls.race,
        className: data.name,
        skills: [...(data.active || []), ...(data.passive || [])].map(s => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          type: s.kind || 'active',
          subtype: s.subtype || '',
          firstClassLevel: s.firstClassLevel || 0,
          imageUrl: s.imageUrl || '',
          stats: (s.stats || []).map(st => ({ label: st.label, text: st.text })),
          levels: (s.levels || []).map(l => ({
            skillLevel: l.skillLevel,
            classLevel: l.classLevel,
            changes: l.changes || [],
          })),
          maxLevel: (s.levels || []).length,
        })),
      };
      console.log(`✓ ${result[cls.name].skills.length} skills`);
    } catch (e) {
      console.log(`✗ FAILED: ${e.message}`);
    }
  }

  fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(`\nDone! Wrote ${Object.keys(result).length} classes → ${OUT}`);
}

main().catch(console.error);
