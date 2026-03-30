import { Layout } from '../components/layout/Layout';
import { Settings, User, Volume2, Music, MessageSquare, HelpCircle, ChevronRight, Shield } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { useGame } from '../context/GameContext';

import { useNavigate } from 'react-router-dom';

type SliderProps = { label: string; icon: React.ReactNode; value: number; onChange: (v: number) => void };

const Slider = ({ label, icon, value, onChange }: SliderProps) => (
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-2 w-28 text-gray-300 text-sm">
      {icon}
      <span>{label}</span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={e => {
        const v = Number(e.target.value);
        if (Math.abs(v - value) > 10) soundManager.playPikori(); // 大きく動かした時だけ鳴らす
        onChange(v);
      }}
      className="flex-1 accent-green-500"
    />
    <span className="w-8 text-right font-mono text-sm text-gray-400">{value}</span>
  </div>
);

type MenuLinkProps = { icon: React.ReactNode; label: string; desc?: string; danger?: boolean; onClick?: () => void };

const MenuLink = ({ icon, label, desc, danger, onClick }: MenuLinkProps) => (
  <button
    onClick={() => { soundManager.playPikori(); onClick?.(); }}
    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left group ${
      danger
        ? 'border-red-900/50 bg-red-900/10 hover:bg-red-900/20 hover:border-red-700'
        : 'border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-gray-500'
    }`}
  >
    <span className={danger ? 'text-red-400' : 'text-gray-400 group-hover:text-white'}>{icon}</span>
    <div className="flex-1">
      <p className={`font-bold ${danger ? 'text-red-400' : 'text-white'}`}>{label}</p>
      {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
    </div>
    <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
  </button>
);

export const Menu = () => {
  const { player, settings, updateSettings } = useGame();
  const navigate = useNavigate();

  const handleBgmChange = (v: number) => {
    updateSettings({ bgmVolume: v });
    soundManager.setVolume(settings.seVolume, v);
  };

  const handleSeChange = (v: number) => {
    updateSettings({ seVolume: v });
    soundManager.setVolume(v, settings.bgmVolume);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-gray-700 pb-4">
          <Settings className="text-gray-400" />
          <h2 className="text-2xl font-bold text-white">メニュー</h2>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-green-900/30 to-gray-800 rounded-2xl p-6 border border-green-700/40 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-green-700/30 border-2 border-green-500/50 flex items-center justify-center text-3xl">
            ⚔️
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">青汁マイスター</h3>
              <span className="bg-yellow-500 text-black text-xs font-black px-2 py-0.5 rounded">Rank S</span>
            </div>
            <p className="text-gray-400 text-sm">{player.uid}</p>
            <div className="flex gap-4 mt-1 text-xs text-gray-500">
              <span>Lv. {player.level}</span>
              <span>開始日: {player.joinDate}</span>
            </div>
          </div>
          <User size={24} className="text-gray-600" />
        </div>

        {/* Sound Settings */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-base font-bold text-gray-200 mb-5 flex items-center gap-2">
            <Volume2 size={18} className="text-green-400" /> サウンド設定
          </h3>
          <div className="flex flex-col gap-4">
            <Slider label="BGM音量" icon={<Music size={16} />} value={settings.bgmVolume} onChange={handleBgmChange} />
            <Slider label="SE音量"  icon={<Volume2 size={16} />} value={settings.seVolume} onChange={handleSeChange} />
          </div>
        </div>

        {/* Other Menu Items */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase px-1">その他</h3>
          <MenuLink 
            icon={<MessageSquare size={20} />} 
            label="お問い合わせ" 
            desc="不具合・ご意見はこちら（外部サイト）" 
            onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScopIUuQWi_w5xh5--T34y8QtLVQzL9BpHnD5AMF1HI1Fw6eQ/viewform?usp=publish-editor', '_blank')}
          />
          <MenuLink 
            icon={<HelpCircle size={20} />}   
            label="ヘルプ・FAQ" 
            desc="アプリの使い方・よくある質問" 
            onClick={() => alert("【よくある質問】\n\nQ: このアプリは何のためにありますか？\nA: 青汁を飲んで元気になる気分を味わうためのジョークアプリです。健康効果を保証するものではありません。\n\nQ: 課金はありますか？\nA: 現時点ではすべて無料で遊べますが、広告が表示されることがあります。")}
          />
          <MenuLink 
            icon={<Shield size={20} />}         
            label="利用規約" 
            desc="免責事項・ルールについて" 
            onClick={() => navigate('/terms')}
          />
          <MenuLink 
            icon={<Shield size={20} />}         
            label="プライバシーポリシー" 
            desc="データの取り扱いについて" 
            onClick={() => navigate('/privacy')}
          />
        </div>

        {/* App Info */}
        <div className="text-center pb-8 space-y-1">
          <p className="text-[10px] text-red-500/70 font-bold">
            ※セーブデータはブラウザにのみ保存されます。キャッシュ削除等でデータが消えた場合、復旧はできません。
          </p>
          <p className="text-[10px] text-gray-600">
            青汁戦記 ver 1.0.0 &copy; 2026 Aojiru Studio
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Menu;
