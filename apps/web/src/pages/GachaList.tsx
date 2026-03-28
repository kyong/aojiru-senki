import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ChevronLeft, Star, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { ALL_CHARACTERS, RARITY_WEIGHTS } from '../store/characters';
import type { Rarity } from '../store/types';

const rarityStyle: Record<Rarity, string> = {
  SSR: 'border-yellow-400 bg-gradient-to-b from-yellow-900/40 to-gray-900 shadow-[0_0_15px_rgba(234,179,8,0.2)]',
  SR:  'border-purple-400 bg-gradient-to-b from-purple-900/40 to-gray-900 shadow-[0_0_10px_rgba(168,85,247,0.15)]',
  R:   'border-gray-500 bg-gradient-to-b from-gray-800 to-gray-900',
};

const rarityBadge: Record<Rarity, string> = {
  SSR: 'bg-yellow-500 text-black',
  SR:  'bg-purple-500 text-white',
  R:   'bg-gray-500 text-white',
};

const rarityText: Record<Rarity, string> = {
  SSR: 'text-yellow-400',
  SR:  'text-purple-400',
  R:   'text-gray-400',
};

export const GachaList = () => {
  // 主人公を除外し、レアリティごとにグループ化
  const gachaPool = ALL_CHARACTERS.filter(c => c.id !== 1);
  const groups: Record<Rarity, typeof gachaPool> = {
    SSR: gachaPool.filter(c => c.rarity === 'SSR'),
    SR:  gachaPool.filter(c => c.rarity === 'SR'),
    R:   gachaPool.filter(c => c.rarity === 'R'),
  };

  const rarities: Rarity[] = ['SSR', 'SR', 'R'];

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 pb-4">
          <div className="flex items-center gap-3">
            <Link 
              to="/gacha" 
              className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <ChevronLeft size={24} />
            </Link>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Info className="text-blue-400" size={24} /> 排出リスト・提供割合
            </h2>
          </div>
        </div>

        {/* Probability Summary */}
        <div className="grid grid-cols-3 gap-4">
          {rarities.map(r => (
            <div key={r} className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 text-center">
              <p className={clsx('text-xs font-black px-2 py-0.5 rounded inline-block mb-2', rarityBadge[r])}>
                {r}
              </p>
              <p className={clsx('text-2xl font-black font-mono leading-none', rarityText[r])}>
                {RARITY_WEIGHTS[r]}%
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4 text-xs text-gray-400 bg-gray-900/50 p-4 rounded-xl border border-gray-800 border-dashed">
          <p>※ 10連ガチャの10回目はSR以上が確定します。</p>
          <p>※ 各レアリティ内の個別提供割合は、そのレアリティの合計提供割合を該当キャラクター数で均等に分割した数値となります。</p>
        </div>

        {/* Character Lists */}
        <div className="space-y-12 pb-12">
          {rarities.map(r => (
            <section key={r} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-800 pb-2">
                <Star className={clsx(rarityText[r], "fill-current")} size={18} />
                <h3 className={clsx("text-lg font-bold", rarityText[r])}>
                  {r} キャラクター ({groups[r].length}体)
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groups[r].map(char => (
                  <Link 
                    key={char.id} 
                    to={`/character/${char.id}`}
                    className={clsx(
                      "flex items-center gap-4 p-3 rounded-xl border transition-all hover:translate-x-1 hover:border-white/40 hover:shadow-lg duration-200",
                      rarityStyle[r]
                    )}
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-800/80 rounded-lg flex items-center justify-center text-2xl shrink-0 overflow-hidden border border-white/5">
                      {char.image ? (
                        <img src={char.image} alt={char.name} className="w-full h-full object-contain" />
                      ) : (
                        char.emoji
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={clsx("text-[10px] font-black px-1 rounded", rarityBadge[r])}>
                          {r}
                        </span>
                        <p className="text-white font-bold text-sm truncate">{char.name}</p>
                      </div>
                      <p className="text-gray-400 text-xs truncate mt-0.5">{char.title}</p>
                      <div className="flex gap-3 mt-1.5">
                         <span className="text-[10px] text-red-400 font-mono text-xs">ATK: {char.atk}</span>
                         <span className="text-[10px] text-blue-400 font-mono text-xs">DEF: {char.def}</span>
                         <span className="text-[10px] text-green-400 font-mono text-xs">HP: {char.hp}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default GachaList;
