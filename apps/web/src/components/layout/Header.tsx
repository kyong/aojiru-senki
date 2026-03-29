import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Gem, Zap, Volume2, VolumeX } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { AdRewardModal } from '../AdRewardModal';
import { ApRecoveryModal } from '../ApRecoveryModal';
import { soundManager } from '../../utils/sound';
import { clsx } from 'clsx';

export const Header: React.FC = () => {
  const { player, nextApRecoveryIn, settings, updateSettings } = useGame();
  const navigate = useNavigate();
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [apModalOpen, setApModalOpen] = useState(false);

  const toggleMute = () => {
    const newMuted = !settings.isMuted;
    updateSettings({ isMuted: newMuted });
    if (!newMuted) {
      soundManager.playPikori();
    }
  };

  return (
    <div className="h-14 md:h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-3 md:px-6 fixed w-full top-0 z-50">
      <div 
        className="flex items-center gap-2 flex-shrink-0 cursor-pointer group active:scale-95 transition-transform"
        onClick={() => { soundManager.playPikori(); navigate('/'); }}
      >
        <h1 className="font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent text-[10px] leading-tight md:text-[3.2em] md:leading-[1.1] md:whitespace-nowrap md:tracking-normal group-hover:from-green-300 group-hover:to-emerald-500 transition-all">
          <span className="md:hidden">青汁<br />戦記</span>
          <span className="hidden md:inline">青汁戦記</span>
        </h1>
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
        {/* AP */}
        <div 
          onClick={() => { soundManager.playPikori(); setApModalOpen(true); }}
          className="flex items-center gap-1.5 md:gap-2 bg-gray-800 px-2 md:px-3 py-1 rounded-full border border-gray-700 cursor-pointer hover:border-green-500/50 transition-colors"
        >
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-green-500/20 flex items-center justify-center">
            <Zap size={12} className="text-green-400 md:w-3.5 md:h-3.5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="hidden md:inline text-[10px] text-gray-400 leading-none">AP</span>
              {nextApRecoveryIn === null ? (
                <span className="hidden md:inline text-[10px] text-green-400 font-bold leading-none">MAX</span>
              ) : (
                <span className="hidden md:inline text-[10px] text-yellow-400 font-mono leading-none">
                  +1 in {String(Math.floor(nextApRecoveryIn / 60)).padStart(2, '0')}:{String(nextApRecoveryIn % 60).padStart(2, '0')}
                </span>
              )}
            </div>
            <span className="text-xs md:text-sm font-bold text-gray-100 font-mono">{player.ap}/{player.maxAp}</span>
          </div>
        </div>

        {/* GOLD */}
        <div className="flex items-center gap-1.5 md:gap-2 bg-gray-800 px-2 md:px-3 py-1 rounded-full border border-gray-700 cursor-pointer hover:border-yellow-500/50 transition-colors" onClick={() => navigate('/shop')}>
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Coins size={12} className="text-yellow-500 md:w-3.5 md:h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="hidden md:inline text-[10px] text-gray-400 leading-none">GOLD</span>
            <span className="text-xs md:text-sm font-bold text-gray-100 font-mono">{player.gold.toLocaleString()}</span>
          </div>
        </div>

        {/* GEMS */}
        <div className="flex items-center gap-1.5 md:gap-2 bg-gray-800 px-2 md:px-3 py-1 rounded-full border border-gray-700 cursor-pointer hover:border-purple-500/50 transition-colors" onClick={() => setAdModalOpen(true)}>
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Gem size={12} className="text-purple-500 md:w-3.5 md:h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="hidden md:inline text-[10px] text-gray-400 leading-none">GEMS</span>
            <span className="text-xs md:text-sm font-bold text-gray-100 font-mono">{player.gems.toLocaleString()}</span>
          </div>
        </div>

        {/* MUTE TOGGLE */}
        <button 
          onClick={toggleMute}
          className={clsx(
            "w-8 h-8 md:w-10 md:h-10 rounded-full border flex items-center justify-center transition-all duration-300 active:scale-90",
            settings.isMuted 
              ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20" 
              : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
          )}
          title={settings.isMuted ? "ミュート解除" : "ミュート"}
        >
          {settings.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      <AdRewardModal open={adModalOpen} onClose={() => setAdModalOpen(false)} />
      <ApRecoveryModal isOpen={apModalOpen} onClose={() => setApModalOpen(false)} />
    </div>
  );
};
