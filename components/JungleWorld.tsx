import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MAX_VISUAL_MONKEYS } from '../constants';
import { MonkeyWorker } from '../types';

interface JungleWorldProps {
  monkeyCount: number;
}

const JungleWorld: React.FC<JungleWorldProps> = ({ monkeyCount }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [monkeys, setMonkeys] = useState<MonkeyWorker[]>([]);
  
  // We want to persist the visual monkeys even if component re-renders, 
  // but update their count if monkeyCount changes.
  // We'll use a ref to store the monkey objects to update their positions imperatively 
  // for performance (animation loop), and sync with state for rendering.
  const monkeysRef = useRef<MonkeyWorker[]>([]);

  // Initialize or Update Monkeys based on count
  useEffect(() => {
    const visualCount = Math.min(monkeyCount, MAX_VISUAL_MONKEYS);
    const currentLength = monkeysRef.current.length;

    if (visualCount > currentLength) {
      // Add new monkeys
      const newMonkeys: MonkeyWorker[] = [];
      for (let i = 0; i < visualCount - currentLength; i++) {
        newMonkeys.push({
          id: `monkey-${Date.now()}-${i}-${Math.random()}`,
          x: Math.random() * 90 + 5, // 5% to 95%
          y: Math.random() * 70 + 15, // Keep them somewhat in the grassy area (15% to 85%)
          direction: Math.random() > 0.5 ? 1 : -1,
          speed: 0.2 + Math.random() * 0.3, // Random speed
        });
      }
      monkeysRef.current = [...monkeysRef.current, ...newMonkeys];
      setMonkeys([...monkeysRef.current]);
    } else if (visualCount < currentLength) {
      // Remove monkeys (if user sold them? Not possible in this game yet, but good practice)
      monkeysRef.current = monkeysRef.current.slice(0, visualCount);
      setMonkeys([...monkeysRef.current]);
    }
  }, [monkeyCount]);

  // Animation Loop
  useEffect(() => {
    let animationFrameId: number;

    const updatePositions = () => {
      monkeysRef.current = monkeysRef.current.map(monkey => {
        let newX = monkey.x + (monkey.speed * monkey.direction);
        let newDirection = monkey.direction;

        // Bounce off walls (keep within 5% - 95%)
        if (newX > 95) {
          newX = 95;
          newDirection = -1;
        } else if (newX < 5) {
          newX = 5;
          newDirection = 1;
        }

        // Randomly change direction occasionally
        if (Math.random() < 0.005) {
           newDirection *= -1;
        }

        return { ...monkey, x: newX, direction: newDirection };
      });
      
      setMonkeys([...monkeysRef.current]);
      animationFrameId = requestAnimationFrame(updatePositions);
    };

    animationFrameId = requestAnimationFrame(updatePositions);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="h-full w-full bg-gradient-to-b from-sky-300 via-sky-100 to-green-100 relative overflow-hidden" ref={containerRef}>
      {/* Sun */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
      <div className="absolute top-12 right-12 w-16 h-16 bg-yellow-200 rounded-full"></div>

      {/* Background Scenery: Clouds */}
      <div className="absolute top-20 left-10 text-6xl opacity-80 animate-float" style={{ animationDuration: '6s' }}>☁️</div>
      <div className="absolute top-32 left-1/2 text-6xl opacity-60 animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }}>☁️</div>
      <div className="absolute top-10 right-1/4 text-6xl opacity-90 animate-float" style={{ animationDuration: '7s', animationDelay: '2s' }}>☁️</div>

      {/* Ground/Jungle Layer */}
      <div className="absolute bottom-0 w-full h-3/4 bg-green-200 rounded-t-[50%] scale-150 translate-y-20 shadow-inner"></div>
      
      {/* Palm Trees */}
      <div className="absolute bottom-16 left-4 text-9xl drop-shadow-lg transform -scale-x-100">🌴</div>
      <div className="absolute bottom-32 right-12 text-8xl drop-shadow-lg">🌴</div>
      <div className="absolute bottom-12 right-1/3 text-7xl drop-shadow-lg opacity-80">🌴</div>

      {/* Jungle Floor Content */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <h2 className="text-center mt-20 text-3xl font-heading text-green-800 drop-shadow-sm opacity-80">
          Monkey Sanctuary
        </h2>
        {monkeyCount === 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-green-800/50 font-bold text-xl">No monkeys yet!</p>
            <p className="text-green-800/40 text-sm">Buy them in the Harvest world.</p>
          </div>
        )}
      </div>

      {/* The Monkeys */}
      {monkeys.map(monkey => (
        <div
          key={monkey.id}
          className="absolute transition-transform duration-75 will-change-transform flex flex-col items-center"
          style={{
            left: `${monkey.x}%`,
            top: `${monkey.y}%`,
            transform: `scaleX(${-monkey.direction})`, // Flip horizontally based on direction
            zIndex: Math.floor(monkey.y), // Simple Z-layering based on "depth" (y-pos)
          }}
        >
          <div className="relative">
             <span className="text-4xl filter drop-shadow-md">🐒</span>
             {/* Small banana thought bubble occasionally? - Simplified for now */}
          </div>
        </div>
      ))}
      
      {/* Foreground foliage */}
      <div className="absolute -bottom-10 left-0 w-full flex justify-between px-10 pointer-events-none z-20 opacity-90">
         <span className="text-6xl text-emerald-800 transform rotate-12">🌿</span>
         <span className="text-6xl text-emerald-700 transform -rotate-12">🌿</span>
         <span className="text-5xl text-emerald-900 transform rotate-45">🌿</span>
         <span className="text-7xl text-emerald-800 transform -rotate-6">🌿</span>
      </div>
    </div>
  );
};

export default JungleWorld;