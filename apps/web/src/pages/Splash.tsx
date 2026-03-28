import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import SplashScene from './SplashScene';
import { LiquidProgressBar } from '../components/LiquidProgressBar';

interface SplashProps {
  onComplete: () => void;
}

export const Splash = ({ onComplete }: SplashProps) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // プログレスバーのアニメーション（2.5秒で100%に）
    const duration = 2500;
    const intervalTime = 30; // 30msごとに更新
    const step = 100 / (duration / intervalTime);
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          // 100%になってから少し待機して遷移
          setTimeout(() => {
            onComplete();
          }, 800);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    if (!gameRef.current) return;

    // Phaser Game Config
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: '100%',
      height: '100%',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [SplashScene],
      backgroundColor: '#000000',
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen bg-black overflow-hidden">
      {/* Phaser Canvas */}
      <div 
        ref={gameRef} 
        className="w-full h-full absolute inset-0 z-0" 
      />
      
      {/* React UI Layer */}
      <div className="absolute inset-x-0 bottom-16 md:bottom-24 z-50 flex justify-center pointer-events-none">
        <div className="w-[85%] max-w-[500px] pointer-events-auto">
          <LiquidProgressBar value={progress} />
        </div>
      </div>
    </div>
  );
};

export default Splash;
