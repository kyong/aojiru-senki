import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Play, Gem, Volume2, VolumeX } from 'lucide-react';
import { clsx } from 'clsx';
import { useGame } from '../context/GameContext';

import adVideo1 from '../assets/ad/132fd59fadd43415.mp4';
import adVideo2 from '../assets/ad/e644b9242716b3d2.mp4';
import adVideo3 from '../assets/ad/19700121_2157_69c68e07db088191817f15e66bda3b25.mp4';
import adVideo4 from '../assets/ad/19700121_2157_69c699c33b388191a58e85be582a2d63.mp4';
import adVideo5 from '../assets/ad/19700121_2157_69c69c32317c81918833d414de330808.mp4';

const adVideos = [adVideo1, adVideo2, adVideo3, adVideo4, adVideo5];

type Phase = 'confirm' | 'playing' | 'close-challenge' | 'rewarded';

type AdRank = 'common' | 'uncommon' | 'rare' | 'epic' | 'multi' | 'legend';

interface AdRankConfig {
  name: string;
  label: string;
  reward: number;
  maxDodges: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

const AD_RANKS: Record<AdRank, AdRankConfig> = {
  common: {
    name: 'Common',
    label: '通常',
    reward: 50,
    maxDodges: 5,
    color: 'text-gray-400',
    bgColor: 'bg-gray-700',
    borderColor: 'border-gray-600',
  },
  uncommon: {
    name: 'Uncommon',
    label: '俊敏',
    reward: 100,
    maxDodges: 7,
    color: 'text-green-400',
    bgColor: 'bg-green-600/20',
    borderColor: 'border-green-500/50',
  },
  rare: {
    name: 'Rare',
    label: '幽霊',
    reward: 150,
    maxDodges: 8,
    color: 'text-blue-400',
    bgColor: 'bg-blue-600/20',
    borderColor: 'border-blue-500/50',
  },
  epic: {
    name: 'Epic',
    label: '極小',
    reward: 200,
    maxDodges: 10,
    color: 'text-purple-400',
    bgColor: 'bg-purple-600/20',
    borderColor: 'border-purple-500/50',
  },
  multi: {
    name: 'Illusion',
    label: '幻影',
    reward: 250,
    maxDodges: 1, // Ends immediately once the correct one is clicked
    color: 'text-orange-400',
    bgColor: 'bg-orange-600/20',
    borderColor: 'border-orange-500/50',
  },
  legend: {
    name: 'Legend',
    label: '超次元',
    reward: 300,
    maxDodges: 12,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
  },
};

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
  const [btnPos, setBtnPos] = useState({ x: 90, y: 10 });
  const [dodgeCount, setDodgeCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [rank, setRank] = useState<AdRank>('common');
  const [isGhostVisible, setIsGhostVisible] = useState(true);
  const [fakes, setFakes] = useState<{ id: number; x: number; y: number }[]>([]);
  const [misses, setMisses] = useState<{ id: number; x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setPhase('confirm');
    setVideoSrc('');
    setMuted(false);
    setBtnPos({ x: 90, y: 10 });
    setDodgeCount(0);
    setHasStarted(false);
    setIsGhostVisible(true);
    setFakes([]);
    setMisses([]);
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
    // Determine rank randomly
    const rand = Math.random();
    let selectedRank: AdRank = 'common';
    if (rand < 0.05) selectedRank = 'legend';
    else if (rand < 0.15) selectedRank = 'multi';
    else if (rand < 0.25) selectedRank = 'epic';
    else if (rand < 0.45) selectedRank = 'rare';
    else if (rand < 0.75) selectedRank = 'uncommon';
    
    setRank(selectedRank);
    setDodgeCount(0);
    setHasStarted(false);
    setBtnPos({ x: 90, y: 10 });
    setPhase('close-challenge');
    setIsGhostVisible(true);
    setFakes([]);
  }, []);

  const addMissEffect = useCallback((x: number, y: number) => {
    const id = Date.now();
    setMisses(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setMisses(prev => prev.filter(m => m.id !== id));
    }, 1000);
  }, []);

  // Dodge the close button logic
  const dodgeButton = useCallback(() => {
    const config = AD_RANKS[rank];
    if (dodgeCount >= config.maxDodges) return;

    if (!hasStarted) setHasStarted(true);

    if (rank === 'rare') {
      setIsGhostVisible(false);
      setTimeout(() => {
        setBtnPos({
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
        });
        setIsGhostVisible(true);
      }, 200);
    } else if (rank === 'multi' && dodgeCount === 0) {
      // Split into fakes
      const newFakes = Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
      }));
      setFakes(newFakes);
      setBtnPos({
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
      });
    } else if (rank !== 'multi') {
      // Other ranks move normally. Multi doesn't move after the first split.
      setBtnPos({
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
      });
    }

    setDodgeCount(prev => prev + 1);
  }, [rank, dodgeCount, hasStarted]);

  const handleFakeClick = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFakes(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (phase !== 'close-challenge') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    addMissEffect(x, y);
  }, [phase, addMissEffect]);

  // Hyper logic: active repulsion & auto-jitter for touch/mouse
  useEffect(() => {
    if (phase !== 'close-challenge' || rank !== 'legend' || dodgeCount >= AD_RANKS.legend.maxDodges) return;

    const handleRepulsion = (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mx = ((clientX - rect.left) / rect.width) * 100;
      const my = ((clientY - rect.top) / rect.height) * 100;

      const dx = btnPos.x - mx;
      const dy = btnPos.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 18) { // Slightly larger threshold for touch/hover repulsion
        if (!hasStarted) setHasStarted(true);

        const angle = Math.atan2(dy, dx);
        const moveX = Math.cos(angle) * 12;
        const moveY = Math.sin(angle) * 12;

        setBtnPos(prev => ({
          x: Math.max(10, Math.min(90, prev.x + moveX)),
          y: Math.max(10, Math.min(90, prev.y + moveY)),
        }));
      }
    };

    const onMouseMove = (e: MouseEvent) => handleRepulsion(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleRepulsion(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    // Auto-jitter for Legend mode: makes it harder even if not touched
    let jitterTimer: any;
    if (hasStarted) {
      jitterTimer = setInterval(() => {
        setBtnPos({
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
        });
      }, 1000); // Flee every 1.0s automatically
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      if (jitterTimer) clearInterval(jitterTimer);
    };
  }, [phase, rank, btnPos, dodgeCount, hasStarted]);

  const handleCloseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    addGems(AD_RANKS[rank].reward);
    setPhase('rewarded');
  }, [addGems, rank]);

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
          <p className="text-gray-400 text-sm mb-4">
            動画広告を最後まで視聴すると<br />
            <span className="text-purple-400 font-bold">50 GEMS 以上</span> を獲得できます！
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
              <span className="text-xs text-purple-400 font-bold">視聴完了で 50 GEMS 以上獲得</span>
            </div>
          </div>
          <video
            ref={videoRef}
            src={videoSrc}
            muted={muted}
            className="w-full bg-black"
            style={{ maxHeight: '80vh', minHeight: '60vh' }}
            onEnded={handleVideoEnd}
            playsInline
          />
        </div>
      )}

      {/* Close Challenge Phase - dodging X button */}
      {phase === 'close-challenge' && (
        <div
          ref={containerRef}
          onClick={handleContainerClick}
          className="relative bg-gray-900 border border-gray-700 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden cursor-crosshair"
          style={{ height: '350px' }}
        >
          {/* Rank Info - Show after started */}
          <div className={clsx(
            "absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none transition-opacity duration-500",
            hasStarted ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex flex-col">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${AD_RANKS[rank].color}`}>
                Rank: {AD_RANKS[rank].name}
              </span>
              <span className="text-white text-lg font-black italic">
                {AD_RANKS[rank].label}
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 text-[10px] block">REWARD</span>
              <span className="text-yellow-400 font-bold">{AD_RANKS[rank].reward} GEMS</span>
            </div>
          </div>

          <div className={clsx(
            "absolute inset-x-0 bottom-8 flex items-center justify-center pointer-events-none z-0 transition-opacity duration-1000",
            hasStarted ? "opacity-20" : "opacity-0"
          )}>
            <div className="text-center">
              <p className="text-white text-4xl font-black italic">CHALLENGE!</p>
              <p className="text-gray-400 text-xs">✕ボタンの回避を突破せよ</p>
            </div>
          </div>

          {/* Miss Effects */}
          {misses.map(miss => (
            <div
              key={miss.id}
              className="absolute pointer-events-none select-none animate-ping text-red-500 font-black text-xl z-30"
              style={{
                left: `${miss.x}%`,
                top: `${miss.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              MISS!
            </div>
          ))}

          {/* Fake Buttons */}
          {fakes.map(fake => (
            <button
              key={fake.id}
              onClick={(e) => handleFakeClick(e, fake.id)}
              className="absolute w-10 h-10 bg-gray-700 border-gray-600 border-2 rounded-full flex items-center justify-center transition-all shadow-lg z-10 animate-in fade-in zoom-in duration-300"
              style={{
                left: `${fake.x}%`,
                top: `${fake.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <X size={20} className="text-white" />
            </button>
          ))}

          <button
            onClick={handleCloseClick}
            onMouseEnter={dodgeButton}
            onTouchStart={dodgeButton}
            className={clsx(
              "absolute w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg border-2 z-10",
              hasStarted && rank !== 'multi' ? `${AD_RANKS[rank].bgColor} ${AD_RANKS[rank].borderColor}` : "bg-gray-700 border-gray-600"
            )}
            style={{
              left: `${btnPos.x}%`,
              top: `${btnPos.y}%`,
              transform: `translate(-50%, -50%) ${hasStarted && rank === 'epic' ? `scale(${Math.max(0.3, 1 - (dodgeCount * 0.1))})` : 'scale(1)'}`,
              opacity: isGhostVisible ? 1 : 0,
              transition: hasStarted && dodgeCount > 0 && dodgeCount < AD_RANKS[rank].maxDodges && rank !== 'rare' 
                ? 'left 0.1s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.1s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.2s ease, opacity 0.2s ease' 
                : rank === 'rare' ? 'transform 0.2s ease, opacity 0s' : 'transform 0.2s ease, opacity 0.2s ease',
            }}
          >
            <X size={20} className="text-white" />
          </button>

          {/* Progress Mini Bar */}
          <div className={clsx(
            "absolute bottom-0 left-0 right-0 h-1 bg-gray-800 transition-opacity duration-500",
            hasStarted ? "opacity-100" : "opacity-0"
          )}>
            <div 
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${(dodgeCount / AD_RANKS[rank].maxDodges) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Rewarded Phase */}
      {phase === 'rewarded' && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
          <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Gem size={40} className="text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{AD_RANKS[rank].label}突破！</h3>
          <p className="text-purple-400 text-3xl font-bold mb-6">+{AD_RANKS[rank].reward} GEMS</p>
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
