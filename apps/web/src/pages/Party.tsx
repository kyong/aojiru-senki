import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Users, PlusCircle, X, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

type Rarity = 'SSR' | 'SR' | 'R';

type Character = {
  id: number;
  name: string;
  role: string;
  rarity: Rarity;
  emoji: string;
  atk: number;
  def: number;
  hp: number;
};

const ALL_CHARACTERS: Character[] = [
  { id: 1, name: '青汁マイスター', role: '剣士',  rarity: 'SSR', emoji: '⚔️', atk: 320, def: 180, hp: 5000 },
  { id: 2, name: 'ケナ氏',        role: '弓使い', rarity: 'SSR', emoji: '📸', atk: 290, def: 150, hp: 4200 },
  { id: 3, name: 'ブロッコリ騎士', role: '防衛',  rarity: 'SR',  emoji: '🥦', atk: 200, def: 310, hp: 6000 },
  { id: 4, name: '大麦戦士バーライ', role: '回復', rarity: 'SR', emoji: '🌾', atk: 180, def: 220, hp: 5500 },
  { id: 5, name: '小松菜の子',    role: '魔法',   rarity: 'R',   emoji: '🌿', atk: 250, def: 120, hp: 3800 },
  { id: 6, name: 'ほうれん草ナイト', role: '戦士', rarity: 'R',  emoji: '🍃', atk: 220, def: 180, hp: 4000 },
  { id: 7, name: 'ゴーヤ坊や',    role: '斥候',   rarity: 'R',   emoji: '🌱', atk: 200, def: 130, hp: 3500 },
];

const SLOT_COUNT = 3;

const rarityBadge: Record<Rarity, string> = {
  SSR: 'bg-yellow-500 text-black',
  SR:  'bg-purple-500 text-white',
  R:   'bg-gray-500 text-white',
};

const rarityBorder: Record<Rarity, string> = {
  SSR: 'border-yellow-500/60',
  SR:  'border-purple-500/60',
  R:   'border-gray-600',
};

export const Party = () => {
  const [slots, setSlots] = useState<(Character | null)[]>(Array(SLOT_COUNT).fill(null));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const assignCharacter = (char: Character) => {
    if (selectedSlot === null) return;
    // 既に同じキャラが別スロットにいた場合は入れ替え
    const existingSlot = slots.findIndex(s => s?.id === char.id);
    const newSlots = [...slots];
    if (existingSlot !== -1) newSlots[existingSlot] = null;
    newSlots[selectedSlot] = char;
    setSlots(newSlots);
    setSelectedSlot(null);
  };

  const removeFromSlot = (slotIndex: number) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);
  };

  const totalAtk = slots.reduce((sum, c) => sum + (c?.atk ?? 0), 0);
  const totalDef = slots.reduce((sum, c) => sum + (c?.def ?? 0), 0);
  const totalHp  = slots.reduce((sum, c) => sum + (c?.hp ?? 0), 0);

  const assignedIds = new Set(slots.filter(Boolean).map(c => c!.id));

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-blue-400" /> 編成 (Party)
          </h2>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>ATK: <span className="text-red-400 font-bold font-mono">{totalAtk}</span></span>
            <span>DEF: <span className="text-blue-400 font-bold font-mono">{totalDef}</span></span>
            <span>HP: <span className="text-green-400 font-bold font-mono">{totalHp.toLocaleString()}</span></span>
          </div>
        </div>

        {/* Formation Slots */}
        <div>
          <p className="text-gray-400 text-sm mb-3">
            {selectedSlot !== null
              ? `スロット ${selectedSlot + 1} にセットするキャラを選んでください`
              : 'スロットをタップして配置するキャラを選択'}
          </p>
          <div className="grid grid-cols-3 gap-4">
            {slots.map((char, i) => (
              <div
                key={i}
                onClick={() => { if (!char) setSelectedSlot(i); }}
                className={clsx(
                  'relative rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all cursor-pointer min-h-[160px] justify-center',
                  selectedSlot === i
                    ? 'border-green-400 bg-green-900/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                    : char
                    ? clsx('bg-gray-800', rarityBorder[char.rarity])
                    : 'border-dashed border-gray-600 bg-gray-800/30 hover:border-gray-400 hover:bg-gray-800/50'
                )}
              >
                {char ? (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromSlot(i); }}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                    <span className="text-4xl">{char.emoji}</span>
                    <span className={clsx('text-xs font-black px-2 py-0.5 rounded-full', rarityBadge[char.rarity])}>
                      {char.rarity}
                    </span>
                    <p className="text-white font-bold text-center text-sm">{char.name}</p>
                    <p className="text-gray-400 text-xs">{char.role}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedSlot(i); }}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                    >
                      変更 <ChevronRight size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <PlusCircle size={32} className="text-gray-600" />
                    <p className="text-gray-500 text-sm">スロット {i + 1}</p>
                    {selectedSlot === i && <p className="text-green-400 text-xs font-bold">← 選択中</p>}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Character List */}
        <div>
          <h3 className="text-lg font-bold text-gray-300 mb-3">所持キャラクター</h3>
          <div className="grid grid-cols-2 gap-3">
            {ALL_CHARACTERS.map(char => {
              const inParty = assignedIds.has(char.id);
              return (
                <div
                  key={char.id}
                  onClick={() => selectedSlot !== null && !inParty && assignCharacter(char)}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all',
                    inParty
                      ? 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                      : selectedSlot !== null
                      ? 'border-gray-600 bg-gray-800 hover:border-green-400 hover:bg-green-900/20 cursor-pointer'
                      : 'border-gray-700 bg-gray-800 cursor-default'
                  )}
                >
                  <span className="text-3xl">{char.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={clsx('text-xs font-black px-1.5 py-0.5 rounded', rarityBadge[char.rarity])}>
                        {char.rarity}
                      </span>
                      <span className="text-white font-bold text-sm truncate">{char.name}</span>
                    </div>
                    <div className="flex gap-2 text-xs text-gray-400 font-mono">
                      <span>ATK {char.atk}</span>
                      <span>DEF {char.def}</span>
                      <span>HP {char.hp.toLocaleString()}</span>
                    </div>
                  </div>
                  {inParty && <span className="text-xs text-green-500 font-bold whitespace-nowrap">編成中</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Party;
