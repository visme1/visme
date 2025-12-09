import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { World, GameState } from './types';
import { 
  TICK_RATE_MS, 
  MONKEY_TYPES, 
  SAVE_KEY, 
  CLICK_UPGRADE_BASE_COST, 
  CLICK_UPGRADE_COST_MULTIPLIER,
  MONKEY_COST_MULTIPLIER,
  WIN_AMOUNT 
} from './constants';
import HarvestWorld from './components/HarvestWorld';
import JungleWorld from './components/JungleWorld';
import Navbar from './components/Navbar';
import StatsBar from './components/StatsBar';

const App: React.FC = () => {
  // --- Game State ---
  const [currentWorld, setCurrentWorld] = useState<World>(World.HARVEST);
  const [showWinModal, setShowWinModal] = useState(false);
  
  const [gameState, setGameState] = useState<GameState>(() => {
    // Try to load from local storage
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure new fields exist
        return {
          bananas: parsed.bananas || 0,
          monkeyCounts: parsed.monkeyCounts || {},
          totalLifetimeBananas: parsed.totalLifetimeBananas || 0,
          customBanana: parsed.customBanana,
          clickUpgradeLevel: parsed.clickUpgradeLevel || 0,
          aiBpsMultiplier: parsed.aiBpsMultiplier || 1,
          hasWon: parsed.hasWon || false,
        };
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
    return {
      bananas: 0,
      monkeyCounts: {},
      totalLifetimeBananas: 0,
      clickUpgradeLevel: 0,
      aiBpsMultiplier: 1,
      hasWon: false,
    };
  });

  // Calculate total BPS (Bananas per second)
  const totalBPS = useMemo(() => {
    let bps = 0;
    Object.entries(gameState.monkeyCounts).forEach(([id, count]) => {
      const type = MONKEY_TYPES.find(m => m.id === id);
      if (type) {
        if (id === 'ai') {
          // AI Monkey Logic: Base 1 * Multiplier
          bps += (1 * gameState.aiBpsMultiplier) * count;
        } else {
          bps += type.bps * count;
        }
      }
    });
    return bps;
  }, [gameState.monkeyCounts, gameState.aiBpsMultiplier]);

  // Calculate Click Value
  const clickValue = useMemo(() => {
    // Base 1, scales with upgrades. 
    return Math.floor(1 * Math.pow(1.5, gameState.clickUpgradeLevel));
  }, [gameState.clickUpgradeLevel]);

  // Calculate Upgrade Cost
  const nextUpgradeCost = useMemo(() => {
    return Math.floor(CLICK_UPGRADE_BASE_COST * Math.pow(CLICK_UPGRADE_COST_MULTIPLIER, gameState.clickUpgradeLevel));
  }, [gameState.clickUpgradeLevel]);

  // Calculate total Monkey Count
  const totalMonkeys = useMemo(() => {
    return Object.values(gameState.monkeyCounts).reduce((a, b) => a + b, 0);
  }, [gameState.monkeyCounts]);

  // --- Game Loop (Passive Income) ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      setGameState(prev => {
        const hasAiMonkey = (prev.monkeyCounts['ai'] || 0) > 0;
        let newAiMultiplier = prev.aiBpsMultiplier;

        // Apply AI Growth: x1.2 every second
        // Since we tick every 100ms, we apply (1.2)^(0.1) every tick
        if (hasAiMonkey) {
           const growthFactor = Math.pow(1.2, TICK_RATE_MS / 1000); 
           newAiMultiplier = prev.aiBpsMultiplier * growthFactor;
        }

        // Calculate Income based on PREVIOUS state to avoid jitter, 
        // but using the updated AI multiplier for this tick
        let currentTickBps = 0;
        Object.entries(prev.monkeyCounts).forEach(([id, count]) => {
          const type = MONKEY_TYPES.find(m => m.id === id);
          if (type) {
            if (id === 'ai') {
              currentTickBps += (1 * newAiMultiplier) * count;
            } else {
              currentTickBps += type.bps * count;
            }
          }
        });

        const income = currentTickBps * (TICK_RATE_MS / 1000);
        
        return {
          ...prev,
          bananas: prev.bananas + income,
          totalLifetimeBananas: prev.totalLifetimeBananas + income,
          aiBpsMultiplier: newAiMultiplier
        };
      });
    }, TICK_RATE_MS);

    return () => clearInterval(intervalId);
  }, []);

  // --- Win Condition Check ---
  useEffect(() => {
    if (gameState.bananas >= WIN_AMOUNT && !gameState.hasWon && !showWinModal) {
      setShowWinModal(true);
    }
  }, [gameState.bananas, gameState.hasWon, showWinModal]);

  // --- Auto-Save ---
  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    }, 5000);
    return () => clearInterval(saveInterval);
  }, [gameState]);

  // --- Actions ---
  const handleManualHarvest = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      bananas: prev.bananas + clickValue,
      totalLifetimeBananas: prev.totalLifetimeBananas + clickValue,
    }));
  }, [clickValue]);

  const handleBuyMonkey = useCallback((typeId: string) => {
    setGameState(prev => {
      const monkeyType = MONKEY_TYPES.find(m => m.id === typeId);
      if (!monkeyType) return prev;

      const currentCount = prev.monkeyCounts[typeId] || 0;
      // Calculate dynamic cost: BaseCost * (1.15 ^ currentCount)
      const currentCost = Math.floor(monkeyType.cost * Math.pow(MONKEY_COST_MULTIPLIER, currentCount));

      if (prev.bananas >= currentCost) {
        return {
          ...prev,
          bananas: prev.bananas - currentCost,
          monkeyCounts: {
            ...prev.monkeyCounts,
            [typeId]: currentCount + 1
          }
        };
      }
      return prev;
    });
  }, []);

  const handleBuyUpgrade = useCallback(() => {
    setGameState(prev => {
      const cost = Math.floor(CLICK_UPGRADE_BASE_COST * Math.pow(CLICK_UPGRADE_COST_MULTIPLIER, prev.clickUpgradeLevel));
      if (prev.bananas >= cost) {
        return {
          ...prev,
          bananas: prev.bananas - cost,
          clickUpgradeLevel: prev.clickUpgradeLevel + 1
        };
      }
      return prev;
    });
  }, []);

  const handleSaveBanana = useCallback((dataUrl: string) => {
    setGameState(prev => ({
      ...prev,
      customBanana: dataUrl
    }));
  }, []);

  const handleResetGame = () => {
    const freshState: GameState = {
      bananas: 0,
      monkeyCounts: {},
      totalLifetimeBananas: 0,
      clickUpgradeLevel: 0,
      aiBpsMultiplier: 1,
      hasWon: false,
      customBanana: gameState.customBanana // Keep the drawing
    };
    setGameState(freshState);
    localStorage.setItem(SAVE_KEY, JSON.stringify(freshState));
    setShowWinModal(false);
  };

  const handlePlayFurther = () => {
    setGameState(prev => ({ ...prev, hasWon: true }));
    setShowWinModal(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 relative overflow-hidden">
      {/* Top Status Bar (Sticky) */}
      <StatsBar 
        bananas={gameState.bananas} 
        monkeys={totalMonkeys} 
        mps={totalBPS} 
      />

      {/* Main Content Area */}
      <div className="flex-grow relative overflow-hidden">
        {currentWorld === World.HARVEST ? (
          <HarvestWorld 
            bananas={gameState.bananas}
            onHarvest={handleManualHarvest}
            customBanana={gameState.customBanana}
            onSaveBanana={handleSaveBanana}
            onBuyMonkey={handleBuyMonkey}
            onBuyUpgrade={handleBuyUpgrade}
            monkeyCounts={gameState.monkeyCounts}
            clickUpgradeLevel={gameState.clickUpgradeLevel}
            nextUpgradeCost={nextUpgradeCost}
            clickValue={clickValue}
            showWinModal={showWinModal}
            onReset={handleResetGame}
            onPlayFurther={handlePlayFurther}
            aiMultiplier={gameState.aiBpsMultiplier}
          />
        ) : (
          <JungleWorld 
            monkeyCount={totalMonkeys}
          />
        )}
      </div>

      {/* Bottom Navigation (Sticky) */}
      <Navbar currentWorld={currentWorld} setWorld={setCurrentWorld} />
    </div>
  );
};

export default App;