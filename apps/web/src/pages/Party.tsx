import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Link } from 'react-router-dom';
import { Users, PlusCircle, X, ChevronRight, Zap, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { useGame } from '../context/GameContext';
import { getCharacterById, ALL_CHARACTERS } from '../store/characters';
import type { Rarity } from '../store/types';

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

const SLOT_COUNT = 3;

export const Party = () => {
  const { party, inventory, setPartySlot, getBattleStats } = useGame();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const assignCharacter = (charId: number) => {
    if (selectedSlot === null) return;
    setPartySlot(selectedSlot, charId);
    setSelectedSlot(null);
  };

  const removeFromSlot = (slot: number) => {
    setPartySlot(slot, null);
  };

  const stats = getBattleStats();
  const ownedChars = inventory.map(id => getCharacterById(id)).filter(Boolean);
  const assignedIds = new Set(party.filter(Boolean));

  return (
    <Layout>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-700 pb-4 gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-blue-400" /> 編成 (Party)
          </h2>
          <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-400">
            <span>ATK: <span className="text-red-400 font-bold font-mono">+{stats.baseAtk - 90}</span></span>
            <span>HP: <span className="text-green-400 font-bold font-mono">+{stats.maxHp - 300}</span></span>
            <span>Total: <span className="text-white font-bold font-mono">{stats.maxHp}</span></span>
          </div>
        </div>

        {/* Formation Slots */}
        <div>
          <p className="text-gray-400 text-sm mb-3">
            {selectedSlot !== null
              ? `スロット ${selectedSlot + 1} にセットするキャラを選んでください`
              : 'スロットをタップして配置するキャラを選択'
            }
          </p>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: SLOT_COUNT }, (_, i) => {
              const charId = party[i] ?? null;
              const char = charId !== null ? getCharacterById(charId) : null;
              return (
                <div key={i} onClick={() => { if (!char) setSelectedSlot(i); }}
                  className={clsx(
                    'relative rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all cursor-pointer min-h-[160px] justify-center',
                    selectedSlot === i
                      ? 'border-green-400 bg-green-900/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                      : char
                      ? clsx('bg-gray-800', rarityBorder[char.rarity])
                      : 'border-dashed border-gray-600 bg-gray-800/30 hover:border-gray-400 hover:bg-gray-800/50'
                  )}>
                  {char ? (
                    <>
                      <button onClick={e => { e.stopPropagation(); removeFromSlot(i); }} className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors"><X size={16} /></button>
                      <div className="w-20 h-20 relative flex items-center justify-center mb-1">
                        {char.image ? (
                          <img src={char.image} alt={char.name} className="w-full h-full object-contain drop-shadow-lg" />
                        ) : (
                          <span className="text-4xl">{char.emoji}</span>
                        )}
                      </div>
                      <span className={clsx('text-xs font-black px-2 py-0.5 rounded-full', rarityBadge[char.rarity])}>{char.rarity}</span>
                      <p className="text-white font-bold text-center text-sm">{char.name}</p>
                      <p className="text-gray-400 text-xs">{char.title}</p>
                      <div className="flex gap-2 mt-1">
                        <button onClick={e => { e.stopPropagation(); setSelectedSlot(i); }} className="text-[10px] md:text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                          変更 <ChevronRight size={10} />
                        </button>
                        <Link to={`/character/${char.id}`} onClick={e => e.stopPropagation()} className="text-[10px] md:text-xs text-gray-400 hover:text-white flex items-center gap-1">
                          詳細 <Info size={10} />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={32} className="text-gray-600" />
                      <p className="text-gray-500 text-sm">スロット {i + 1}</p>
                      {selectedSlot === i && <p className="text-green-400 text-xs font-bold">← 選択中</p>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Owned Characters */}
        <div>
          <h3 className="text-lg font-bold text-gray-300 mb-3">所持キャラクター ({ownedChars.length} / {ALL_CHARACTERS.length})</h3>
          {ownedChars.length === 0 ? (
            <p className="text-gray-500 text-sm">ガチャでキャラクターを入手しよう！</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ownedChars.map(char => {
                if (!char) return null;
                const inParty = assignedIds.has(char.id);
                return (
                  <div key={char.id}
                    onClick={() => selectedSlot !== null && !inParty && assignCharacter(char.id)}
                    className={clsx(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all',
                      inParty
                        ? 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                        : selectedSlot !== null
                        ? 'border-gray-600 bg-gray-800 hover:border-green-400 hover:bg-green-900/20 cursor-pointer'
                        : 'border-gray-700 bg-gray-800 cursor-default'
                    )}>
                    <div className="w-12 h-12 flex-shrink-0 relative flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                      {char.image ? (
                        <img src={char.image} alt={char.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl">{char.emoji}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={clsx('text-xs font-black px-1.5 py-0.5 rounded', rarityBadge[char.rarity])}>{char.rarity}</span>
                        <span className="text-white font-bold text-sm truncate">{char.name}</span>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-400 font-mono mb-1">
                        <span>ATK {char.atk}</span>
                        <span>DEF {char.def}</span>
                        <span>HP {char.hp.toLocaleString()}</span>
                      </div>
                      <div className="bg-gray-900/50 p-1.5 rounded-lg border border-gray-700/50">
                        <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                           <Zap size={10} /> {char.skill?.name}
                        </p>
                        <p className="text-[9px] text-gray-500 leading-tight">{char.skill?.description}</p>
                      </div>
                    </div>
                      <div className="flex flex-col gap-2">
                        {inParty && <span className="text-[10px] text-green-500 font-bold bg-green-900/20 px-1.5 py-0.5 rounded border border-green-500/20 whitespace-nowrap">編成中</span>}
                        <Link 
                          to={`/character/${char.id}`} 
                          onClick={e => e.stopPropagation()} 
                          className="text-[10px] text-gray-400 hover:text-white bg-gray-900/50 hover:bg-gray-800 px-2 py-1 rounded border border-gray-700/50 flex items-center justify-center gap-1 transition-colors"
                        >
                          詳細 <Info size={10} />
                        </Link>
                      </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Party;
