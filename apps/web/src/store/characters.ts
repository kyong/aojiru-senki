import type { Character, Rarity } from './types';

// ============================================================
// キャラクターマスターデータ（全ページ共通）
// ============================================================

export const ALL_CHARACTERS: Character[] = [
  { id: 1, name: '青汁マイスター',     title: '翠風の剣士',     rarity: 'SSR', emoji: '⚔️', atk: 320, def: 180, hp: 5000 },
  { id: 2, name: 'ケナ氏',             title: '映えの女神',     rarity: 'SSR', emoji: '📸', atk: 290, def: 150, hp: 4200 },
  { id: 3, name: '野菜騎士ブロッコリ', title: '緑の護衛隊長',   rarity: 'SR',  emoji: '🥦', atk: 200, def: 310, hp: 6000 },
  { id: 4, name: '大麦戦士バーライ',   title: '穀物の番人',     rarity: 'SR',  emoji: '🌾', atk: 180, def: 220, hp: 5500 },
  { id: 5, name: '小松菜の子',         title: '新芽の見習い',   rarity: 'R',   emoji: '🌿', atk: 250, def: 120, hp: 3800 },
  { id: 6, name: 'ほうれん草ナイト',   title: '鉄分の守護者',   rarity: 'R',   emoji: '🍃', atk: 220, def: 180, hp: 4000 },
  { id: 7, name: 'ゴーヤ坊や',         title: '苦味初級者',     rarity: 'R',   emoji: '🌱', atk: 200, def: 130, hp: 3500 },
];

export const CHARACTER_MAP: Record<number, Character> = Object.fromEntries(
  ALL_CHARACTERS.map(c => [c.id, c])
);

// Gacha probability weights
export const RARITY_WEIGHTS: Record<Rarity, number> = { SSR: 3, SR: 15, R: 82 };

export function getCharacterById(id: number): Character | undefined {
  return CHARACTER_MAP[id];
}

export function drawRandomCharacter(): Character {
  const roll = Math.random() * 100;
  let rarity: Rarity;
  if (roll < RARITY_WEIGHTS.SSR) rarity = 'SSR';
  else if (roll < RARITY_WEIGHTS.SSR + RARITY_WEIGHTS.SR) rarity = 'SR';
  else rarity = 'R';
  const pool = ALL_CHARACTERS.filter(c => c.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function drawTenCharacters(): Character[] {
  const results: Character[] = Array.from({ length: 10 }, () => drawRandomCharacter());
  const hasSROrAbove = results.some(c => c.rarity === 'SSR' || c.rarity === 'SR');
  if (!hasSROrAbove) {
    const srPool = ALL_CHARACTERS.filter(c => c.rarity === 'SR');
    results[9] = srPool[Math.floor(Math.random() * srPool.length)];
  }
  return results;
}
