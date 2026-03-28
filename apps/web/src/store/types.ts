// ============================================================
// shared type definitions
// ============================================================

export type Rarity = 'SSR' | 'SR' | 'R';

export type Character = {
  id: number;
  name: string;
  title: string;
  rarity: Rarity;
  emoji: string;
  atk: number;
  def: number;
  hp: number;
  image?: string;
};

export type Quest = {
  id: number;
  title: string;
  enemy: string;
  difficulty: number;
  stamina: number;
  description: string;
  thumbnail: string;
  goldReward: number;
  unlockCondition?: {
    requireClearId?: number;
  };
  timeCondition?: {
    activeRule: 'every_other_hour';
  };
  guerrilla?: boolean;
  gemsReward?: number;
};

export type PlayerState = {
  gold: number;
  gems: number;
  ap: number;
  maxAp: number;
  level: number;
  exp: number;
  nextExp: number;
};

/** スロット 0〜2: キャラクターID または null（空） */
export type PartyState = (number | null)[];

/** 所持キャラクターのIDリスト */
export type InventoryState = number[];

/** 受け取り済みプレゼントのIDリスト */
export type ReceivedPresentState = number[];

/** クリア済みクエストのIDリスト */
export type ClearedQuestsState = number[];

/** アイテム所持数 */
export type ItemsState = {
  aojiruPotion: number;
  choHadoAojiru: number;
};
