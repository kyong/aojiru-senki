import React, { type PropsWithChildren } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-100 font-sans">
      <Header />
      <Sidebar />
      {/* pl-0 + pb-20 for mobile bottom nav, pl-24 + pb-0 for desktop sidebar */}
      <main className="pl-0 pb-20 pt-14 md:pl-24 md:pb-0 md:pt-16 min-h-screen">
        <div className="p-4 md:p-6 max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-out]">
          {children}
        </div>
      </main>
    </div>
  );
};
