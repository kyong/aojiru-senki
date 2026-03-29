import React, { type PropsWithChildren } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useNavigationGuard } from '../../context/NavigationGuardContext';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const { pendingPath, confirmNavigation, cancelNavigation } = useNavigationGuard();

  return (
    <div className="min-h-screen text-gray-100 font-sans relative overflow-x-hidden">
      {/* Global Background Layer */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#0a0a0a]">
        <img 
          src="/images/global_bg.png" 
          alt="App Background" 
          className="w-full h-full object-cover scale-105 opacity-40 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/60 via-transparent to-[#0a0a0a]/60" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <Header />
      <Sidebar />
      {/* pl-0 + pb-20 for mobile bottom nav, pl-24 + pb-0 for desktop sidebar */}
      <main className="relative z-10 pl-0 pb-20 pt-14 md:pl-24 md:pb-0 md:pt-16 min-h-screen">
        <div className="p-4 md:p-6 max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-out]">
          {children}
        </div>
      </main>

      {/* Navigation Guard Modal */}
      {pendingPath && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-center text-white mb-2">撤退確認</h3>
            <p className="text-center text-gray-300 text-sm mb-6 leading-relaxed">
              戦闘中です。本当に撤退しますか？<br/>
              <span className="text-red-400 font-bold">※ 戦闘の進行は失われます</span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={cancelNavigation}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
              >
                戦闘に戻る
              </button>
              <button
                onClick={confirmNavigation}
                className="flex-1 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
              >
                撤退する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
