import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Gem, Sparkles, Star, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { useGame } from '../context/GameContext';
import {
  drawRandomCharacter,
  drawTenCharacters,
} from '../store/characters';
import type { Character, Rarity } from '../store/types';

const SINGLE_COST = 100;
const TEN_COST    = 900;

const rarityStyle: Record<Rarity, string> = {
  SSR: 'border-yellow-400 bg-gradient-to-b from-yellow-900/60 to-gray-900 shadow-[0_0_20px_rgba(234,179,8,0.4)]',
  SR:  'border-purple-400 bg-gradient-to-b from-purple-900/60 to-gray-900 shadow-[0_0_12px_rgba(168,85,247,0.3)]',
  R:   'border-gray-500 bg-gradient-to-b from-gray-800 to-gray-900',
};
const rarityBadge: Record<Rarity, string> = {
  SSR: 'bg-yellow-500 text-black',
  SR:  'bg-purple-500 text-white',
  R:   'bg-gray-500 text-white',
};

export const Gacha = () => {
  const { player, spendGems, addToInventory } = useGame();
  const [modal, setModal] = useState<{ cards: Character[]; visible: boolean }>({ cards: [], visible: false });
  const [isAnimating, setIsAnimating] = useState(false);
  const [totalPulls, setTotalPulls] = useState(0);

  const runGacha = (ten: boolean) => {
    const cost = ten ? TEN_COST : SINGLE_COST;
    if (!spendGems(cost)) return; // GEMS不足でキャンセル
    setIsAnimating(true);
    setTimeout(() => {
      const cards = ten ? drawTenCharacters() : [drawRandomCharacter()];
      // インベントリに追加
      cards.forEach(c => addToInventory(c.id));
      setModal({ cards, visible: true });
      setTotalPulls(p => p + cards.length);
      setIsAnimating(false);
    }, 600);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-700 pb-4 gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-yellow-400" /> 青汁スカウト (Gacha)
          </h2>
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
            <Gem size={16} className="text-purple-400" />
            <span className="text-white font-bold font-mono">{player.gems.toLocaleString()}</span>
          </div>
        </div>

        {/* Banner */}
        <div className="relative rounded-2xl overflow-hidden h-40 md:h-56 flex items-center justify-center border border-yellow-500/30 bg-gradient-to-br from-gray-900 via-yellow-900/20 to-gray-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.15)_0%,transparent_70%)]" />
          <div className="z-10 text-center">
            <p className="text-yellow-400 text-xs font-bold tracking-widest mb-2 uppercase">Limited</p>
            <h3 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">聖なる青汁ガチャ</h3>
            <p className="text-gray-300 text-sm mt-2">SSR確率 3%！10連はSR以上確定！</p>
          </div>
          <div className="absolute top-4 right-4 flex gap-1">
            {[...Array(3)].map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
          </div>
        </div>

        {/* Probabilities */}
        <div className="grid grid-cols-3 gap-4 text-sm text-center">
          {[{ label: 'SSR確率', value: '3%', color: 'text-yellow-400' }, { label: 'SR確率', value: '15%', color: 'text-purple-400' }, { label: 'R確率', value: '82%', color: 'text-gray-400' }].map(item => (
            <div key={item.label} className="bg-gray-800/60 rounded-lg p-3 border border-gray-700">
              <p className="text-gray-400">{item.label}</p>
              <p className={clsx('text-2xl font-bold', item.color)}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => runGacha(false)}
            disabled={isAnimating || player.gems < SINGLE_COST}
            className="relative group bg-gradient-to-br from-gray-700 to-gray-800 hover:from-purple-900/60 hover:to-purple-800/60 border border-gray-600 hover:border-purple-500 rounded-xl p-6 flex flex-col items-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
          >
            <Gem size={32} className="text-purple-400" />
            <span className="font-black text-xl text-white">単発ガチャ</span>
            <div className="flex items-center gap-1 text-purple-300"><Gem size={14} /><span className="font-mono font-bold">{SINGLE_COST}</span></div>
          </button>
          <button
            onClick={() => runGacha(true)}
            disabled={isAnimating || player.gems < TEN_COST}
            className="relative group bg-gradient-to-br from-yellow-900/40 to-gray-800 hover:from-yellow-800/60 hover:to-yellow-900/60 border border-yellow-700/50 hover:border-yellow-400 rounded-xl p-6 flex flex-col items-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
          >
            <Sparkles size={32} className="text-yellow-400" />
            <span className="font-black text-xl text-white">10連ガチャ</span>
            <div className="flex items-center gap-1 text-yellow-300"><Gem size={14} /><span className="font-mono font-bold">{TEN_COST}</span></div>
            <span className="text-xs text-yellow-500 font-bold">SR以上確定！</span>
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm">累計スカウト回数: <span className="text-gray-300 font-mono font-bold">{totalPulls}</span> 回</p>

        {/* Loading overlay */}
        {isAnimating && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="text-white text-center">
              <RotateCcw size={48} className="animate-spin text-yellow-400 mx-auto mb-4" />
              <p className="text-xl font-bold">ガチャ演出中……</p>
            </div>
          </div>
        )}

        {/* Result Modal */}
        {modal.visible && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-3xl w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-center text-white mb-6">
                {modal.cards.length > 1 ? '10連結果！' : 'スカウト結果！'}
              </h3>
              <div className={clsx('grid gap-2 md:gap-3', modal.cards.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-3 md:grid-cols-5')}>
                {modal.cards.map((card, i) => (
                  <div key={i} className={clsx('rounded-xl border-2 p-3 flex flex-col items-center gap-1 text-center', rarityStyle[card.rarity])} style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={clsx('text-[10px] font-black px-1.5 py-0.5 rounded', rarityBadge[card.rarity])}>{card.rarity}</span>
                      <span className="text-base">{card.emoji}</span>
                    </div>
                    <div className="w-16 h-16 md:w-20 md:h-20 relative flex items-center justify-center mb-1">
                      {card.image ? (
                        <img src={card.image} alt={card.name} className="w-full h-full object-contain drop-shadow-md" />
                      ) : (
                        <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center text-2xl">{card.emoji}</div>
                      )}
                    </div>
                    <p className="text-white font-bold text-[10px] md:text-xs leading-tight line-clamp-1 w-full">{card.name}</p>
                    <p className="text-gray-400 text-[9px] md:text-[10px] line-clamp-1 w-full">{card.title}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setModal({ cards: [], visible: false })} className="mt-6 w-full py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded-xl transition-colors">
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Gacha;
