import { loadQuestIds } from './shared.mjs';

const ids = loadQuestIds();
const three = Object.entries(ids).filter(([name]) => name.startsWith('3 in '));
console.log(`${three.length} 3 in 1 quests — images disabled.`);
three.forEach(([name, id]) => console.log(`  ${name}: ${id}`));
