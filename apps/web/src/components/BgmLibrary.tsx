import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Download, Music, X } from 'lucide-react';
import { soundManager, BGM_METADATA } from '../utils/sound';
import type { BgmMetadata } from '../utils/sound';

interface BgmLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

const BgmLibrary: React.FC<BgmLibraryProps> = ({ isOpen, onClose }) => {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync with soundManager state
  useEffect(() => {
    const checkPlaying = () => {
      const currentBgmFile = soundManager.getCurrentBGM();
      if (currentBgmFile) {
        const metadata = BGM_METADATA.find(m => m.filename === currentBgmFile);
        if (metadata) {
          setCurrentPlayingId(metadata.id);
          setIsPlaying(true);
        } else {
          setCurrentPlayingId(null);
          setIsPlaying(false);
        }
      } else {
        setCurrentPlayingId(null);
        setIsPlaying(false);
      }
    };

    const interval = setInterval(checkPlaying, 500);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const handlePlay = (track: BgmMetadata) => {
    if (currentPlayingId === track.id && isPlaying) {
      soundManager.pauseBGM();
      setIsPlaying(false);
    } else {
      soundManager.playBGM(track.filename);
      soundManager.resume();
      setCurrentPlayingId(track.id);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    soundManager.stopBGM();
    setCurrentPlayingId(null);
    setIsPlaying(false);
  };

  const handleDownload = (track: BgmMetadata) => {
    const link = document.createElement('a');
    link.href = `/assets/sounds/bgm/${track.filename}`;
    link.download = track.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
      <div 
        className="relative w-full max-w-2xl bg-gray-900/90 border border-green-500/30 rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-green-900/20 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Music className="text-green-400 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Memorial Soundtrack</h2>
              <p className="text-xs text-green-500/70 font-bold uppercase tracking-widest">Aojiru Senki Original BGM</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {BGM_METADATA.map((track) => (
            <div 
              key={track.id}
              className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                currentPlayingId === track.id 
                  ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                  : 'bg-gray-800/40 border-gray-700 hover:border-gray-500'
              }`}
            >
              <button 
                onClick={() => handlePlay(track)}
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentPlayingId === track.id && isPlaying
                    ? 'bg-green-500 text-black scale-110 shadow-[0_0_20px_rgba(34,197,94,0.5)]'
                    : 'bg-gray-700 text-white group-hover:bg-green-600 group-hover:text-black'
                }`}
              >
                {currentPlayingId === track.id && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
              </button>

              <div className="flex-1 min-w-0">
                <h3 className={`font-bold truncate ${currentPlayingId === track.id ? 'text-green-400' : 'text-gray-200'}`}>
                  {track.title}
                </h3>
                <p className="text-xs text-gray-500 truncate group-hover:text-gray-400 transition-colors">
                  {track.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {currentPlayingId === track.id && isPlaying && (
                  <button 
                    onClick={handleStop}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors hover:bg-red-400/10 rounded-lg"
                    title="Stop"
                  >
                    <Square size={18} fill="currentColor" />
                  </button>
                )}
                <button 
                  onClick={() => handleDownload(track)}
                  className="p-2 text-gray-400 hover:text-blue-400 transition-colors hover:bg-blue-400/10 rounded-lg"
                  title="Download MP3"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/40 border-t border-gray-800 text-center">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            © 2026 AOJIRU SENKI MEMORIAL PROJECT - ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  );
};

export default BgmLibrary;
