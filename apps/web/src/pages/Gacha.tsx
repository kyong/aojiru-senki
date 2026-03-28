import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Gem, Sparkles, Star, RotateCcw, Play } from 'lucide-react';
import { clsx } from 'clsx';
import { useGame } from '../context/GameContext';
import { AdRewardModal } from '../components/AdRewardModal';
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
  const { player, spendGems, addToInventory, totalGachaPulls, incrementGachaPulls } = useGame();
  const [modal, setModal] = useState<{ cards: Character[]; visible: boolean }>({ cards: [], visible: false });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);

  const runGacha = (ten: boolean) => {
    const cost = ten ? TEN_COST : SINGLE_COST;
    if (!spendGems(cost)) return; // GEMS不足でキャンセル
    setIsAnimating(true);
    setTimeout(() => {
      const cards = ten ? drawTenCharacters() : [drawRandomCharacter()];
      // インベントリに追加
      cards.forEach(c => addToInventory(c.id));
      setModal({ cards, visible: true });
      incrementGachaPulls(cards.length);
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

        {/* Ad Reward Banner - Moved to top */}
        <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4 shadow-xl backdrop-blur-sm group hover:border-purple-500/60 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <Play size={24} className="text-purple-400 fill-purple-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm md:text-base">ジェムが足りませんか？</p>
              <p className="text-purple-300 text-xs md:text-sm">広告視聴で <span className="text-yellow-400 font-black">50 GEMS 〜</span> 獲得チャンス！</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAdModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm md:text-base transition-all shadow-lg active:scale-95 hover:shadow-purple-500/20"
          >
            今すぐ視聴
          </button>
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
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-4 text-sm text-center">
            {[{ label: 'SSR確率', value: '3%', color: 'text-yellow-400' }, { label: 'SR確率', value: '15%', color: 'text-purple-400' }, { label: 'R確率', value: '82%', color: 'text-gray-400' }].map(item => (
              <div key={item.label} className="bg-gray-800/60 rounded-lg p-3 border border-gray-700">
                <p className="text-gray-400 text-[10px] md:text-sm">{item.label}</p>
                <p className={clsx('text-xl md:text-2xl font-bold', item.color)}>{item.value}</p>
              </div>
            ))}
          </div>
          <Link 
            to="/gacha/list" 
            className="flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-white transition-colors bg-gray-800/30 py-2 rounded-lg border border-gray-700/50 hover:border-gray-600 group"
          >
            <Star size={14} className="group-hover:text-yellow-400 transition-colors" />
            <span>ガチャ排出リスト・提供割合を確認する</span>
          </Link>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => runGacha(false)}
            disabled={isAnimating || player.gems < SINGLE_COST}
            className="relative group bg-gradient-to-br from-gray-700 to-gray-800 hover:from-purple-900/60 hover:to-purple-800/60 border border-gray-600 hover:border-purple-500 rounded-xl p-6 flex flex-col items-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden shadow-lg"
          >
            <Gem size={32} className="text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="font-black text-xl text-white">単発ガチャ</span>
            <div className="flex items-center gap-1 text-purple-300"><Gem size={14} /><span className="font-mono font-bold">{SINGLE_COST}</span></div>
          </button>
          <button
            onClick={() => runGacha(true)}
            disabled={isAnimating || player.gems < TEN_COST}
            className="relative group bg-gradient-to-br from-yellow-900/40 to-gray-800 hover:from-yellow-800/60 hover:to-yellow-900/60 border border-yellow-700/50 hover:border-yellow-400 rounded-xl p-6 flex flex-col items-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden shadow-lg"
          >
            <Sparkles size={32} className="text-yellow-400 group-hover:scale-110 transition-transform" />
            <span className="font-black text-xl text-white">10連ガチャ</span>
            <div className="flex items-center gap-1 text-yellow-300"><Gem size={14} /><span className="font-mono font-bold">{TEN_COST}</span></div>
            <span className="text-xs text-yellow-500 font-bold">SR以上確定！</span>
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm">累計スカウト回数: <span className="text-gray-300 font-mono font-bold">{totalGachaPulls}</span> 回</p>

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
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-2 md:p-4 backdrop-blur-md">
            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-4 md:p-8 max-w-3xl w-full max-h-[95vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
              <h3 className="text-xl md:text-3xl font-black text-center text-white mb-4 md:mb-8 tracking-tight">
                {modal.cards.length > 1 ? '10連スカウト結果！' : 'スカウト結果！'}
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <div className={clsx(
                  'grid gap-3 md:gap-4 pb-4',
                  modal.cards.length === 1 ? 'grid-cols-1 max-w-[240px] mx-auto' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
                )}>
                  {modal.cards.map((card, i) => (
                    <div 
                      key={i} 
                      className={clsx(
                        'rounded-2xl border-2 p-3 flex flex-col items-center gap-1 text-center transition-all duration-500 animate-in fade-in zoom-in',
                        rarityStyle[card.rarity]
                      )} 
                      style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={clsx('text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm', rarityBadge[card.rarity])}>{card.rarity}</span>
                        <span className="text-sm md:text-base">{card.emoji}</span>
                      </div>
                      <div className="w-16 h-16 md:w-20 md:h-20 relative flex items-center justify-center mb-1">
                        {card.image ? (
                          <img src={card.image} alt={card.name} className="w-full h-full object-contain drop-shadow-xl" />
                        ) : (
                          <div className="w-full h-full bg-gray-800/50 rounded-xl flex items-center justify-center text-3xl">{card.emoji}</div>
                        )}
                      </div>
                      <p className="text-white font-black text-[10px] md:text-xs leading-tight line-clamp-1 w-full">{card.name}</p>
                      <p className="text-gray-400 text-[9px] md:text-[10px] font-medium line-clamp-1 w-full opacity-80">{card.title}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setModal({ cards: [], visible: false })} 
                className="mt-4 md:mt-8 w-full py-4 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] hover:shadow-green-500/20"
              >
                スカウト結果を閉じる
              </button>
            </div>
          </div>
        )}
      </div>
      <AdRewardModal open={isAdModalOpen} onClose={() => setIsAdModalOpen(false)} />
    </Layout>
  );
};

export default Gacha;
