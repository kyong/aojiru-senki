import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type PropsWithChildren,
} from 'react';
import type {
  PlayerState,
  PartyState,
  InventoryState,
  ReceivedPresentState,
  ClearedQuestsState,
  ItemsState,
} from '../store/types';
import * as storage from '../store/storage';
import { getCharacterById } from '../store/characters';

// 1AP回復にかかる秒数（5分）
const AP_RECOVERY_INTERVAL_SEC = 5 * 60;

// ============================================================
// Context 型定義
// ============================================================

type GameContextValue = {
  // State
  player: PlayerState;
  party: PartyState;
  inventory: InventoryState;
  receivedPresentIds: ReceivedPresentState;
  clearedQuests: ClearedQuestsState;
  items: ItemsState;
  /** 次のAP回復まで残り何秒か（AP満タン時は null） */
  nextApRecoveryIn: number | null;
  /** ガチャの累計スカウト回数 */
  totalGachaPulls: number;

  // Player actions
  addGold: (amount: number) => void;
  addGems: (amount: number) => void;
  /** ゴールドを消費。不足時は false を返す */
  spendGold: (amount: number) => boolean;
  /** ジェムを消費。不足時は false を返す */
  spendGems: (amount: number) => boolean;
  /** APを消費。不足時は false を返す */
  consumeAp: (amount: number) => boolean;
  /** APを回復。上限突破を許容する */
  recoverAp: (amount: number) => void;
  addExp: (amount: number) => void;

  // Item actions
  addItems: (key: keyof ItemsState, amount: number) => void;
  /** アイテムを1つ消費。不足時は false を返す */
  useItem: (key: keyof ItemsState) => boolean;

  // Inventory & Party actions
  addToInventory: (charId: number) => void;
  setPartySlot: (slot: number, charId: number | null) => void;

  // Present actions
  receivePresent: (id: number) => void;
  receiveAllPresents: (ids: number[]) => void;

  markQuestCleared: (id: number) => void;

  incrementGachaPulls: (amount: number) => void;

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
  const [clearedQuests, setClearedQuests] = useState<ClearedQuestsState>(
    () => storage.getClearedQuests()
  );
  const [items, setItems] = useState<ItemsState>(() => storage.getItems());
  const [totalGachaPulls, setTotalGachaPulls] = useState<number>(() => storage.getGachaPulls());
  const [nextApRecoveryIn, setNextApRecoveryIn] = useState<number | null>(null);
  const apRecoveryTimeRef = useRef<number>(storage.getApRecoveryTime());

  // State が変わったら自動保存
  useEffect(() => { storage.savePlayer(player); }, [player]);
  useEffect(() => { storage.saveParty(party); }, [party]);
  useEffect(() => { storage.saveInventory(inventory); }, [inventory]);
  useEffect(() => { storage.saveReceivedPresentIds(receivedPresentIds); }, [receivedPresentIds]);
  useEffect(() => { storage.saveClearedQuests(clearedQuests); }, [clearedQuests]);
  useEffect(() => { storage.saveItems(items); }, [items]);
  useEffect(() => { storage.saveGachaPulls(totalGachaPulls); }, [totalGachaPulls]);

  // ---- AP 自動回復 ----
  // 起動時: アプリを閉じていた間に回復すべきAPを遡って加算
  // 起動中: 毎秒チェックして回復タイミングになったらAPを加算
  useEffect(() => {
    const tick = () => {
      setPlayer(p => {
        if (p.ap >= p.maxAp) {
          setNextApRecoveryIn(null);
          return p;
        }
        const now = Date.now();
        const elapsed = (now - apRecoveryTimeRef.current) / 1000; // 秒
        const recoveredAp = Math.floor(elapsed / AP_RECOVERY_INTERVAL_SEC);

        if (recoveredAp > 0) {
          const newAp = Math.min(p.maxAp, p.ap + recoveredAp);
          const remainder = elapsed % AP_RECOVERY_INTERVAL_SEC;
          apRecoveryTimeRef.current = now - remainder * 1000;
          storage.saveApRecoveryTime(apRecoveryTimeRef.current);
          const remaining = Math.ceil(AP_RECOVERY_INTERVAL_SEC - remainder);
          setNextApRecoveryIn(newAp >= p.maxAp ? null : remaining);
          return { ...p, ap: newAp };
        }

        const remaining = Math.ceil(
          AP_RECOVERY_INTERVAL_SEC - (now - apRecoveryTimeRef.current) / 1000
        );
        setNextApRecoveryIn(remaining);
        return p;
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };

    // 起動時に即実行（オフライン中の回復を反映）
    tick();
    const id = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Player actions ----

  const addGold = useCallback((amount: number) => {
    setPlayer(p => ({ ...p, gold: p.gold + amount }));
  }, []);

  const addGems = useCallback((amount: number) => {
    setPlayer(p => ({ ...p, gems: p.gems + amount }));
  }, []);

  const spendGold = useCallback((amount: number): boolean => {
    if (player.gold < amount) return false;
    setPlayer(p => ({ ...p, gold: p.gold - amount }));
    return true;
  }, [player.gold]);

  const spendGems = useCallback((amount: number): boolean => {
    if (player.gems < amount) return false;
    setPlayer(p => ({ ...p, gems: p.gems - amount }));
    return true;
  }, [player.gems]);

  const consumeAp = useCallback((amount: number): boolean => {
    if (player.ap < amount) return false;
    setPlayer(p => ({ ...p, ap: p.ap - amount }));
    return true;
  }, [player.ap]);

  const recoverAp = useCallback((amount: number) => {
    setPlayer(p => ({ ...p, ap: p.ap + amount }));
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

  // ---- Items ----

  const addItems = useCallback((key: keyof ItemsState, amount: number) => {
    setItems(prev => ({ ...prev, [key]: prev[key] + amount }));
  }, []);

  const useItem = useCallback((key: keyof ItemsState): boolean => {
    if (items[key] <= 0) return false;
    setItems(prev => ({ ...prev, [key]: prev[key] - 1 }));
    return true;
  }, [items]);

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

  const markQuestCleared = useCallback((id: number) => {
    setClearedQuests(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const incrementGachaPulls = useCallback((amount: number) => {
    setTotalGachaPulls(prev => prev + amount);
  }, []);

  // ---- Battle helpers ----

  const getBattleStats = useCallback(() => {
    const partyChars = party
      .filter(id => id !== null)
      .map(id => getCharacterById(id!))
      .filter(Boolean);

    // レベルボーナス（Lv1で0、以降レベルごとに緩やかに上昇）
    const lvBonus = player.level - 1;

    if (partyChars.length === 0) {
      // 編成なし: デフォルト値 + レベルボーナス
      return { maxHp: 500 + lvBonus * 5, baseAtk: 110 + lvBonus * 2, atkRange: 30 };
    }

    const totalAtk = partyChars.reduce((s, c) => s + (c?.atk ?? 0), 0);
    const totalHp  = partyChars.reduce((s, c) => s + (c?.hp ?? 0), 0);

    const maxHp   = 300 + Math.floor(totalHp / 20) + lvBonus * 5;   // 300 + 各キャラHP/20 + レベルボーナス
    const baseAtk = 90  + Math.floor(totalAtk / 10) + lvBonus * 2;  // 90  + 各キャラATK/10 + レベルボーナス
    const atkRange = 30;

    return { maxHp, baseAtk, atkRange };
  }, [party, player.level]);

  // ---- Debug ----

  const resetAll = useCallback(() => {
    storage.resetAllData();
    setPlayer(storage.getPlayer());
    setParty(storage.getParty());
    setInventory(storage.getInventory());
    setReceivedPresentIds(storage.getReceivedPresentIds());
    setClearedQuests(storage.getClearedQuests());
    setItems(storage.getItems());
  }, []);

  const value: GameContextValue = {
    player, party, inventory, receivedPresentIds, clearedQuests, items,
    nextApRecoveryIn,
    totalGachaPulls,
    addGold, addGems, spendGold, spendGems, consumeAp, recoverAp, addExp,
    addItems, useItem,
    addToInventory, setPartySlot,
    receivePresent, receiveAllPresents, markQuestCleared,
    incrementGachaPulls,
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
