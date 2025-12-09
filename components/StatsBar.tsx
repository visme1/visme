import React from 'react';
import { BananaIcon } from './Icons';

interface StatsBarProps {
  bananas: number;
  monkeys: number;
  mps: number; // Monkeys per second (income)
}

const StatsBar: React.FC<StatsBarProps> = ({ bananas, monkeys, mps }) => {
  return (
    <div className="w-full bg-slate-800/90 backdrop-blur-md border-b border-slate-700 p-3 flex justify-between items-center shadow-lg z-20">
      <div className="flex items-center space-x-2">
        <div className="bg-yellow-500/20 p-2 rounded-full">
            <BananaIcon className="w-6 h-6 text-yellow-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-heading text-yellow-400 leading-none">
            {Math.floor(bananas).toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {mps.toFixed(1)} / sec
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700">
        <span className="text-2xl">🐵</span>
        <span className="font-bold text-slate-200">{monkeys.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default StatsBar;