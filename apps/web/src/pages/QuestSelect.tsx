import { Layout } from '../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { Swords, Play, Star, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useGame } from '../context/GameContext';
import { ALL_QUESTS } from '../store/quests';

export const QuestSelect = () => {
  const navigate = useNavigate();
  const { player } = useGame();

  const handleQuestStart = (questId: number, stamina: number) => {
    if (player.ap < stamina) return; // AP不足は出撃させない
    navigate('/battle', { state: { questId } });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Swords className="text-red-500" /> 出撃 (Quests)
          </h2>
          <span className="text-gray-400 text-sm">開催期間: 2026/04/01 ~ 2026/04/02</span>
        </div>

        {/* AP 表示 */}
        <div className="flex items-center gap-3 bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-700">
          <span className="text-green-400 font-bold text-sm">AP:</span>
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-300 transition-all duration-300"
              style={{ width: `${(player.ap / player.maxAp) * 100}%` }}
            />
          </div>
          <span className="font-mono text-sm text-white font-bold">{player.ap} / {player.maxAp}</span>
        </div>

        <div className="grid gap-4">
          {ALL_QUESTS.map((quest) => {
            const insufficient = player.ap < quest.stamina;
            return (
              <div
                key={quest.id}
                className={clsx(
                  'bg-gray-800 rounded-xl p-4 border flex items-center gap-4 transition-colors group relative overflow-hidden',
                  insufficient
                    ? 'border-gray-700 opacity-70 cursor-not-allowed'
                    : 'border-gray-700 hover:bg-gray-750 cursor-pointer'
                )}
                onClick={() => !insufficient && handleQuestStart(quest.id, quest.stamina)}
              >
                {/* Thumbnail */}
                <div className={clsx(
                  'w-20 h-20 bg-gray-900 rounded-lg flex items-center justify-center border transition-colors z-10 overflow-hidden',
                  insufficient ? 'border-gray-700' : 'border-gray-600 group-hover:border-green-500'
                )}>
                  <img src={quest.thumbnail} alt={quest.title} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-green-900/50 text-green-400 text-xs px-2 py-0.5 rounded border border-green-700/50">
                      Chapter {quest.id}
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(quest.difficulty)].map((_, i) => (
                        <Star key={i} size={12} className="text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <h3 className={clsx(
                    'text-lg font-bold transition-colors',
                    insufficient ? 'text-gray-400' : 'text-gray-100 group-hover:text-green-400'
                  )}>
                    {quest.title}
                  </h3>
                  <p className="text-sm text-gray-400">{quest.description}</p>
                  <div className="mt-2 flex gap-4 text-xs font-mono">
                    <span className={clsx('font-bold', insufficient ? 'text-red-400' : 'text-orange-400')}>
                      消費AP: {quest.stamina}
                    </span>
                    <span className="text-yellow-400">GOLD: +{quest.goldReward.toLocaleString()}</span>
                  </div>
                </div>

                {/* Play Button or Insufficient */}
                <div className="z-10">
                  {insufficient ? (
                    <div className="flex flex-col items-center gap-1 text-red-400">
                      <AlertCircle size={28} />
                      <span className="text-xs font-bold">AP不足</span>
                    </div>
                  ) : (
                    <div className="bg-green-600 p-3 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform hover:bg-green-500">
                      <Play fill="currentColor" />
                    </div>
                  )}
                </div>

                {/* Hover Effect */}
                {!insufficient && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default QuestSelect;
