import type { PlayerState, PartyState, InventoryState, ReceivedPresentState, ClearedQuestsState, ItemsState, SettingsState } from './types';

// ============================================================
// ゲームの初期値
// ============================================================

export const DEFAULT_PLAYER: PlayerState = {
  gold: 0,
  gems: 3000,  // 初期ジェム（チュートリアル10連分）
  ap: 120,
  maxAp: 120,
  level: 1,
  exp: 0,
  nextExp: 100,
};

/** 初期編成: スロット0に青汁マイスター（ID:1）を配置 */
export const DEFAULT_PARTY: PartyState = [1, null, null];

/** 初期所持キャラクター */
export const DEFAULT_INVENTORY: InventoryState = [1]; // 青汁マイスターを初期配布

export const DEFAULT_RECEIVED_PRESENTS: ReceivedPresentState = [];

export const DEFAULT_CLEARED_QUESTS: ClearedQuestsState = [];

/** 初期アイテム: 青汁ポーション3個 */
export const DEFAULT_ITEMS: ItemsState = { aojiruPotion: 3, choHadoAojiru: 0 };

/** 初期設定: BGM 70%, SE 80% */
export const DEFAULT_SETTINGS: SettingsState = { 
  bgmVolume: 70, 
  seVolume: 80, 
  isFirstLaunch: true,
  isMuted: false 
};
