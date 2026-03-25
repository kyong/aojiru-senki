import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Mail, CheckCheck, Gift } from 'lucide-react';
import { clsx } from 'clsx';

type PresentType = 'gold' | 'gem' | 'item';

type Present = {
  id: number;
  title: string;
  description: string;
  type: PresentType;
  amount: number;
  emoji: string;
  expiry: string;
  received: boolean;
};

const initialPresents: Present[] = [
  { id: 1, title: 'ログインボーナス',       description: '本日のログインボーナス',           type: 'gem',  amount: 50,     emoji: '💎', expiry: '2026/04/02', received: false },
  { id: 2, title: '初回クエストクリア報酬', description: '第1章クリアおめでとうございます！', type: 'gold', amount: 10000,  emoji: '🪙', expiry: '2026/04/07', received: false },
  { id: 3, title: 'イベント参加報酬',       description: '「聖なる苦味のワンデイ・ウォー」参加', type: 'gem', amount: 100, emoji: '💎', expiry: '2026/04/03', received: false },
  { id: 4, title: '青汁ポーション×5',      description: 'メンテナンス補償',                type: 'item', amount: 5,      emoji: '🧃', expiry: '2026/04/10', received: false },
  { id: 5, title: 'ゴールド大量配布',       description: '開設記念キャンペーン',             type: 'gold', amount: 100000, emoji: '🪙', expiry: '2026/04/15', received: false },
];

const typeLabel: Record<PresentType, string> = {
  gold: 'GOLD',
  gem:  'GEM',
  item: 'アイテム',
};

const typeBadge: Record<PresentType, string> = {
  gold: 'bg-yellow-500/20 text-yellow-400 border-yellow-700/50',
  gem:  'bg-purple-500/20 text-purple-400 border-purple-700/50',
  item: 'bg-green-500/20 text-green-400 border-green-700/50',
};

export const Present = () => {
  const [presents, setPresents] = useState<Present[]>(initialPresents);

  const receive = (id: number) => {
    setPresents(prev => prev.map(p => p.id === id ? { ...p, received: true } : p));
  };

  const receiveAll = () => {
    setPresents(prev => prev.map(p => ({ ...p, received: true })));
  };

  const pendingCount = presents.filter(p => !p.received).length;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="text-blue-400" />
            プレゼント
            {pendingCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </h2>
          <button
            onClick={receiveAll}
            disabled={pendingCount === 0}
            className="flex items-center gap-2 px-5 py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors text-sm"
          >
            <CheckCheck size={16} />
            すべて受け取る
          </button>
        </div>

        {/* Present List */}
        <div className="flex flex-col gap-3">
          {presents.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Gift size={48} className="mx-auto mb-3 opacity-30" />
              <p>プレゼントはありません</p>
            </div>
          )}
          {presents.map(p => (
            <div
              key={p.id}
              className={clsx(
                'flex items-center gap-4 p-4 rounded-xl border transition-all',
                p.received
                  ? 'bg-gray-800/30 border-gray-700/50 opacity-50'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-500'
              )}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-2xl border border-gray-700 flex-shrink-0">
                {p.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={clsx('text-xs px-2 py-0.5 rounded border', typeBadge[p.type])}>
                    {typeLabel[p.type]}
                  </span>
                  <span className="font-bold text-white">{p.title}</span>
                </div>
                <p className="text-sm text-gray-400 truncate">{p.description}</p>
                <p className="text-xs text-gray-500 mt-1">有効期限: {p.expiry}</p>
              </div>

              {/* Amount & Button */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="font-mono font-bold text-gray-200">
                  {p.type === 'item' ? `×${p.amount}` : `+${p.amount.toLocaleString()}`}
                </span>
                {p.received ? (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <CheckCheck size={14} /> 受取済み
                  </span>
                ) : (
                  <button
                    onClick={() => receive(p.id)}
                    className="px-4 py-1.5 bg-green-700 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    受け取る
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Present;
