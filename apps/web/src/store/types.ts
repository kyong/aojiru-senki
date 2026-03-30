// ============================================================
// shared type definitions
// ============================================================

export type Rarity = 'SSR' | 'SR' | 'R';

export type SkillType = 'damage' | 'heal' | 'buff' | 'debuff';

export type Skill = {
  name: string;
  description: string;
  type: SkillType;
  multiplier?: number;
  effectValue?: number;
  cost: number;
};

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
  skill?: Skill;
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
  bgm?: string; // e.g., 'battle.wav'
};

export type PlayerState = {
  gold: number;
  gems: number;
  ap: number;
  maxAp: number;
  level: number;
  exp: number;
  nextExp: number;
  joinDate: string;
  uid: string;
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

/** 各種設定（0-100） */
export type SettingsState = {
  bgmVolume: number;
  seVolume: number;
  isFirstLaunch: boolean;
  isMuted: boolean;
};
