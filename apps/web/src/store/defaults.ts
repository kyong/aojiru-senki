import type { PlayerState, PartyState, InventoryState, ReceivedPresentState, ClearedQuestsState } from './types';

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
