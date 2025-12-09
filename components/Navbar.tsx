import React from 'react';
import { World } from '../types';
import { ShopIcon, PalmTreeIcon } from './Icons';

interface NavbarProps {
  currentWorld: World;
  setWorld: (world: World) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentWorld, setWorld }) => {
  return (
    <div className="w-full bg-slate-800 border-t border-slate-700 safe-area-pb z-30">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        <button
          onClick={() => setWorld(World.HARVEST)}
          className={`flex-1 h-full flex flex-col items-center justify-center space-y-1 transition-colors ${
            currentWorld === World.HARVEST
              ? 'bg-yellow-500/10 text-yellow-400 border-t-2 border-yellow-400'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <ShopIcon className={`w-6 h-6 ${currentWorld === World.HARVEST ? 'animate-bounce' : ''}`} />
          <span className="text-xs font-bold uppercase tracking-wider">Harvest</span>
        </button>

        <button
          onClick={() => setWorld(World.JUNGLE)}
          className={`flex-1 h-full flex flex-col items-center justify-center space-y-1 transition-colors ${
            currentWorld === World.JUNGLE
              ? 'bg-green-500/10 text-green-400 border-t-2 border-green-400'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <PalmTreeIcon className={`w-6 h-6 ${currentWorld === World.JUNGLE ? 'animate-bounce' : ''}`} />
          <span className="text-xs font-bold uppercase tracking-wider">Jungle</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;