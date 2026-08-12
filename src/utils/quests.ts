import QUEST_DATA from '@data/QUEST_DATA.json';
import { NPC_COORDS } from '@data/quests/npcCoords';
import QUEST_IMAGES from '@data/quests/QUEST_IMAGES.json';
import { QUEST_DETAILS } from '@data/quests/questDetails';
import { QUEST_IDS } from '@data/quests/questIds';
import { QUEST_STEPS } from '@data/quests/questSteps';
import type { Quest, RewardTag } from '@data/quests/types';

export type QuestDataEntry = {
  id: number;
  type: string;
  npcId: number | null;
  npcName: string;
  coords: { x: number; y: number } | null;
  steps: string[];
};

export function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function questUrl(name: string, id: number): string {
  return `https://mw2.wiki/lu4/posts/post/${id}-${slug(name)}`;
}

export function detectRewardTag(reward: string): RewardTag {
  const r = reward.toLowerCase();
  const hasWeapon =
    /sword|staff|wand|blade|saber|hammer|club|dagger|knife|shield|spellbook|weapon|меч|молот|булава|dagger/i.test(r);
  const hasSoulshot = /soulshot|spiritshot|соск/i.test(r);
  if (hasWeapon && hasSoulshot) return 'both';
  if (hasWeapon) return 'weapon';
  if (hasSoulshot) return 'soulshot';
  if (/aden|a$/i.test(r) && !/exp/i.test(r)) return 'adena';
  if (/exp|xp/i.test(r)) return 'exp';
  return 'other';
}

export function enrichQuest(q: Quest): Quest & {
  npc: string;
  npcId: number;
  location: string;
  startLvl: number;
  endLvl: number;
  questId: number;
  steps: string[];
  coords: { x: number; y: number } | null;
  rewardTag: RewardTag;
  images: string[];
} {
  const details = QUEST_DETAILS[q.name];
  const parsed = (QUEST_DATA as Record<string, QuestDataEntry>)[q.name];
  const npcId = details?.npcId ?? q.npcId ?? parsed?.npcId ?? 0;
  const parsedCoords = parsed?.coords ?? null;
  return {
    ...q,
    npc: details?.npc ?? q.npc ?? parsed?.npcName ?? '',
    location: details?.location ?? q.location ?? '',
    npcId,
    startLvl: details?.startLvl ?? q.lvl,
    endLvl: details?.endLvl ?? q.lvl,
    questId: QUEST_IDS[q.name] ?? q.questId ?? parsed?.id ?? 0,
    steps: QUEST_STEPS[q.name] ?? parsed?.steps ?? q.steps ?? [],
    coords: NPC_COORDS[npcId] ?? parsedCoords,
    rewardTag: detectRewardTag(q.reward),
    images: q.images ?? (QUEST_IMAGES as Record<string, string[]>)[q.name] ?? [],
  };
}
