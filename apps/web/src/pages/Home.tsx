import { Layout } from '../components/layout/Layout';
import { useGame } from '../context/GameContext';

const Home = () => {
  const { player } = useGame();

  const expPct = Math.floor((player.exp / player.nextExp) * 100);

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Character Display Area */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 h-[600px] flex items-center justify-center relative overflow-hidden group">
          {/* Main Character Image */}
          <img
            src="/images/player.png"
            alt="青汁マイスター"
            className="h-full w-full object-contain object-bottom drop-shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
              青汁マイスター
            </h2>
            <div className="flex gap-4 mt-2">
              <span className="text-sm bg-gray-900/80 px-2 py-1 rounded text-green-400 border border-green-500/30">
                Lv. {player.level}
              </span>
              <span className="text-sm bg-gray-900/80 px-2 py-1 rounded text-blue-400 border border-blue-500/30">
                Next: {(player.nextExp - player.exp).toLocaleString()} EXP
              </span>
            </div>
            {/* EXP bar */}
            <div className="mt-3">
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${expPct}%` }}
                />
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-600">
                  <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/30 whitespace-nowrap">NEWS</span>
                  <div>
                    <p className="text-sm text-gray-200 font-medium">「聖なる苦味のワンデイ・ウォー」イベント開始！</p>
                    <p className="text-xs text-gray-500 mt-1">2026/04/01 12:00</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
