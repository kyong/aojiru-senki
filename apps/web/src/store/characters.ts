import type { Character, Rarity } from './types';

// ============================================================
// キャラクターマスターデータ（全ページ共通）
// ============================================================

export const ALL_CHARACTERS: Character[] = [
  // --- 主人公（ガチャ排出対象外） ---
  { id: 1,  name: '青汁マイスター',     title: '翠風の剣士',       rarity: 'SSR', emoji: '⚔️', atk: 320, def: 180, hp: 5000, image: '/images/player.png', skill: { name: '青汁ストーム', description: '翠風の刃で敵を切り裂く', type: 'damage', multiplier: 2.5, cost: 30 } },
  // --- SSR ---
  { id: 2,  name: 'ケナ氏',             title: '映えの女神',       rarity: 'SSR', emoji: '📸', atk: 290, def: 150, hp: 4200, image: '/images/characters/kenashi.png', skill: { name: '映えの極致', description: '眩い光で敵の戦意を削ぐ', type: 'debuff', multiplier: 2.0, effectValue: 0.7, duration: 5, cost: 40 } },
  { id: 8,  name: '社長',               title: '経営の覇王',       rarity: 'SSR', emoji: '👔', atk: 350, def: 200, hp: 5200, image: '/images/characters/shacho.png', skill: { name: '経営判断：全力投資', description: '全リソースを攻撃に転換する', type: 'damage', multiplier: 3.5, cost: 50 } },
  { id: 9,  name: '明日葉姫アシタバ',   title: '八丈島の秘宝',     rarity: 'SSR', emoji: '👑', atk: 310, def: 190, hp: 4800, image: '/images/characters/ashitaba.png', skill: { name: '不老長寿の祈り', description: '明日葉の生命力で癒やす', type: 'heal', multiplier: 0.5, cost: 45 } },
  // --- SR ---
  { id: 3,  name: '野菜騎士ブロッコリ', title: '緑の護衛隊長',     rarity: 'SR',  emoji: '🥦', atk: 200, def: 310, hp: 6000, image: '/images/characters/broccoli.png', skill: { name: 'ビタミン連撃', description: '栄養満点の連続攻撃', type: 'damage', multiplier: 1.8, cost: 25 } },
  { id: 4,  name: '大麦戦士バーライ',   title: '穀物の番人',       rarity: 'SR',  emoji: '🌾', atk: 180, def: 220, hp: 5500, image: '/images/characters/barley.png', skill: { name: '食物繊維アタック', description: '敵の防御を無視して突進する', type: 'damage', multiplier: 1.6, cost: 20 } },
  { id: 10, name: 'ケール将軍',         title: '王の盾',           rarity: 'SR',  emoji: '🛡️', atk: 210, def: 300, hp: 5800, image: '/images/characters/kale.png', skill: { name: '王者の苦味', description: '圧倒的な苦味で敵を圧倒する', type: 'damage', multiplier: 2.2, cost: 35 } },
  { id: 11, name: '桑の葉仙人',         title: '糖を断つ者',       rarity: 'SR',  emoji: '🍵', atk: 190, def: 250, hp: 5200, image: '/images/characters/mulberry.png', skill: { name: '糖質遮断の法', description: '敵のパワーを吸収する', type: 'debuff', multiplier: 1.0, effectValue: 0.5, duration: 5, cost: 30 } },
  { id: 12, name: 'モリンガ聖女',       title: '奇跡の葉の巫女',   rarity: 'SR',  emoji: '✨', atk: 240, def: 200, hp: 4800, image: '/images/characters/moringa.png', skill: { name: '奇跡の木の実', description: 'あらゆる傷を癒やす', type: 'heal', multiplier: 0.4, cost: 30 } },
  { id: 13, name: 'クマザサ忍者',       title: '笹薮の影',         rarity: 'SR',  emoji: '🎋', atk: 260, def: 170, hp: 4500, image: '/images/characters/kumasasa.png', skill: { name: '笹の葉手裏剣', description: '急所を狙い撃つ', type: 'damage', multiplier: 2.0, cost: 25 } },
  // --- R ---
  { id: 5,  name: '小松菜の子',         title: '新芽の見習い',     rarity: 'R',   emoji: '🌿', atk: 250, def: 120, hp: 3800, image: '/images/characters/komatsuna.png', skill: { name: 'すくすく成長', description: '少しだけHPを回復する', type: 'heal', multiplier: 0.2, cost: 15 } },
  { id: 6,  name: 'ほうれん草ナイト',   title: '鉄分の守護者',     rarity: 'R',   emoji: '🍃', atk: 220, def: 180, hp: 4000, image: '/images/characters/spinach.png', skill: { name: '鉄分パワー', description: '攻撃力を一時的に高める', type: 'damage', multiplier: 1.7, cost: 20 } },
  { id: 7,  name: 'ゴーヤ坊や',         title: '苦味初級者',       rarity: 'R',   emoji: '🌱', atk: 200, def: 130, hp: 3500, image: '/images/characters/goya.png', skill: { name: 'ゴーヤ・スプラッシュ', description: '苦い汁を浴びせる', type: 'damage', multiplier: 1.4, cost: 15 } },
  { id: 14, name: 'ヨモギ薬師',         title: '草餅の癒し手',     rarity: 'R',   emoji: '🌾', atk: 180, def: 200, hp: 4200, image: '/images/characters/yomogi.png', skill: { name: 'ヨモギ蒸し', description: '体を温めて癒やす', type: 'heal', multiplier: 0.25, cost: 20 } },
  { id: 15, name: 'パセリ踊り子',       title: '添えるだけの舞姫', rarity: 'R',   emoji: '💃', atk: 230, def: 110, hp: 3600, image: '/images/characters/parsley.png', skill: { name: '添え物の舞', description: '味方を鼓舞する', type: 'damage', multiplier: 1.3, cost: 10 } },
  { id: 16, name: 'セロリ修道士',       title: '苦行の求道者',     rarity: 'R',   emoji: '📿', atk: 190, def: 160, hp: 3900, image: '/images/characters/celery.png', skill: { name: 'シャキシャキの啓示', description: '清らかな心で攻撃する', type: 'damage', multiplier: 1.5, cost: 20 } },
  { id: 17, name: 'スピルリナ妖精',     title: '藻の精霊',         rarity: 'R',   emoji: '🧚', atk: 210, def: 140, hp: 3700, image: '/images/characters/spirulina.png', skill: { name: '藻類パウダー', description: '不思議な粉で癒やす', type: 'heal', multiplier: 0.3, cost: 25 } },
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
