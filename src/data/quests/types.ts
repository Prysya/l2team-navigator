export type RewardTag = 'weapon' | 'soulshot' | 'both' | 'adena' | 'exp' | 'other';

export interface Quest {
  lvl: number;
  name: string;
  desc: string;
  reward: string;
  note?: string;
  questId?: number;
  npc?: string;
  npcId?: number;
  location?: string;
  startLvl?: number;
  endLvl?: number;
  steps?: string[];
  rewardTag?: RewardTag;
}
