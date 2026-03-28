import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ChevronLeft, Shield, Sword, Heart, Zap, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { ALL_CHARACTERS } from '../store/characters';
import type { Rarity, SkillType } from '../store/types';

const rarityStyle: Record<Rarity, string> = {
  SSR: 'border-yellow-400 bg-gradient-to-br from-yellow-900/60 via-gray-900 to-black shadow-[0_0_30px_rgba(234,179,8,0.3)]',
  SR:  'border-purple-400 bg-gradient-to-br from-purple-900/60 via-gray-900 to-black shadow-[0_0_20px_rgba(168,85,247,0.25)]',
  R:   'border-gray-500 bg-gradient-to-br from-gray-800 via-gray-900 to-black',
};

const rarityBadge: Record<Rarity, string> = {
  SSR: 'bg-yellow-500 text-black',
  SR:  'bg-purple-500 text-white',
  R:   'bg-gray-500 text-white',
};

const skillTypeLabels: Record<SkillType, { label: string; color: string }> = {
  damage: { label: '攻撃型', color: 'bg-red-500' },
  heal:   { label: '回復型', color: 'bg-green-500' },
  buff:   { label: '支援型', color: 'bg-blue-500' },
  debuff: { label: '弱体型', color: 'bg-purple-500' },
};

export const CharacterDetail = () => {
  const { id } = useParams<{ id: string }>();
  const character = ALL_CHARACTERS.find(c => c.id === Number(id));

  if (!character) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
          <p className="text-xl font-bold mb-4">キャラクターが見つかりませんでした</p>
          <Link to="/gacha/list" className="text-blue-400 hover:underline flex items-center gap-1">
            <ChevronLeft size={18} /> 排出リストへ戻る
          </Link>
        </div>
      </Layout>
    );
  }

  const { skill } = character;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full pb-12">
        <div className="flex items-center gap-3 mb-6">
          <Link 
            to="/gacha/list" 
            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft size={24} />
          </Link>
          <h2 className="text-xl font-bold text-white">キャラクター詳細</h2>
        </div>

        <div className={clsx("rounded-3xl border-2 p-6 md:p-8 flex flex-col md:flex-row gap-8 overflow-hidden relative", rarityStyle[character.rarity])}>
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          
          {/* Character Visual */}
          <div className="w-full md:w-2/5 flex flex-col items-center justify-center bg-black/40 rounded-3xl p-6 md:p-8 border border-white/5 shadow-inner min-h-[260px] md:min-h-[380px]">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-150 group-hover:bg-white/20 transition-all duration-700" />
              <div className="text-8xl md:text-9xl relative drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {character.image ? (
                  <img src={character.image} alt={character.name} className="w-40 h-40 md:w-56 md:h-56 object-contain" />
                ) : (
                  character.emoji
                )}
              </div>
            </div>
            <div className={clsx("mt-4 px-6 py-1.5 rounded-full font-black text-xs md:text-sm shadow-xl tracking-widest", rarityBadge[character.rarity])}>
              {character.rarity}
            </div>
          </div>

          {/* Character Profile & Stats */}
          <div className="flex-1 space-y-4 md:space-y-6">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-gray-400 text-xs md:text-base font-bold tracking-tight uppercase opacity-60 italic">{character.title}</p>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none">{character.name}</h1>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-red-500/10 flex flex-col items-center shadow-lg group hover:border-red-500/30 transition-all">
                <Sword className="text-red-400 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" size={16} />
                <span className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest">ATK</span>
                <span className="text-white text-base md:text-2xl font-black font-mono">{character.atk}</span>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-blue-500/10 flex flex-col items-center shadow-lg group hover:border-blue-500/30 transition-all">
                <Shield className="text-blue-400 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" size={16} />
                <span className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest">DEF</span>
                <span className="text-white text-base md:text-2xl font-black font-mono">{character.def}</span>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-green-500/10 flex flex-col items-center shadow-lg group hover:border-green-500/30 transition-all">
                <Heart className="text-green-400 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" size={16} />
                <span className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest">HP</span>
                <span className="text-white text-base md:text-2xl font-black font-mono">{character.hp}</span>
              </div>
            </div>

            {/* Skill Section */}
            <div className="bg-gray-900/80 rounded-2xl p-5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-yellow-400 font-bold">
                  <Sparkles size={18} />
                  <span>スキル</span>
                </div>
                {skill && (
                  <div className="flex items-center gap-2">
                    <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-black text-white", skillTypeLabels[skill.type].color)}>
                      {skillTypeLabels[skill.type].label}
                    </span>
                    <div className="flex items-center gap-1 text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-500/30">
                      <Zap size={10} className="fill-current" />
                      <span className="text-[10px] font-mono font-bold">COST: {skill.cost}</span>
                    </div>
                  </div>
                )}
              </div>

              {skill ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white">{skill.name}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{skill.description}</p>
                  
                  <div className="flex gap-4 pt-2">
                    {skill.multiplier && (
                      <div className="text-[11px] text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        倍率: <span className="text-white font-bold font-mono">x{skill.multiplier}</span>
                      </div>
                    )}
                    {skill.effectValue && (
                       <div className="text-[11px] text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        効果値: <span className="text-white font-bold font-mono">{skill.effectValue}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">スキル情報はありません</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CharacterDetail;
