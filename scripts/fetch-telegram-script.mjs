import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const SOURCE = 'https://telegram.org/js/telegram-web-app.js';
const TARGET = resolve(import.meta.dirname, '../public/telegram-web-app.js');

const resp = await fetch(SOURCE);
if (!resp.ok) {
  console.error(`Ошибка загрузки ${SOURCE}: HTTP ${resp.status}`);
  process.exit(1);
}

const body = await resp.text();
await writeFile(TARGET, body, 'utf8');
console.log(`Сохранено в ${TARGET} (${(Buffer.byteLength(body) / 1024).toFixed(1)} KB)`);