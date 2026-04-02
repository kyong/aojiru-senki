import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { soundManager } from '../utils/sound';
import './ServiceEnd.css';

interface ServiceEndProps {
  onRestore: () => void;
}

type Phase = 'eol' | 'rollback' | 'trial' | 'shattering';

interface Item {
  id: number;
  type: 'potion' | 'hammer';
  x: number;
  y: number;
  speed: number;
}

interface Popup {
  id: number;
  x: number;
  y: number;
  text: string;
}

const ServiceEnd: React.FC<ServiceEndProps> = ({ onRestore }) => {
  const [phase, setPhase] = useState<Phase>('eol');
  const [clickCount, setClickCount] = useState(0);
  const [displayDate, setDisplayDate] = useState('2026.04.02');
  const [isShaking, setIsShaking] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);
  
  // Trial State
  const [items, setItems] = useState<Item[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const totalRounds = 3;
  const targetScore = 5;

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize particles for EOL background
  const particles = useRef(Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 20}s`,
    duration: `${15 + Math.random() * 10}s`
  })));

  const playSE = useCallback((type: 'tick' | 'catch' | 'error' | 'shatter') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      switch (type) {
        case 'tick':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800 + clickCount * 100, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          break;
        case 'catch':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          break;
        case 'error':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          break;
        case 'shatter':
          // White noise + burst
          const bufferSize = ctx.sampleRate * 1.5;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.5);
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 1000;
          noise.connect(filter);
          filter.connect(gain);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
          noise.start();
          return;
      }
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  }, [clickCount]);

  // Handle BGM on mount and phase transitions
  useEffect(() => {
    if (phase === 'eol') {
      // Ensure any previous BGM (e.g. from Home/Splash) is stopped
      soundManager.stopBGM();
    } else if (phase === 'trial') {
      // Start the mini-game BGM exclusively during the trial
      soundManager.playBGM('click_game.mp3');
      soundManager.resume();
    } else if (phase === 'shattering') {
      // Allow gem_get.mp3 to play if it was just started
      if (soundManager.getCurrentBGM() !== 'gem_get.mp3') {
        soundManager.stopBGM();
      }
    }
  }, [phase]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
    soundManager.resume();
  };

  // Mini-game Loop
  useEffect(() => {
    if (phase !== 'trial') return;

    const gameInterval = setInterval(() => {
      setItems(prev => {
        const newItems = prev
          .map(item => ({ ...item, y: item.y + item.speed }))
          .filter(item => item.y < 110);
        
        if (Math.random() < 0.15) {
          newItems.push({
            id: Date.now(),
            type: Math.random() > 0.3 ? 'potion' : 'hammer',
            x: 10 + Math.random() * 80,
            y: -10,
            speed: 1 + Math.random() * 2
          });
        }
        return newItems;
      });
    }, 50);

    const popupInterval = setInterval(() => {
      if (Math.random() < 0.3 && popups.length < 5) {
        setPopups(prev => [...prev, {
          id: Date.now(),
          x: 20 + Math.random() * 50,
          y: 20 + Math.random() * 50,
          text: ['LOW MEMORY!', 'SYSTEM CRITICAL', 'BUY GEMS!', 'ERR: 404 RESURRECTION'][Math.floor(Math.random() * 4)]
        }]);
      }
    }, 2000);

    return () => {
      clearInterval(gameInterval);
      clearInterval(popupInterval);
    };
  }, [phase, popups.length]);

  const handleDateClick = () => {
    if (phase !== 'eol') return;

    playSE('tick');
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 100);

    if (nextCount >= 7) {
      setIsFlickering(true);
      setDisplayDate('2026.04.01');
      setTimeout(() => {
        setPhase('trial');
        setItems([]);
        setPopups([]);
        setScore(0);
        setRound(1);
      }, 800);
    } else if (nextCount >= 4) {
      setDisplayDate(`2026.04.0${(nextCount % 2 === 0) ? '2' : '1'}`);
      setIsFlickering(true);
      setTimeout(() => setIsFlickering(false), 200);
    }
  };

  const handleItemClick = (id: number, type: 'potion' | 'hammer') => {
    if (type === 'hammer') {
      playSE('error');
      setScore(prev => Math.max(0, prev - 1));
    } else {
      playSE('catch');
      const newScore = score + 1;
      if (newScore >= targetScore) {
        if (round >= totalRounds) {
          setPhase('shattering');
          playSE('shatter');
          soundManager.playBGM('gem_get.mp3');
          localStorage.setItem('aojiru_service_restored', 'true');
          setTimeout(() => onRestore(), 2500);
        } else {
          setRound(prev => prev + 1);
          setScore(0);
          setPopups([]);
        }
      } else {
        setScore(newScore);
      }
    }
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const closePopup = (id: number) => {
    setPopups(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="service-end-container">
      {/* Global Mute Toggle */}
      <button 
        onClick={toggleMute}
        className="service-end-mute-btn"
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      {/* EOL Phase Screen */}
      {phase === 'eol' && (
        <>
          <div className="service-end-bg" />
          <div className="particles">
            {particles.current.map(p => (
              <div 
                key={p.id} 
                className="particle" 
                style={{ 
                  left: p.left, top: p.top, 
                  animationDelay: p.delay, animationDuration: p.duration 
                }} 
              />
            ))}
          </div>
          <div className="service-end-title">SERVICE ENDED</div>
          <div className="service-end-message">
            <p>「青汁戦記」をご利用いただき、誠にありがとうございました。</p>
            <p>本作は2026年4月2日をもちまして、サービスを終了いたしました。</p>
          </div>
          <div
            className={`service-end-date-wrapper ${isShaking ? 'shake' : ''} ${isFlickering ? 'flicker' : ''}`}
            onClick={handleDateClick}
          >
            <div className="service-end-date">{displayDate}</div>
            <div className="rewind-icon">↺</div>
          </div>
          <button
            onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScopIUuQWi_w5xh5--T34y8QtLVQzL9BpHnD5AMF1HI1Fw6eQ/viewform?usp=publish-editor', '_blank')}
            className="service-end-contact"
          >
            <MessageSquare size={16} />
            お問い合わせ
          </button>
        </>
      )}

      {/* Trial Phase (Mini-game) */}
      {phase === 'trial' && (
        <div className="trial-container">
          <div className="trial-banner">HELP RESURRECT THE SERVER! (ROUND {round}/{totalRounds})</div>
          <div className="round-counter">Target: {score}/{targetScore} Aojiru</div>
          
          {items.map(item => (
            <div 
              key={item.id}
              className="trial-item"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              onClick={() => handleItemClick(item.id, item.type)}
            >
              {item.type === 'potion' ? '🧪' : '🔨'}
            </div>
          ))}

          {popups.map(popup => (
            <div 
              key={popup.id} 
              className="annoying-popup"
              style={{ left: `${popup.x}%`, top: `${popup.y}%` }}
            >
              <div className="popup-close" onClick={() => closePopup(popup.id)}>X</div>
              <div className="font-bold text-red-600">{popup.text}</div>
              <button className="mt-2 bg-blue-500 text-white px-2 py-1 text-xs">FIX NOW</button>
            </div>
          ))}
          
          <div className="mt-auto mb-8 text-gray-500 text-xs italic">
            This is a playable ad to support the resurrection process...
          </div>
        </div>
      )}

      {/* Shattering Phase */}
      {phase === 'shattering' && (
        <>
          <div className="shatter-overlay">
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={i} 
                className="shard" 
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%`,
                  width: `${20 + Math.random() * 50}px`,
                  height: `${20 + Math.random() * 50}px`,
                  animationDelay: `${Math.random() * 0.5}s`
                }} 
              />
            ))}
          </div>
          <div className="white-flash" />
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-white text-5xl font-black italic animate-pulse">
              REALITY SHATTERED
            </div>
          </div>
        </>
      )}

      <div className="thank-you-footer">AOJIRU SENKI - MEMORIAL PROJECT</div>
    </div>
  );
};

export default ServiceEnd;
