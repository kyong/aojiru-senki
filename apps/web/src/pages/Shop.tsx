import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { ShoppingBag, Coins } from 'lucide-react';
import { clsx } from 'clsx';
import { useGame } from '../context/GameContext';

type ShopItem = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  price: number;
  itemKey: keyof import('../store/types').ItemsState;
};

const SHOP_ITEMS: ShopItem[] = [
  { id: 'potion1',  name: '青汁ポーション×1',  description: 'HPを200回復する回復アイテム。',          emoji: '🧃', price: 500,   itemKey: 'aojiruPotion' },
  { id: 'potion5',  name: '青汁ポーション×5',  description: 'お得な5個セット！',                    emoji: '🧃', price: 2000,  itemKey: 'aojiruPotion' },
  { id: 'potion10', name: '青汁ポーション×10', description: 'まとめ買いでさらにお得！',              emoji: '🧃', price: 3500,  itemKey: 'aojiruPotion' },
  { id: 'chohado1', name: '超波動青汁×1',      description: 'クエスト開始時に使用。ATK+30%・HP+20%。', emoji: '🌀', price: 5000,  itemKey: 'choHadoAojiru' },
  { id: 'chohado3', name: '超波動青汁×3',      description: 'お得な3個セット！',                    emoji: '🌀', price: 12000, itemKey: 'choHadoAojiru' },
];

const AMOUNTS: Record<string, number> = { potion1: 1, potion5: 5, potion10: 10, chohado1: 1, chohado3: 3 };

export const Shop = () => {
  const { player, items, spendGold, addItems } = useGame();
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = (item: ShopItem) => {
    if (!spendGold(item.price)) {
      setError('GOLDが足りません！');
      setTimeout(() => setError(null), 2000);
      return;
    }
    const amount = AMOUNTS[item.id] ?? 1;
    addItems(item.itemKey, amount);
    setFlash(item.id);
    setTimeout(() => setFlash(null), 600);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-700 pb-4 gap-3">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="text-yellow-400" />
            ショップ
          </h2>
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
            <Coins size={16} className="text-yellow-400" />
            <span className="font-mono font-bold text-yellow-300">{player.gold.toLocaleString()}</span>
            <span className="text-xs text-gray-400">GOLD</span>
          </div>
        </div>

        {/* 所持アイテム表示 */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-lg">🧃</span>
          <span className="text-sm text-gray-300">青汁ポーション:</span>
          <span className="font-mono font-bold text-green-400 text-lg">{items.aojiruPotion}</span>
          <span className="text-gray-600 mx-1">|</span>
          <span className="text-lg">🌀</span>
          <span className="text-sm text-gray-300">超波動青汁:</span>
          <span className="font-mono font-bold text-cyan-400 text-lg">{items.choHadoAojiru}</span>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm font-bold rounded-lg px-4 py-2 text-center animate-pulse">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {SHOP_ITEMS.map(item => (
            <div key={item.id} className={clsx(
              'flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border transition-all',
              flash === item.id
                ? 'bg-green-900/40 border-green-500 scale-[1.02]'
                : 'bg-gray-800 border-gray-700 hover:border-gray-500'
            )}>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-900 flex items-center justify-center text-xl md:text-2xl border border-gray-700 shrink-0">
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-white">{item.name}</span>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="font-mono font-bold text-yellow-300 flex items-center gap-1">
                  <Coins size={14} className="text-yellow-400" />
                  {item.price.toLocaleString()}
                </span>
                <button
                  onClick={() => handleBuy(item)}
                  disabled={player.gold < item.price}
                  className={clsx(
                    'px-4 py-1.5 text-sm font-bold rounded-lg transition-colors',
                    player.gold >= item.price
                      ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  )}
                >
                  購入
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
