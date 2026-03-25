import { Layout } from '../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { Swords, Play, Star } from 'lucide-react';

const QUESTS = [
  {
    id: 1,
    title: "第1章: 朝食の戦い",
    enemy: "カリカリベーコン将軍",
    difficulty: 1,
    stamina: 10,
    description: "ギトギトの朝を浄化せよ！",
    thumbnail: "/images/enemy.png"
  },
  {
    id: 2,
    title: "第2章: 昼食の死闘",
    enemy: "炭水化物・ザ・グレート",
    difficulty: 3,
    stamina: 20,
    description: "午後の眠気に打ち勝て！",
    thumbnail: "/images/potato_sniper.png"
  },
  {
    id: 3,
    title: "最終章: 晩餐の魔王",
    enemy: "魔王コレステロール・キング",
    difficulty: 5,
    stamina: 50,
    description: "世界に健康を取り戻す時だ！",
    thumbnail: "/images/cola_slime.png"
  }
];

export const QuestSelect = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Swords className="text-red-500" /> 出撃 (Quests)
          </h2>
          <span className="text-gray-400 text-sm">開催期間: 2026/04/01 ~ 2026/04/02</span>
        </div>

        <div className="grid gap-4">
          {QUESTS.map((quest) => (
            <div
              key={quest.id}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center gap-4 hover:bg-gray-750 transition-colors group cursor-pointer relative overflow-hidden"
              onClick={() => navigate('/battle', { state: { questId: quest.id } })}
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-600 group-hover:border-green-500 transition-colors z-10 overflow-hidden">
                <img src={quest.thumbnail} alt={quest.title} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-green-900/50 text-green-400 text-xs px-2 py-0.5 rounded border border-green-700/50">Chapter {quest.id}</span>
                  <div className="flex gap-0.5">
                    {[...Array(quest.difficulty)].map((_, i) => <Star key={i} size={12} className="text-yellow-500 fill-yellow-500" />)}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-100 group-hover:text-green-400 transition-colors">{quest.title}</h3>
                <p className="text-sm text-gray-400">{quest.description}</p>
                <div className="mt-2 text-xs text-orange-400 font-mono">
                  消費AP: {quest.stamina}
                </div>
              </div>

              {/* Play Button */}
              <div className="z-10 bg-green-600 p-3 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform hover:bg-green-500">
                <Play fill="currentColor" />
              </div>

              {/* Hover Effect Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default QuestSelect;
