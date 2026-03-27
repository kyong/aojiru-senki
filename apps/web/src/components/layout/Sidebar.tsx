import React from 'react';
import { Home, Swords, Store, Mail, Settings, User, ShoppingBag } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { useNavigationGuard } from '../../context/NavigationGuardContext';

const NavItem = ({ to, icon: Icon, label, onGuardedClick }: { to: string; icon: any; label: string; onGuardedClick: (path: string) => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <button
      onClick={() => onGuardedClick(to)}
      className={twMerge(
        "flex flex-col items-center justify-center gap-0.5 md:gap-1 p-2 md:p-3 rounded-lg transition-all duration-200 group relative overflow-hidden w-full",
        isActive
          ? "bg-green-600/20 text-green-400 md:border md:border-green-500/30 md:shadow-[0_0_15px_rgba(34,197,94,0.2)]"
          : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
      )}
    >
      <Icon size={20} className="md:mb-0.5 md:w-6 md:h-6" />
      <span className="text-[9px] md:text-[10px] font-medium tracking-wide leading-tight">{label}</span>
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
    </button>
  );
};

export const Sidebar: React.FC = () => {
  const { guardedNavigate } = useNavigationGuard();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-24 bg-gray-900 border-r border-gray-800 fixed left-0 top-16 h-[calc(100vh-64px)] flex-col items-center py-6 gap-2 z-40">
        <NavItem to="/" icon={Home} label="マイページ" onGuardedClick={guardedNavigate} />
        <div className="w-16 h-px bg-gray-800 my-2" />
        <NavItem to="/quest" icon={Swords} label="出撃" onGuardedClick={guardedNavigate} />
        <NavItem to="/gacha" icon={Store} label="ガチャ" onGuardedClick={guardedNavigate} />
        <NavItem to="/party" icon={User} label="編成" onGuardedClick={guardedNavigate} />
        <NavItem to="/shop" icon={ShoppingBag} label="ショップ" onGuardedClick={guardedNavigate} />
        <div className="w-16 h-px bg-gray-800 my-2" />
        <NavItem to="/present" icon={Mail} label="プレゼント" onGuardedClick={guardedNavigate} />
        <div className="mt-auto">
          <NavItem to="/menu" icon={Settings} label="メニュー" onGuardedClick={guardedNavigate} />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 flex items-center justify-around px-1 z-50 safe-area-bottom">
        <NavItem to="/" icon={Home} label="ホーム" onGuardedClick={guardedNavigate} />
        <NavItem to="/quest" icon={Swords} label="出撃" onGuardedClick={guardedNavigate} />
        <NavItem to="/gacha" icon={Store} label="ガチャ" onGuardedClick={guardedNavigate} />
        <NavItem to="/party" icon={User} label="編成" onGuardedClick={guardedNavigate} />
        <NavItem to="/shop" icon={ShoppingBag} label="商店" onGuardedClick={guardedNavigate} />
        <NavItem to="/present" icon={Mail} label="BOX" onGuardedClick={guardedNavigate} />
        <NavItem to="/menu" icon={Settings} label="設定" onGuardedClick={guardedNavigate} />
      </div>
    </>
  );
};
