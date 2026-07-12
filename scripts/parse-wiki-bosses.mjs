import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── 1. Parse lu4db HTML (location, respawn) ──────────────────────────────
const lu4html = readFileSync('/tmp/lu4db_bosses.html', 'utf-8');

// Extract the <ul> content
const ulMatch = lu4html.match(/<ul[^>]*>([\s\S]*?)<\/ul>/);
const listHtml = ulMatch ? ulMatch[1] : '';

// Parse each <li> item
const liRegex = /<li>([\w\s',.\-]+?)\s*<span[^>]*>\(ур\.\s*(\d+),\s*([^)]+)\)<\/span>\s*[—–]\s*([^<]+)<\/li>/g;
const lu4Bosses = {};
let liMatch;

while ((liMatch = liRegex.exec(listHtml)) !== null) {
  let name = liMatch[1].trim();
  // Remove trailing "Raid Boss" if present (but keep name parts)
  name = name.replace(/\s+Raid Boss$/, '').trim();
  const level = parseInt(liMatch[2], 10);
  const respawn = liMatch[3].trim();
  const location = liMatch[4].trim();
  
  const key = name.toLowerCase().replace(/[^a-z0-9']/g, '').replace(/'s/g, 's');
  lu4Bosses[key] = { name, level, respawn, location };
}

console.log(`Lu4: ${Object.keys(lu4Bosses).length} bosses`);

// ── 2. Parse wiki article (stats, drops) ─────────────────────────────────
const wikiHtml = readFileSync('/Users/prysya/.local/share/opencode/tool-output/tool_f582190c6001bccuG752XBVGju', 'utf-8');

const startIdx = wikiHtml.indexOf('Level 20-24');
const content = wikiHtml.slice(startIdx);

const sections = content.split(/\n(?=[\w\s'-]+(?:Raid Boss|Epic Boss|Queen of Underground)\s*\n\s*Lv\.\s+\d+)/);

const wikiBosses = [];

for (const section of sections) {
  const nameMatch = section.match(/^([\w\s'-]+?)\s*(?:Raid Boss|Epic Boss|Queen of Underground)/);
  if (!nameMatch) continue;

  const rawName = nameMatch[1].trim().replace(/\s+/g, ' ').trim();
  const levelMatch = section.match(/Lv\.\s+(\d+)/);
  if (!levelMatch) continue;
  const level = parseInt(levelMatch[1], 10);

  const entry = { name: rawName, level };

  const extract = (label) => {
    const re = new RegExp(label + '\\s*\\n\\s*([\\d\\s]+?)\\n');
    const m = section.match(re);
    return m ? m[1].trim().replace(/\s+/g, '') : null;
  };

  entry.stats = {
    hp: extract('HP'),
    mp: extract('MP'),
    pAtk: extract('P\\. Atk\\.'),
    mAtk: extract('M\\. Atk\\.'),
    pDef: extract('P\\. Def\\.'),
    mDef: extract('M\\. Def\\.'),
    exp: extract('Exp'),
    sp: extract('SP'),
  };

  const atkAttrMatch = section.match(/Attack Attribute\s*\n\s*(\w+)/);
  if (atkAttrMatch) entry.stats.atkAttr = atkAttrMatch[1].trim();
  
  const defAttrMatch = section.match(/Defense Attribute\s*\n\s*([^\n]+)/);
  if (defAttrMatch) entry.stats.defAttr = defAttrMatch[1].trim();

  // Drop parsing
  const drops = [];
  const dropSection = section.match(/Drop\s*\n([\s\S]*?)(?=\n\n\n|\n\n$|$)/);
  
  if (dropSection) {
    const dropText = dropSection[1];
    const groups = dropText.split(/(?=Group Chance:)/g).filter(g => g.trim());
    
    for (const group of groups) {
      const gcMatch = group.match(/Group Chance: ([\d.]+)%/);
      if (!gcMatch) continue;
      const groupChance = parseFloat(gcMatch[1]);

      const items = [];
      const lines = group.split('\n').map(l => l.trim()).filter(l => l);
      
      let i = 0;
      while (i < lines.length) {
        if (['Group Chance', 'Item', 'Amount', 'Chance'].some(p => lines[i].startsWith(p))) {
          i++;
          continue;
        }
        
        if (i + 3 < lines.length) {
          const nameLine = lines[i];
          const gradeLine = lines[i + 1];
          const amountLine = lines[i + 2];
          const chanceLine = lines[i + 3];
          
          if (/^[\d\s-]+$/.test(amountLine) && /^[\d.]+%$/.test(chanceLine)) {
            items.push({
              name: nameLine,
              grade: gradeLine,
              amount: amountLine.includes('-') ? amountLine.split('-').map(s => s.trim()).join(' - ') : amountLine.trim(),
              chance: parseFloat(chanceLine.replace('%', '')),
            });
            i += 4;
            continue;
          }
        }
        i++;
      }

      if (items.length > 0) drops.push({ groupChance, items });
    }
  }

  if (drops.length > 0) entry.drops = drops;
  wikiBosses.push(entry);
}

console.log(`Wiki: ${wikiBosses.length} bosses`);

// ── 3. Merge ─────────────────────────────────────────────────────────────
function normalize(name) {
  return name.toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9']/g, '')
    .replace(/'s/g, 's');
}

const usedLu4 = new Set();
const merged = [];

for (const wiki of wikiBosses) {
  const wikiKey = normalize(wiki.name);
  
  let match = lu4Bosses[wikiKey];
  if (!match) {
    // Fuzzy match - try partial includes
    for (const [k, v] of Object.entries(lu4Bosses)) {
      if (k.includes(wikiKey) || wikiKey.includes(k)) {
        match = v;
        break;
      }
    }
  }

  if (match) usedLu4.add(normalize(match.name));

  merged.push({
    name: wiki.name,
    level: wiki.level,
    stats: wiki.stats,
    respawn: match?.respawn || null,
    location: match?.location || null,
    drops: wiki.drops || null,
  });
}

// Add unmatched lu4 bosses (like Zaken which isn't in wiki article)
for (const [key, b] of Object.entries(lu4Bosses)) {
  if (!usedLu4.has(key)) {
    merged.push({
      name: b.name,
      level: b.level,
      stats: null,
      respawn: b.respawn,
      location: b.location,
      drops: null,
    });
    console.log(`Lu4-only: ${b.name} (lv ${b.level})`);
  }
}

merged.sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));

writeFileSync(join(__dirname, '..', 'src', 'data', 'RAIDBOSSES.json'), JSON.stringify(merged, null, 2));
console.log(`\nFinal: ${merged.length} bosses`);
console.log(`With stats: ${merged.filter(b => b.stats?.hp).length}`);
console.log(`With drops: ${merged.filter(b => b.drops?.length).length}`);
console.log(`With location: ${merged.filter(b => b.location).length}`);
console.log(`With respawn: ${merged.filter(b => b.respawn).length}`);
