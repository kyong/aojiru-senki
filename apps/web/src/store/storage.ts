import type {
  PlayerState,
  PartyState,
  InventoryState,
  ReceivedPresentState,
  ClearedQuestsState,
  ItemsState,
} from './types';
import {
  DEFAULT_PLAYER,
  DEFAULT_PARTY,
  DEFAULT_INVENTORY,
  DEFAULT_RECEIVED_PRESENTS,
  DEFAULT_CLEARED_QUESTS,
  DEFAULT_ITEMS,
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
  CLEARED_QUESTS: 'aojiru_cleared_quests',
  ITEMS: 'aojiru_items',
  AP_RECOVERY_TIME: 'aojiru_ap_recovery_time',
  GACHA_PULLS: 'aojiru_gacha_pulls',
} as const;

const ENCRYPTION_KEY = 'ao_ji_ru_secret_key_2026';

function xorEncryptDecrypt(input: string): string {
  let output = '';
  for (let i = 0; i < input.length; i++) {
    output += String.fromCharCode(input.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return output;
}

function encrypt(data: string): string {
  // encodeURIComponent to ensure all characters are ASCII before XOR
  return btoa(xorEncryptDecrypt(encodeURIComponent(data)));
}

function decrypt(data: string): string {
  try {
    return decodeURIComponent(xorEncryptDecrypt(atob(data)));
  } catch {
    // Fallback to returning original data if standard JSON or tampering prevents decoding
    return data; 
  }
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    
    let parsedRaw = raw;
    try {
      parsedRaw = decrypt(raw);
    } catch {
      // Ignored, handled by decrypt fallback
    }

    try {
      return JSON.parse(parsedRaw) as T;
    } catch {
      // If decryption yielded invalid JSON (e.g. wrong key, tampered file), fallback to trying parsing raw
      return JSON.parse(raw) as T;
    }
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    const jsonStr = JSON.stringify(value);
    const encrypted = encrypt(jsonStr);
    localStorage.setItem(key, encrypted);
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

// ---- Cleared Quests ----

export function getClearedQuests(): ClearedQuestsState {
  return read<ClearedQuestsState>(KEYS.CLEARED_QUESTS, DEFAULT_CLEARED_QUESTS);
}

export function saveClearedQuests(cleared: ClearedQuestsState): void {
  write(KEYS.CLEARED_QUESTS, cleared);
}

// ---- Items ----

export function getItems(): ItemsState {
  const saved = read<Partial<ItemsState>>(KEYS.ITEMS, DEFAULT_ITEMS);
  return { ...DEFAULT_ITEMS, ...saved };
}

export function saveItems(items: ItemsState): void {
  write(KEYS.ITEMS, items);
}

// ---- AP Recovery Timestamp ----

export function getApRecoveryTime(): number {
  return read<number>(KEYS.AP_RECOVERY_TIME, Date.now());
}

export function saveApRecoveryTime(timestamp: number): void {
  write(KEYS.AP_RECOVERY_TIME, timestamp);
}

// ---- Gacha Pulls ----

export function getGachaPulls(): number {
  return read<number>(KEYS.GACHA_PULLS, 0);
}

export function saveGachaPulls(count: number): void {
  write(KEYS.GACHA_PULLS, count);
}

// ---- Reset (デバッグ用) ----

export function resetAllData(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
