import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Settings, User, Volume2, Music, MessageSquare, HelpCircle, LogOut, ChevronRight, Shield } from 'lucide-react';

const PLAYER = {
  name: '青汁マイスター',
  uid: 'UID: 123456789',
  rank: 'S',
  level: 50,
  joinDate: '2026/04/01',
};

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
      onChange={e => onChange(Number(e.target.value))}
      className="flex-1 accent-green-500"
    />
    <span className="w-8 text-right font-mono text-sm text-gray-400">{value}</span>
  </div>
);

type MenuLinkProps = { icon: React.ReactNode; label: string; desc?: string; danger?: boolean; onClick?: () => void };

const MenuLink = ({ icon, label, desc, danger, onClick }: MenuLinkProps) => (
  <button
    onClick={onClick}
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
  const [bgmVolume, setBgmVolume] = useState(70);
  const [seVolume, setSeVolume]   = useState(80);

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
              <h3 className="text-xl font-bold text-white">{PLAYER.name}</h3>
              <span className="bg-yellow-500 text-black text-xs font-black px-2 py-0.5 rounded">Rank {PLAYER.rank}</span>
            </div>
            <p className="text-gray-400 text-sm">{PLAYER.uid}</p>
            <div className="flex gap-4 mt-1 text-xs text-gray-500">
              <span>Lv. {PLAYER.level}</span>
              <span>開始日: {PLAYER.joinDate}</span>
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
            <Slider label="BGM音量" icon={<Music size={16} />} value={bgmVolume} onChange={setBgmVolume} />
            <Slider label="SE音量"  icon={<Volume2 size={16} />} value={seVolume} onChange={setSeVolume} />
          </div>
        </div>

        {/* Other Menu Items */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase px-1">その他</h3>
          <MenuLink icon={<MessageSquare size={20} />} label="お問い合わせ" desc="不具合・ご意見はこちら" />
          <MenuLink icon={<HelpCircle size={20} />}   label="ヘルプ・FAQ" desc="よくあるご質問" />
          <MenuLink icon={<Shield size={20} />}         label="プライバシーポリシー" desc="個人情報の取り扱いについて" />
          <MenuLink
            icon={<LogOut size={20} />}
            label="ログアウト"
            desc="アカウントからサインアウト"
            danger
          />
        </div>

        {/* App Info */}
        <p className="text-center text-xs text-gray-600 pb-4">
          青汁戦記 ver 1.0.0 &copy; 2026 Aojiru Studio
        </p>
      </div>
    </Layout>
  );
};

export default Menu;
