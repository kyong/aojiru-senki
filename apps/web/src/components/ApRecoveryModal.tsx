import React from 'react';
import { AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useGame } from '../context/GameContext';
import { soundManager } from '../utils/sound';

interface ApRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApRecoveryModal: React.FC<ApRecoveryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { player, spendGems, recoverAp } = useGame();
  const AP_RECOVERY_COST = 50;
  const AP_RECOVERY_AMOUNT = player.maxAp;

  if (!isOpen) return null;

  const handleRecoverAp = () => {
    soundManager.playPikori();
    if (spendGems(AP_RECOVERY_COST)) {
      recoverAp(AP_RECOVERY_AMOUNT);
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
        <h3 className="text-xl font-bold text-center text-white mb-4 flex items-center justify-center gap-2">
          AP回復
        </h3>
        <p className="text-center text-gray-300 text-sm mb-6 leading-relaxed">
          ジェムを消費してAPを全回復しますか？<br/>
          <span className="text-[10px] text-gray-500">※現在のAPに最大AP分が加算されます</span>
        </p>
        
        <div className="flex flex-col gap-2 bg-gray-800 rounded-xl p-4 mb-8">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">消費ジェム</span>
            <span className="font-mono text-pink-400 font-bold">-{AP_RECOVERY_COST} GEMS</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-gray-700 pt-2">
            <span className="text-gray-400">回復AP</span>
            <span className="font-mono text-green-400 font-bold">+{AP_RECOVERY_AMOUNT} AP</span>
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
            onClick={() => { soundManager.playPikori(); onClose(); }}
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
        
        {player.gems < AP_RECOVERY_COST && (
          <div className="mt-4 flex items-center gap-2 text-red-400 text-[10px] justify-center">
            <AlertCircle size={12} />
            <span>ジェムが不足しています</span>
          </div>
        )}
      </div>
    </div>
  );
};
