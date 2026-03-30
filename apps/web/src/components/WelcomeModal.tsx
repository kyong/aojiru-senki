import React, { useState } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../utils/sound';
import { LegalModal, type LegalType } from './LegalModal';

export const WelcomeModal: React.FC = () => {
  const { settings, updateSettings } = useGame();
  const [legal, setLegal] = useState<{ open: boolean; type: LegalType }>({ open: false, type: 'terms' });

  React.useEffect(() => {
    if (settings.isFirstLaunch) {
      soundManager.pauseBGM();
    }
  }, [settings.isFirstLaunch]);

  if (!settings.isFirstLaunch) return null;

  const handleStart = () => {
    updateSettings({ isFirstLaunch: false });
    soundManager.resumeBGM();
  };

  const toggleMute = () => {
    updateSettings({ isMuted: !settings.isMuted });
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 backdrop-blur-xl">
      <div className="bg-gray-900 border border-green-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(34,197,94,0.2)] text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
          <Volume2 className="text-green-400 w-10 h-10" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">
          サウンドに関するお知らせ
        </h2>
        
        <p className="text-gray-400 leading-relaxed mb-8">
          本ゲームはBGMと効果音が流れます。<br/>
          公共の場所などでプレイされる際は、音量にご注意ください。
        </p>

        <div className="bg-gray-850 rounded-2xl p-4 mb-8 border border-gray-800 flex items-center justify-between cursor-pointer group" onClick={toggleMute}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${settings.isMuted ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}>
              <VolumeX size={20} />
            </div>
            <span className="text-sm font-bold text-gray-300">ミュートで始める</span>
          </div>
          <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${settings.isMuted ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
            {settings.isMuted && <div className="w-2 h-2 bg-white rounded-sm" />}
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
        >
          <Play size={20} fill="currentColor" />
          ゲームを開始する
        </button>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-[10px] text-gray-500 mb-2">
            開始することで、開発者の提示する規約に同意したものとみなします。
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] font-bold">
            <button 
              onClick={() => setLegal({ open: true, type: 'terms' })}
              className="text-gray-400 hover:text-green-400 transition-colors underline decoration-gray-700 underline-offset-4"
            >
              利用規約
            </button>
            <button 
              onClick={() => setLegal({ open: true, type: 'privacy' })}
              className="text-gray-400 hover:text-green-400 transition-colors underline decoration-gray-700 underline-offset-4"
            >
              プライバシーポリシー
            </button>
          </div>
        </div>
      </div>

      <LegalModal 
        open={legal.open} 
        type={legal.type} 
        onClose={() => setLegal({ ...legal, open: false })} 
      />
    </div>
  );
};
