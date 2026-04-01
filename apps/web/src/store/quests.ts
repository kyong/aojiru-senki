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
    goldReward: 500,
    description: 'ギトギトの朝を浄化せよ！',
    thumbnail: '/images/bacon_general.png',
    bgm: 'battle.mp3',
    chapterLabel: 'Chapter 1',
  },
  {
    id: 2,
    title: '第2章: 昼食の死闘',
    enemy: '炭水化物・ザ・グレート',
    difficulty: 3,
    stamina: 20,
    goldReward: 2000,
    description: '午後の眠気に打ち勝て！',
    thumbnail: '/images/carb_the_great.png',
    bgm: 'battle.mp3',
    chapterLabel: 'Chapter 2',
  },
  {
    id: 4,
    title: '第3章: おやつの誘惑',
    enemy: 'スイーツ魔人ショートケーキ',
    difficulty: 4,
    stamina: 30,
    goldReward: 8000,
    description: '甘い誘惑を断ち切れ！',
    thumbnail: '/images/sweets_majin.png',
    bgm: 'battle.mp3',
    chapterLabel: 'Chapter 3',
    unlockCondition: { requireClearId: 2 },
  },
  {
    id: 3,
    title: '最終章: 晩餐の魔王',
    enemy: '魔王コレステロール・キング',
    difficulty: 5,
    stamina: 50,
    goldReward: 15000,
    description: '世界に健康を取り戻す時だ！',
    thumbnail: '/images/cholesterol_king.png',
    bgm: 'boss_battle.mp3',
    chapterLabel: 'Chapter 4',
    unlockCondition: { requireClearId: 4 },
  },
  {
    id: 5,
    title: 'エクストラ: 寝る前の空腹',
    enemy: '深夜のラーメン怪人',
    difficulty: 6,
    stamina: 80,
    goldReward: 30000,
    description: '深夜の炭水化物は罪深き味……',
    thumbnail: '/images/ramen_kaijin.png',
    chapterLabel: 'Extra',
    unlockCondition: { requireClearId: 3 },
    bgm: 'battle.mp3',
  },
  {
    id: 6,
    title: 'ゲリラ: 終わらない飲み会',
    enemy: '終わらない飲み会部長',
    difficulty: 5,
    stamina: 40,
    goldReward: 12000,
    description: '2時間に1時間だけ出現！肝臓を労われ！',
    thumbnail: '/images/nomikai_bucho.png',
    timeCondition: { activeRule: 'every_other_hour' },
    guerrilla: true,
    gemsReward: 10,
    bgm: 'battle.mp3',
  },
];

export const QUEST_MAP: Record<number, Quest> = Object.fromEntries(
  ALL_QUESTS.map(q => [q.id, q])
);
