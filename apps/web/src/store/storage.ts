import type {
  PlayerState,
  PartyState,
  InventoryState,
  ReceivedPresentState,
} from './types';
import {
  DEFAULT_PLAYER,
  DEFAULT_PARTY,
  DEFAULT_INVENTORY,
  DEFAULT_RECEIVED_PRESENTS,
} from './defaults';

// ============================================================
// ★ Storage Abstraction Layer
//
// 将来 API に切り替える際は、このファイルの実装だけ差し替えてください。
// 例: localStorage.getItem(...) → await fetch('/api/player') に変更
//
// 現在の実装: localStorage (同期)
// ============================================================

const KEYS = {
  PLAYER: 'aojiru_player',
  PARTY: 'aojiru_party',
  INVENTORY: 'aojiru_inventory',
  RECEIVED_PRESENTS: 'aojiru_received_presents',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full などは握り潰す
  }
}

// ---- Player ----

export function getPlayer(): PlayerState {
  return read<PlayerState>(KEYS.PLAYER, DEFAULT_PLAYER);
}

export function savePlayer(player: PlayerState): void {
  write(KEYS.PLAYER, player);
}

// ---- Party ----

export function getParty(): PartyState {
  return read<PartyState>(KEYS.PARTY, DEFAULT_PARTY);
}

export function saveParty(party: PartyState): void {
  write(KEYS.PARTY, party);
}

// ---- Inventory ----

export function getInventory(): InventoryState {
  return read<InventoryState>(KEYS.INVENTORY, DEFAULT_INVENTORY);
}

export function saveInventory(inventory: InventoryState): void {
  write(KEYS.INVENTORY, inventory);
}

// ---- Presents ----

export function getReceivedPresentIds(): ReceivedPresentState {
  return read<ReceivedPresentState>(KEYS.RECEIVED_PRESENTS, DEFAULT_RECEIVED_PRESENTS);
}

export function saveReceivedPresentIds(ids: ReceivedPresentState): void {
  write(KEYS.RECEIVED_PRESENTS, ids);
}

// ---- Reset (デバッグ用) ----

export function resetAllData(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
