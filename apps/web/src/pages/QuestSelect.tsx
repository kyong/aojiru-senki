import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { Swords, Play, Star, AlertCircle, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useGame } from '../context/GameContext';
import { ALL_QUESTS } from '../store/quests';
import type { Quest } from '../store/types';

export const QuestSelect = () => {
  const navigate = useNavigate();
  const { player, clearedQuests, spendGems, recoverAp } = useGame();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [apRecoveryQuest, setApRecoveryQuest] = useState<Quest | null>(null);
  const AP_RECOVERY_COST = 50;
  const AP_RECOVERY_AMOUNT = player.maxAp;

  const currentHour = new Date().getHours();
  const availableQuests = ALL_QUESTS.filter((quest) => {
    if (quest.unlockCondition?.requireClearId) {
      if (!clearedQuests.includes(quest.unlockCondition.requireClearId)) {
        return false;
      }
    }
    if (quest.timeCondition?.activeRule === 'every_other_hour') {
      if (currentHour % 2 !== 0) {
        return false;
      }
    }
    return true;
  });

  const handleQuestClick = (quest: Quest) => {
    if (player.ap < quest.stamina) {
      setApRecoveryQuest(quest);
      return;
    }
    setSelectedQuest(quest);
  };

  const handleConfirmStart = () => {
    if (!selectedQuest) return;
    navigate('/battle', { state: { questId: selectedQuest.id } });
  };

  const handleRecoverAp = () => {
    if (spendGems(AP_RECOVERY_COST)) {
      recoverAp(AP_RECOVERY_AMOUNT);
      // 回復後、元のクエストの確認モーダルへ移行するか、閉じるか
      if (apRecoveryQuest) {
        setSelectedQuest(apRecoveryQuest);
        setApRecoveryQuest(null);
      }
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-700 pb-4 gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Swords className="text-red-500" /> 出撃 (Quests)
          </h2>
          <span className="text-gray-400 text-xs md:text-sm">開催期間: 2026/04/01 ~ 2026/04/02</span>
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
          {availableQuests.map((quest) => {
            const insufficient = player.ap < quest.stamina;
            return (
              <div
                key={quest.id}
                className={clsx(
                  'bg-gray-800 rounded-xl p-3 md:p-4 border flex items-center gap-3 md:gap-4 transition-colors group relative overflow-hidden',
                  insufficient
                    ? 'border-gray-700 opacity-80 cursor-pointer'
                    : 'border-gray-700 hover:bg-gray-750 cursor-pointer'
                )}
                onClick={() => handleQuestClick(quest)}
              >
                {/* Thumbnail */}
                <div className={clsx(
                  'w-14 h-14 md:w-20 md:h-20 bg-gray-900 rounded-lg flex items-center justify-center border transition-colors z-10 overflow-hidden flex-shrink-0',
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
                    'text-base md:text-lg font-bold transition-colors',
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

      {/* Confirm Modal */}
      {selectedQuest && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-center text-white mb-2">
              出撃確認
            </h3>
            <p className="text-center text-gray-300 mb-6">
              <span className="font-bold text-green-400">「{selectedQuest.title}」</span><br/>に出撃しますか？
            </p>
            
            <div className="flex items-center justify-center gap-4 bg-gray-800 rounded-xl p-4 mb-8">
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1">現在のAP</p>
                <p className="text-white font-mono font-bold">{player.ap}</p>
              </div>
              <ArrowRight className="text-gray-600" />
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1">消費後AP</p>
                <p className="text-orange-400 font-mono font-bold">
                  {player.ap - selectedQuest.stamina}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setSelectedQuest(null)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmStart}
                className="flex-1 flex justify-center items-center gap-2 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-900/50"
              >
                <Swords size={18} /> 出撃する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AP Recovery Modal */}
      {apRecoveryQuest && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-center text-white mb-4">
              AP回復
            </h3>
            <p className="text-center text-gray-300 text-sm mb-6 leading-relaxed">
              APが不足しています。<br/>
              ジェムを消費してAPを回復しますか？
            </p>
            
            <div className="flex flex-col gap-2 bg-gray-800 rounded-xl p-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">消費ジェム</span>
                <span className="font-mono text-pink-400 font-bold">-{AP_RECOVERY_COST}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-gray-700 pt-2">
                <span className="text-gray-400">回復AP</span>
                <span className="font-mono text-green-400 font-bold">+{AP_RECOVERY_AMOUNT}</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-2 text-gray-500">
                <span>所持ジェム</span>
                <span className={clsx("font-mono", player.gems < AP_RECOVERY_COST ? 'text-red-400' : 'text-gray-300')}>
                  {player.gems.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setApRecoveryQuest(null)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={handleRecoverAp}
                disabled={player.gems < AP_RECOVERY_COST}
                className="flex-1 py-3 bg-green-700 hover:bg-green-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-green-900/50"
              >
                回復する
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default QuestSelect;
