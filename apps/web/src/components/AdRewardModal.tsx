import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Play, Gem, Volume2, VolumeX } from 'lucide-react';
import { useGame } from '../context/GameContext';

import adVideo1 from '../assets/ad/132fd59fadd43415.mp4';
import adVideo2 from '../assets/ad/e644b9242716b3d2.mp4';
import adVideo3 from '../assets/ad/19700121_2157_69c68e07db088191817f15e66bda3b25.mp4';

const adVideos = [adVideo1, adVideo2, adVideo3];

type Phase = 'confirm' | 'playing' | 'close-challenge' | 'rewarded';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AdRewardModal: React.FC<Props> = ({ open, onClose }) => {
  const { addGems } = useGame();
  const [phase, setPhase] = useState<Phase>('confirm');
  const [videoSrc, setVideoSrc] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const [muted, setMuted] = useState(false);

  // Close button dodge state
  const [btnPos, setBtnPos] = useState({ x: 50, y: 50 });
  const [dodgeCount, setDodgeCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxDodges = 5;

  const reset = useCallback(() => {
    setPhase('confirm');
    setVideoSrc('');
    setMuted(false);
    setBtnPos({ x: 50, y: 50 });
    setDodgeCount(0);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handlePlay = useCallback(() => {
    const src = adVideos[Math.floor(Math.random() * adVideos.length)];
    setVideoSrc(src);
    setPhase('playing');
  }, []);

  const handleVideoEnd = useCallback(() => {
    setDodgeCount(0);
    setBtnPos({ x: 50, y: 50 });
    setPhase('close-challenge');
  }, []);

  // Dodge the close button on hover
  const dodgeButton = useCallback(() => {
    setDodgeCount(prev => {
      const next = prev + 1;
      if (next >= maxDodges) return prev;
      // Random position within safe bounds (10%-90%)
      setBtnPos({
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
      });
      return next;
    });
  }, []);

  const handleCloseClick = useCallback(() => {
    addGems(50);
    setPhase('rewarded');
  }, [addGems]);

  // Auto-play video when phase changes
  useEffect(() => {
    if (phase === 'playing' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [phase, videoSrc]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Confirm Phase */}
      {phase === 'confirm' && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Gem size={32} className="text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">広告を視聴してジェムを獲得</h3>
          <p className="text-gray-400 text-sm mb-2">
            動画広告を最後まで視聴すると<br />
            <span className="text-purple-400 font-bold">50 GEMS</span> を獲得できます！
          </p>
          <p className="text-yellow-400/80 text-xs mb-6 flex items-center justify-center gap-1">
            <Volume2 size={14} />
            音声が再生されます
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold rounded-xl transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handlePlay}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Play size={18} />
              再生する
            </button>
          </div>
        </div>
      )}

      {/* Playing Phase */}
      {phase === 'playing' && (
        <div className="bg-black rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl border border-gray-700">
          <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">広告再生中...</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMuted(m => !m)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <span className="text-xs text-purple-400 font-bold">最後まで視聴で 50 GEMS</span>
            </div>
          </div>
          <video
            ref={videoRef}
            src={videoSrc}
            muted={muted}
            className="w-full aspect-video bg-black"
            onEnded={handleVideoEnd}
            playsInline
          />
        </div>
      )}

      {/* Close Challenge Phase - dodging X button */}
      {phase === 'close-challenge' && (
        <div
          ref={containerRef}
          className="relative bg-gray-900 border border-gray-700 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden"
          style={{ height: '300px' }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-gray-400 text-sm">広告視聴完了！</p>
              <p className="text-gray-500 text-xs mt-1">✕ボタンを押して閉じてください</p>
            </div>
          </div>
          <button
            onClick={handleCloseClick}
            onMouseEnter={dodgeCount < maxDodges ? dodgeButton : undefined}
            onTouchStart={dodgeCount < maxDodges ? dodgeButton : undefined}
            className="absolute w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg border border-gray-600 z-10"
            style={{
              left: `${btnPos.x}%`,
              top: `${btnPos.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: dodgeCount > 0 && dodgeCount < maxDodges ? 'left 0.15s ease-out, top 0.15s ease-out' : 'none',
            }}
          >
            <X size={18} className="text-gray-300" />
          </button>
        </div>
      )}

      {/* Rewarded Phase */}
      {phase === 'rewarded' && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
          <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Gem size={40} className="text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">獲得！</h3>
          <p className="text-purple-400 text-3xl font-bold mb-6">+50 GEMS</p>
          <button
            onClick={handleClose}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
};
