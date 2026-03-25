import type { Quest } from './types';

// ============================================================
// クエストマスターデータ（全ページ共通）
// ============================================================

export const ALL_QUESTS: Quest[] = [
  {
    id: 1,
    title: '第1章: 朝食の戦い',
    enemy: 'カリカリベーコン将軍',
    difficulty: 1,
    stamina: 10,
    goldReward: 1000,
    description: 'ギトギトの朝を浄化せよ！',
    thumbnail: '/images/enemy.png',
  },
  {
    id: 2,
    title: '第2章: 昼食の死闘',
    enemy: '炭水化物・ザ・グレート',
    difficulty: 3,
    stamina: 20,
    goldReward: 5000,
    description: '午後の眠気に打ち勝て！',
    thumbnail: '/images/potato_sniper.png',
  },
  {
    id: 3,
    title: '最終章: 晩餐の魔王',
    enemy: '魔王コレステロール・キング',
    difficulty: 5,
    stamina: 50,
    goldReward: 50000,
    description: '世界に健康を取り戻す時だ！',
    thumbnail: '/images/cola_slime.png',
  },
];

export const QUEST_MAP: Record<number, Quest> = Object.fromEntries(
  ALL_QUESTS.map(q => [q.id, q])
);
