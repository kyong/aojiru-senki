import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type PropsWithChildren,
} from 'react';
import type {
  PlayerState,
  PartyState,
  InventoryState,
  ReceivedPresentState,
} from '../store/types';
import * as storage from '../store/storage';
import { getCharacterById } from '../store/characters';

// ============================================================
// Context 型定義
// ============================================================

type GameContextValue = {
  // State
  player: PlayerState;
  party: PartyState;
  inventory: InventoryState;
  receivedPresentIds: ReceivedPresentState;

  // Player actions
  addGold: (amount: number) => void;
  addGems: (amount: number) => void;
  /** ジェムを消費。不足時は false を返す */
  spendGems: (amount: number) => boolean;
  /** APを消費。不足時は false を返す */
  consumeAp: (amount: number) => boolean;
  addExp: (amount: number) => void;

  // Inventory & Party actions
  addToInventory: (charId: number) => void;
  setPartySlot: (slot: number, charId: number | null) => void;

  // Present actions
  receivePresent: (id: number) => void;
  receiveAllPresents: (ids: number[]) => void;

  // Battle helpers
  /** 編成から計算したバトル用プレイヤーステータス */
  getBattleStats: () => { maxHp: number; baseAtk: number; atkRange: number };

  // Debug
  resetAll: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

// ============================================================
// Provider
// ============================================================

export const GameProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [player, setPlayer] = useState<PlayerState>(() => storage.getPlayer());
  const [party, setParty] = useState<PartyState>(() => storage.getParty());
  const [inventory, setInventory] = useState<InventoryState>(() => storage.getInventory());
  const [receivedPresentIds, setReceivedPresentIds] = useState<ReceivedPresentState>(
    () => storage.getReceivedPresentIds()
  );

  // State が変わったら自動保存
  useEffect(() => { storage.savePlayer(player); }, [player]);
  useEffect(() => { storage.saveParty(party); }, [party]);
  useEffect(() => { storage.saveInventory(inventory); }, [inventory]);
  useEffect(() => { storage.saveReceivedPresentIds(receivedPresentIds); }, [receivedPresentIds]);

  // ---- Player actions ----

  const addGold = useCallback((amount: number) => {
    setPlayer(p => ({ ...p, gold: p.gold + amount }));
  }, []);

  const addGems = useCallback((amount: number) => {
    setPlayer(p => ({ ...p, gems: p.gems + amount }));
  }, []);

  const spendGems = useCallback((amount: number): boolean => {
    let success = false;
    setPlayer(p => {
      if (p.gems < amount) return p;
      success = true;
      return { ...p, gems: p.gems - amount };
    });
    return success;
  }, []);

  const consumeAp = useCallback((amount: number): boolean => {
    let success = false;
    setPlayer(p => {
      if (p.ap < amount) return p;
      success = true;
      return { ...p, ap: p.ap - amount };
    });
    return success;
  }, []);

  const addExp = useCallback((amount: number) => {
    setPlayer(p => {
      let { exp, level, nextExp } = p;
      exp += amount;
      while (exp >= nextExp) {
        exp -= nextExp;
        level += 1;
        nextExp = Math.floor(nextExp * 1.5);
      }
      return { ...p, exp, level, nextExp };
    });
  }, []);

  // ---- Inventory & Party ----

  const addToInventory = useCallback((charId: number) => {
    setInventory(inv => inv.includes(charId) ? inv : [...inv, charId]);
  }, []);

  const setPartySlot = useCallback((slot: number, charId: number | null) => {
    setParty(prev => {
      const next = [...prev] as PartyState;
      // 同じキャラが別スロットにいたら入れ替え
      if (charId !== null) {
        const existing = next.indexOf(charId);
        if (existing !== -1) next[existing] = null;
      }
      next[slot] = charId;
      return next;
    });
  }, []);

  // ---- Presents ----

  const receivePresent = useCallback((id: number) => {
    setReceivedPresentIds(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const receiveAllPresents = useCallback((ids: number[]) => {
    setReceivedPresentIds(prev => {
      const newIds = ids.filter(id => !prev.includes(id));
      return newIds.length ? [...prev, ...newIds] : prev;
    });
  }, []);

  // ---- Battle helpers ----

  const getBattleStats = useCallback(() => {
    const partyChars = party
      .filter(id => id !== null)
      .map(id => getCharacterById(id!))
      .filter(Boolean);

    if (partyChars.length === 0) {
      // 編成なし: デフォルト値
      return { maxHp: 500, baseAtk: 110, atkRange: 30 };
    }

    const totalAtk = partyChars.reduce((s, c) => s + (c?.atk ?? 0), 0);
    const totalHp  = partyChars.reduce((s, c) => s + (c?.hp ?? 0), 0);

    const maxHp   = 300 + Math.floor(totalHp / 20);   // 300 + 各キャラHP/20
    const baseAtk = 90  + Math.floor(totalAtk / 10);  // 90  + 各キャラATK/10
    const atkRange = 30;

    return { maxHp, baseAtk, atkRange };
  }, [party]);

  // ---- Debug ----

  const resetAll = useCallback(() => {
    storage.resetAllData();
    setPlayer(storage.getPlayer());
    setParty(storage.getParty());
    setInventory(storage.getInventory());
    setReceivedPresentIds(storage.getReceivedPresentIds());
  }, []);

  const value: GameContextValue = {
    player, party, inventory, receivedPresentIds,
    addGold, addGems, spendGems, consumeAp, addExp,
    addToInventory, setPartySlot,
    receivePresent, receiveAllPresents,
    getBattleStats,
    resetAll,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// ============================================================
// Hook
// ============================================================

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
