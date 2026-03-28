import type { Character, Rarity } from './types';

// ============================================================
// キャラクターマスターデータ（全ページ共通）
// ============================================================

export const ALL_CHARACTERS: Character[] = [
  // --- 主人公（ガチャ排出対象外） ---
  { id: 1,  name: '青汁マイスター',     title: '翠風の剣士',       rarity: 'SSR', emoji: '⚔️', atk: 320, def: 180, hp: 5000, image: '/images/player.png' },
  // --- SSR ---
  { id: 2,  name: 'ケナ氏',             title: '映えの女神',       rarity: 'SSR', emoji: '📸', atk: 290, def: 150, hp: 4200, image: '/images/characters/kenashi.png' },
  { id: 8,  name: '社長',               title: '経営の覇王',       rarity: 'SSR', emoji: '👔', atk: 350, def: 200, hp: 5200, image: '/images/characters/shacho.png' },
  { id: 9,  name: '明日葉姫アシタバ',   title: '八丈島の秘宝',     rarity: 'SSR', emoji: '👑', atk: 310, def: 190, hp: 4800, image: '/images/characters/ashitaba.png' },
  // --- SR ---
  { id: 3,  name: '野菜騎士ブロッコリ', title: '緑の護衛隊長',     rarity: 'SR',  emoji: '🥦', atk: 200, def: 310, hp: 6000, image: '/images/characters/broccoli.png' },
  { id: 4,  name: '大麦戦士バーライ',   title: '穀物の番人',       rarity: 'SR',  emoji: '🌾', atk: 180, def: 220, hp: 5500, image: '/images/characters/barley.png' },
  { id: 10, name: 'ケール将軍',         title: '王の盾',           rarity: 'SR',  emoji: '🛡️', atk: 210, def: 300, hp: 5800, image: '/images/characters/kale.png' },
  { id: 11, name: '桑の葉仙人',         title: '糖を断つ者',       rarity: 'SR',  emoji: '🍵', atk: 190, def: 250, hp: 5200, image: '/images/characters/mulberry.png' },
  { id: 12, name: 'モリンガ聖女',       title: '奇跡の葉の巫女',   rarity: 'SR',  emoji: '✨', atk: 240, def: 200, hp: 4800, image: '/images/characters/moringa.png' },
  { id: 13, name: 'クマザサ忍者',       title: '笹薮の影',         rarity: 'SR',  emoji: '🎋', atk: 260, def: 170, hp: 4500, image: '/images/characters/kumasasa.png' },
  // --- R ---
  { id: 5,  name: '小松菜の子',         title: '新芽の見習い',     rarity: 'R',   emoji: '🌿', atk: 250, def: 120, hp: 3800, image: '/images/characters/komatsuna.png' },
  { id: 6,  name: 'ほうれん草ナイト',   title: '鉄分の守護者',     rarity: 'R',   emoji: '🍃', atk: 220, def: 180, hp: 4000, image: '/images/characters/spinach.png' },
  { id: 7,  name: 'ゴーヤ坊や',         title: '苦味初級者',       rarity: 'R',   emoji: '🌱', atk: 200, def: 130, hp: 3500, image: '/images/characters/goya.png' },
  { id: 14, name: 'ヨモギ薬師',         title: '草餅の癒し手',     rarity: 'R',   emoji: '🌾', atk: 180, def: 200, hp: 4200, image: '/images/characters/yomogi.png' },
  { id: 15, name: 'パセリ踊り子',       title: '添えるだけの舞姫', rarity: 'R',   emoji: '💃', atk: 230, def: 110, hp: 3600, image: '/images/characters/parsley.png' },
  { id: 16, name: 'セロリ修道士',       title: '苦行の求道者',     rarity: 'R',   emoji: '📿', atk: 190, def: 160, hp: 3900, image: '/images/characters/celery.png' },
  { id: 17, name: 'スピルリナ妖精',     title: '藻の精霊',         rarity: 'R',   emoji: '🧚', atk: 210, def: 140, hp: 3700, image: '/images/characters/spirulina.png' },
];

export const CHARACTER_MAP: Record<number, Character> = Object.fromEntries(
  ALL_CHARACTERS.map(c => [c.id, c])
);

// Gacha probability weights
export const RARITY_WEIGHTS: Record<Rarity, number> = { SSR: 3, SR: 15, R: 82 };

export function getCharacterById(id: number): Character | undefined {
  return CHARACTER_MAP[id];
}

// ガチャ排出対象（主人公の青汁マイスターは除外）
const GACHA_POOL = ALL_CHARACTERS.filter(c => c.id !== 1);

export function drawRandomCharacter(): Character {
  const roll = Math.random() * 100;
  let rarity: Rarity;
  if (roll < RARITY_WEIGHTS.SSR) rarity = 'SSR';
  else if (roll < RARITY_WEIGHTS.SSR + RARITY_WEIGHTS.SR) rarity = 'SR';
  else rarity = 'R';
  const pool = GACHA_POOL.filter(c => c.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function drawTenCharacters(): Character[] {
  const results: Character[] = Array.from({ length: 10 }, () => drawRandomCharacter());
  const hasSROrAbove = results.some(c => c.rarity === 'SSR' || c.rarity === 'SR');
  if (!hasSROrAbove) {
    const srPool = GACHA_POOL.filter(c => c.rarity === 'SR');
    results[9] = srPool[Math.floor(Math.random() * srPool.length)];
  }
  return results;
}
