import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Heart, Droplet, Zap, Shield, Sword } from 'lucide-react';
import { clsx } from 'clsx';

// Mock Data
const ENEMY = {
  name: "カリカリベーコン将軍",
  hp: 2500,
  maxHp: 2500,
  image: "🍔" // Placeholder emoji
};

const PLAYER = {
  name: "青汁マイスター",
  hp: 450,
  maxHp: 500,
  mp: 80, // Aojiru Gauge
  maxMp: 100
};

export const Battle = () => {
  const [battleLog, setBattleLog] = useState<string[]>([
    "カリカリベーコン将軍が現れた！",
    "青汁マイスターのターン！"
  ]);

  const addLog = (message: string) => {
    setBattleLog(prev => [...prev.slice(-4), message]);
  };

  const handleAttack = () => {
    addLog(`青汁マイスターの攻撃！ ${ENEMY.name}に120のダメージ！`);
    // Logic would go here
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">

        {/* Battle Area (Enemy) */}
        <div className="flex-1 bg-gray-900 rounded-xl relative overflow-hidden border border-gray-700 flex items-center justify-center bg-[url('https://placehold.co/1200x800/222/333?text=Background')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/40" />

          {/* Enemy Sprite & Status */}
          <div className="z-10 flex flex-col items-center animate-[float_3s_ease-in-out_infinite]">
            <div className="text-9xl filter drop-shadow-[0_0_20px_rgba(255,0,0,0.5)] transform hover:scale-110 transition-transform cursor-pointer">
              {ENEMY.image}
            </div>
            <div className="mt-4 bg-gray-900/80 p-3 rounded-lg border border-red-900/50 backdrop-blur-sm w-64">
              <h3 className="text-red-400 font-bold text-center mb-1">{ENEMY.name}</h3>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* HUD Area (Player Status & Commands) */}
        <div className="h-48 grid grid-cols-12 gap-4">

          {/* Player Status */}
          <div className="col-span-3 bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg flex flex-col gap-2">
            <h3 className="font-bold text-lg text-white border-b border-gray-700 pb-2">{PLAYER.name}</h3>

            <div className="flex items-center gap-2">
              <Heart className="text-red-500" size={20} />
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                  <span>HP</span>
                  <span>{PLAYER.hp} / {PLAYER.maxHp}</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${(PLAYER.hp / PLAYER.maxHp) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Droplet className="text-green-500" size={20} />
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                  <span>AOJIRU</span>
                  <span>{PLAYER.mp}%</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 transition-all duration-300" style={{ width: `${(PLAYER.mp / PLAYER.maxMp) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Command Menu */}
          <div className="col-span-6 grid grid-cols-2 gap-2">
            <button
              onClick={handleAttack}
              className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-red-900/50 hover:to-red-800/50 border border-gray-600 hover:border-red-500 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 group"
            >
              <Sword size={24} className="text-gray-400 group-hover:text-red-400" />
              <span className="font-bold text-lg text-gray-200 group-hover:text-white">攻撃 (Attack)</span>
            </button>

            <button className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-green-900/50 hover:to-green-800/50 border border-gray-600 hover:border-green-500 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 group">
              <Zap size={24} className="text-gray-400 group-hover:text-green-400" />
              <span className="font-bold text-lg text-gray-200 group-hover:text-white">青汁スキル (Skill)</span>
            </button>

            <button className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-blue-900/50 hover:to-blue-800/50 border border-gray-600 hover:border-blue-500 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 group">
              <Shield size={24} className="text-gray-400 group-hover:text-blue-400" />
              <span className="font-bold text-lg text-gray-200 group-hover:text-white">防御 (Guard)</span>
            </button>

            <button className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-yellow-900/50 hover:to-yellow-800/50 border border-gray-600 hover:border-yellow-500 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 group">
              <Droplet size={24} className="text-gray-400 group-hover:text-yellow-400" />
              <span className="font-bold text-lg text-gray-200 group-hover:text-white">アイテム (Item)</span>
            </button>
          </div>

          {/* Log Window */}
          <div className="col-span-3 bg-black/60 rounded-xl p-3 border border-gray-700 overflow-hidden font-mono text-sm shadow-inner">
            <div className="flex flex-col justify-end h-full">
              {battleLog.map((log, i) => (
                <p key={i} className={clsx("mb-1 animate-[fadeIn_0.2s_ease-out]", i === battleLog.length - 1 ? "text-white font-bold" : "text-gray-500")}>
                  {i === battleLog.length - 1 ? "> " : ""}{log}
                </p>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Battle;
