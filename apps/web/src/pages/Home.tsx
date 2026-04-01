import { Layout } from '../components/layout/Layout';
import { useGame } from '../context/GameContext';

const Home = () => {
  const { player } = useGame();

  const expPct = Math.floor((player.exp / player.nextExp) * 100);

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Character Display Area */}
        <div className="bg-gray-900 rounded-2xl border border-gray-700 h-[350px] md:h-[650px] flex items-center justify-center relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Background Decoration with Parallax/Zoom effect */}
          <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000">
            <img 
              src="/images/player_bg.png" 
              alt="Background" 
              className="w-full h-full object-cover scale-125 group-hover:scale-100 transition-transform duration-[5s] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
          </div>

          {/* Magical Particles / Glimmer (CSS-only hint) */}
          <div className="absolute inset-0 z-0 pointer-events-none">
             <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-20" />
             <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-green-400 rounded-full animate-pulse opacity-30" />
             <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-bounce opacity-10" />
          </div>

          {/* Main Character Image */}
          <img
            src="/images/player.png"
            alt="青汁マイスター"
            className="relative z-10 h-full w-full object-contain object-bottom drop-shadow-[0_0_40px_rgba(34,197,94,0.7)] transition-all duration-700 ease-out group-hover:scale-110 group-hover:translate-y-4"
          />

          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent p-6 md:p-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-8 bg-green-500 rounded-full" />
              <p className="text-green-400 text-[10px] font-black tracking-widest uppercase">Protagonist</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-green-400 to-emerald-400 drop-shadow-sm">
              青汁マイスター
            </h2>
            <div className="flex gap-3 mt-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Level</span>
                <span className="text-lg bg-gray-900/90 px-3 py-0.5 rounded-lg text-green-400 border border-green-500/30 font-black">
                  {player.level}
                </span>
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Next Level Experience</span>
                <div className="flex items-center gap-3 bg-gray-900/90 px-3 py-1.5 rounded-lg border border-blue-500/20">
                  <span className="text-xs text-blue-400 font-mono font-bold whitespace-nowrap">
                    {(player.nextExp - player.exp).toLocaleString()} EXP
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                      style={{ width: `${expPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Status & News */}
        <div className="flex flex-col gap-6">
          {/* Stamina & LP */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <h3 className="text-sm font-bold text-gray-400 mb-4 tracking-wider">プレイヤー情報</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-green-400">AP (Action Point)</span>
                  <span className="font-mono">{player.ap} / {player.maxAp}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-300 transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                    style={{ width: `${(player.ap / player.maxAp) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-yellow-400">GOLD</span>
                  <span className="font-mono">{player.gold.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-purple-400">GEMS</span>
                  <span className="font-mono">{player.gems.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* News / Announcements */}
          <div className="bg-gray-800 rounded-xl p-0 border border-gray-700 flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 bg-gray-800/50">
              <h3 className="font-bold text-gray-200">運営からのお知らせ</h3>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              <div className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-600 group">
                <span className="bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded border border-red-500/30 whitespace-nowrap font-bold font-mono">UPDATE</span>
                <div>
                  <p className="text-sm text-white font-bold group-hover:text-red-400 transition-colors">【新ステージ】不摂生の連鎖！4つのクエスト追加</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">「深夜3時の誘惑」「終わらないSNS」など、最強の誘惑たちが牙を剥く。健康を取り戻せ！</p>
                  <p className="text-[10px] text-gray-500 mt-1.5">2026/04/01 16:30</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-600">
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/30 whitespace-nowrap">NEWS</span>
                <div>
                  <p className="text-sm text-gray-200 font-medium">「聖なる苦味のワンデイ・ウォー」イベント開始！</p>
                  <p className="text-xs text-gray-500 mt-1">2026/04/01 00:00</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-600">
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/30 whitespace-nowrap">NEWS</span>
                <div>
                  <p className="text-sm text-gray-200 font-medium">開設記念キャンペーン ゴールド配布中</p>
                  <p className="text-xs text-gray-500 mt-1">2026/04/01 00:00</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-600">
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/30 whitespace-nowrap">NEWS</span>
                <div>
                  <p className="text-sm text-gray-200 font-medium">「青汁戦記」リリース！</p>
                  <p className="text-xs text-gray-500 mt-1">2026/04/01 00:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
