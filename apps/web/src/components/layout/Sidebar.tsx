import React from 'react';
import { Home, Swords, Store, Mail, Settings, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      twMerge(
        "flex flex-col items-center justify-center gap-0.5 md:gap-1 p-2 md:p-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
        isActive
          ? "bg-green-600/20 text-green-400 md:border md:border-green-500/30 md:shadow-[0_0_15px_rgba(34,197,94,0.2)]"
          : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
      )
    }
  >
    <Icon size={20} className="md:mb-0.5 md:w-6 md:h-6" />
    <span className="text-[9px] md:text-[10px] font-medium tracking-wide leading-tight">{label}</span>
    {/* Shine effect on hover */}
    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
  </NavLink>
);

export const Sidebar: React.FC = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-24 bg-gray-900 border-r border-gray-800 fixed left-0 top-16 h-[calc(100vh-64px)] flex-col items-center py-6 gap-2 z-40">
        <NavItem to="/" icon={Home} label="マイページ" />
        <div className="w-16 h-px bg-gray-800 my-2" />
        <NavItem to="/quest" icon={Swords} label="出撃" />
        <NavItem to="/gacha" icon={Store} label="ガチャ" />
        <NavItem to="/party" icon={User} label="編成" />
        <div className="w-16 h-px bg-gray-800 my-2" />
        <NavItem to="/present" icon={Mail} label="プレゼント" />
        <div className="mt-auto">
          <NavItem to="/menu" icon={Settings} label="メニュー" />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 flex items-center justify-around px-1 z-50 safe-area-bottom">
        <NavItem to="/" icon={Home} label="ホーム" />
        <NavItem to="/quest" icon={Swords} label="出撃" />
        <NavItem to="/gacha" icon={Store} label="ガチャ" />
        <NavItem to="/party" icon={User} label="編成" />
        <NavItem to="/present" icon={Mail} label="BOX" />
        <NavItem to="/menu" icon={Settings} label="設定" />
      </div>
    </>
  );
};
