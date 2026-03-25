import React from 'react';
import { Coins, Gem, Zap } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export const Header: React.FC = () => {
  const { player, nextApRecoveryIn } = useGame();

  return (
    <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 fixed w-full top-0 z-50">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
          青汁戦記
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* AP */}
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
          <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
            <Zap size={14} className="text-green-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 leading-none">AP</span>
              {nextApRecoveryIn === null ? (
                <span className="text-[10px] text-green-400 font-bold leading-none">MAX</span>
              ) : (
                <span className="text-[10px] text-yellow-400 font-mono leading-none">
                  +1 in {String(Math.floor(nextApRecoveryIn / 60)).padStart(2, '0')}:{String(nextApRecoveryIn % 60).padStart(2, '0')}
                </span>
              )}
            </div>
            <span className="text-sm font-bold text-gray-100 font-mono">{player.ap} / {player.maxAp}</span>
          </div>
        </div>

        {/* GOLD */}
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
          <div className="w-7 h-7 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Coins size={14} className="text-yellow-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 leading-none">GOLD</span>
            <span className="text-sm font-bold text-gray-100 font-mono">{player.gold.toLocaleString()}</span>
          </div>
        </div>

        {/* GEMS */}
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
          <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Gem size={14} className="text-purple-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 leading-none">GEMS</span>
            <span className="text-sm font-bold text-gray-100 font-mono">{player.gems.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
