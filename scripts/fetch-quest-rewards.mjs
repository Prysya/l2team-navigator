/**
 * Fetches current rewards for racial quests from mw2.wiki
 *
 * Usage: node scripts/fetch-quest-rewards.mjs
 *
 * Output: prints old vs new rewards for each quest
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DELAY_MIN = 1000;
const DELAY_MAX = 2000;
const SEMAPHORE = 2;

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

const QUESTS = {
  'Letters of Love': 1,
  'What Women Want': 2,
  'Mass of Darkness': 166,
  "Long Live the Pa'agrio Lord!": 4,
  "Miner's Favor": 5,
  'Deliver Goods': 153,
  'Sacrifice to the Sea': 154,
  'Find Sir Windawood': 155,
  'Deliver Supplies': 168,
  'Fruit of the Mother Tree': 161,
  "Nerupa's Request": 160,
  'The Guard is Busy': 257,
  'Hunt the Orcs': 260,
  'Invaders of the Holy Land': 273,
  'Bonds of Slavery': 265,
  'The Hidden Veins': 293,
  'Collect Spores': 313,
  'Sword of Solidarity': 101,
  'Spirit of Mirrors': 104,
  'Skirmish with the Orcs': 105,
  'Forgotten Truth': 106,
  'Spirit of Craftsman': 103,
  'Merciless Punishment': 107,
  'Jumble, Tumble, Diamond Fuss': 108,
  'Sea of Spores Fever': 102,
  'Totem of the Hestui': 276,
};

function fetchWithRedirect(url, redirects = 0) {
  if (redirects > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        'User-Agent': UA,
        'Accept-Language': 'en',
        Accept: 'text/html,application/xhtml+xml',
      },
    };
    https.get(url, opts, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let next = res.headers.location;
        if (!next.startsWith('http')) {
          next = 'https://mw2.wiki' + next;
        }
        // The redirect may go to /posts/ without /lu4/ prefix — it redirects again
        // Just follow whatever we get
        resolve(fetchWithRedirect(next, redirects + 1));
        return;
      }
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay() {
  return delay(Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1) + DELAY_MIN));
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractItemFromLink(linkHtml) {
  const nameMatch = linkHtml.match(/item-name__class-1[^>]*>([^<]+)</);
  if (!nameMatch) return null;
  return nameMatch[1].trim();
}

function extractPostReward(html) {
  // Find the info table
  const tableMatch = html.match(/<table class="table mb-32"[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) return null;

  // Extract all <tr> from the table
  const trRegex = /<tr>([\s\S]*?)<\/tr>/gi;
  const rows = [];
  let m;
  while ((m = trRegex.exec(tableMatch[0])) !== null) {
    rows.push(m[1]);
  }

  // Find the "Reward" row and any continuation rows (rowspan)
  let rewardHtml = '';
  let capturing = false;
  let rowspanCount = 0;

  for (const row of rows) {
    const tds = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
    if (!tds) continue;

    const firstCellText = stripHtml(tds[0]);

    if (/^Reward/i.test(firstCellText)) {
      capturing = true;
      // Check for rowspan attribute
      const rowspanMatch = tds[0].match(/rowspan\s*=\s*["']?(\d+)["']?/);
      rowspanCount = rowspanMatch ? parseInt(rowspanMatch[1]) - 1 : 0;
      // Add content from second column
      if (tds.length >= 2) {
        rewardHtml += tds.slice(1).join(' ');
      }
      continue;
    }

    if (capturing && rowspanCount > 0) {
      // Continuation row — add all its content
      rewardHtml += ' ' + tds.join(' ');
      rowspanCount--;
      continue;
    }

    if (capturing) break;
  }

  if (!rewardHtml) return null;

  // Extract section labels
  const sections = [];
  const sectionRegex = /<div class="mb-8">([^<]*?:)<\/div>/gi;
  let sm;
  while ((sm = sectionRegex.exec(rewardHtml)) !== null) {
    const label = sm[1].trim();
    if (!/^(Exp|SP|Adena)\s*:/i.test(label)) {
      sections.push(label);
    }
  }

  // Extract item names
  const items = [];
  const itemLinks = rewardHtml.match(/<a[^>]*class="item-name[^"]*"[^>]*>[\s\S]*?<\/a>/gi);
  if (itemLinks) {
    for (const link of itemLinks) {
      const name = extractItemFromLink(link);
      if (!name) continue;
      // Find qty after the link
      const idx = rewardHtml.indexOf(link);
      const afterLink = rewardHtml.substring(idx + link.length);
      const qtyMatch = afterLink.match(/^\s*x\s*([\d\s\u00A0]+)/);
      let qty = qtyMatch ? qtyMatch[1].trim().replace(/[\s\u00A0]/g, '') : '';
      items.push({ name, qty });
    }
  }

  return { items, sections };
}

function extractOldReward(html) {
  const statsSection = html.match(/<div id="result-stats">([\s\S]*?)<\/div>/i);
  if (!statsSection) return null;

  const statLines = statsSection[1].match(/<div class="stat_line">([\s\S]*?)<\/div>/gi);
  if (!statLines) return null;

  for (const line of statLines) {
    if (/Rewards?/i.test(line)) {
      const descMatch = line.match(/<div class="stat_describe">([\s\S]*?)<\/div>/i);
      if (descMatch) {
        const items = [];
        const itemLinks = descMatch[1].match(/<a[^>]*class="item-name[^"]*"[^>]*>[\s\S]*?<\/a>/gi);
        if (itemLinks) {
          for (const link of itemLinks) {
            const name = extractItemFromLink(link);
            if (name) items.push({ name, qty: '' });
          }
        }
        if (items.length === 0) {
          const text = stripHtml(descMatch[1]);
          if (text) items.push({ name: text, qty: '' });
        }
        return { items, sections: [] };
      }
    }
  }
  return null;
}

function formatReward(result) {
  if (!result || !result.items || result.items.length === 0) return '';
  return result.items.map((i) => (i.qty ? `${i.name} x${i.qty}` : i.name)).join(', ');
}

async function processQuest(name, id) {
  const url = `https://mw2.wiki/lu4/quest/${id}`;

  try {
    const html = await fetchWithRedirect(url);

    let result = extractPostReward(html);
    let format = 'post';

    if (!result || !result.items || result.items.length === 0) {
      result = extractOldReward(html);
      format = 'old';
    }

    const reward = formatReward(result);

    // Also extract the actual post ID from the canonical URL
    const canonMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="[^"]*\/(\d+)-/);
    const postId = canonMatch ? canonMatch[1] : id;

    return { name, id: postId, reward, items: result?.items || [], format };
  } catch (err) {
    console.error(`Error fetching ${name}: ${err.message}`);
    return { name, id, reward: 'ERROR', items: [], format: 'error' };
  }
}

async function main() {
  console.log('=== Fetching quest rewards from mw2.wiki ===\n');

  const entries = Object.entries(QUESTS);
  const results = [];

  for (let i = 0; i < entries.length; i += SEMAPHORE) {
    const batch = entries.slice(i, i + SEMAPHORE);
    const batchResults = await Promise.all(
      batch.map(([name, id]) => processQuest(name, id))
    );
    results.push(...batchResults);
    if (i + SEMAPHORE < entries.length) {
      await randomDelay();
    }
  }

  // Load current quest data
  const questsByRacePath = path.resolve(__dirname, '../src/data/quests/questsByRace.ts');
  const currentContent = fs.readFileSync(questsByRacePath, 'utf8');

  console.log('\n=== RESULTS ===\n');

  console.log('Quest | Old Reward | New Reward');
  console.log('--- | --- | ---');

  for (const r of results) {
    const escapedName = r.name.replace(/'/g, "\\'");
    const lines = currentContent.split('\n');
    let currentReward = '?';
    let found = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`name: '${escapedName}'`)) {
        for (let j = i; j < Math.min(i + 5, lines.length); j++) {
          const rewardMatch = lines[j].match(/reward:\s*'([^']*)'/);
          if (rewardMatch) {
            currentReward = rewardMatch[1];
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }

    console.log(`**${r.name}** (post/format ${r.format}) | \`${currentReward}\` | \`${r.reward}\``);

    if (r.items && r.items.length > 0) {
      console.log(`<details><summary>Items</summary>`);
      for (const item of r.items) {
        console.log(`- ${item.qty ? `x${item.qty}` : ''} ${item.name}`);
      }
      console.log(`</details>`);
    }
    console.log('');

    await randomDelay();
  }

  // Generate the TS updates
  console.log('\n=== TS UPDATES (copy these into questsByRace.ts) ===\n');

  for (const r of results) {
    if (!r.reward || r.reward === 'ERROR') continue;

    const escapedName = r.name.replace(/'/g, "\\'");
    const lines = currentContent.split('\n');
    let currentReward = '';
    let lineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`name: '${escapedName}'`)) {
        for (let j = i; j < Math.min(i + 5, lines.length); j++) {
          const rewardMatch = lines[j].match(/reward:\s*'([^']*)'/);
          if (rewardMatch) {
            currentReward = rewardMatch[1];
            lineIdx = j;
            break;
          }
        }
        if (lineIdx >= 0) break;
      }
    }

    if (lineIdx >= 0 && r.reward !== currentReward) {
      const newLine = lines[lineIdx].replace(/reward:\s*'[^']*'/, `reward: '${r.reward}'`);
      console.log(`// ${r.name}: ${currentReward} → ${r.reward}`);
    }
  }
}

main().catch(console.error);
