import React from 'react';
import { Coins, Gem } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 fixed w-full top-0 z-50">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
          青汁戦記
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Coins size={16} className="text-yellow-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 leading-none">GOLD</span>
            <span className="text-sm font-bold text-gray-100">1,250,000</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Gem size={16} className="text-purple-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 leading-none">GEMS</span>
            <span className="text-sm font-bold text-gray-100">5,000</span>
          </div>
        </div>
      </div>
    </div>
  );
};
