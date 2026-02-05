import React, { PropsWithChildren } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-100 font-sans">
      <Header />
      <Sidebar />
      <main className="pl-24 pt-16 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-out]">
          {children}
        </div>
      </main>
    </div>
  );
};
