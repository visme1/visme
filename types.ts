export enum World {
  HARVEST = 'HARVEST',
  JUNGLE = 'JUNGLE',
}

export interface MonkeyType {
  id: string;
  name: string;
  cost: number;
  bps: number; // Bananas per second
  emoji: string;
  description: string;
}

export interface GameState {
  bananas: number;
  monkeyCounts: Record<string, number>; // Map of monkeyId -> count
  totalLifetimeBananas: number;
  customBanana?: string; // Base64 data URL of the user's drawing
  
  // New features
  clickUpgradeLevel: number;
  aiBpsMultiplier: number; // Tracks the exponential growth of AI monkeys
  hasWon: boolean; // True if player reached 100M and decided to continue
}

export interface MonkeyWorker {
  id: string;
  x: number;
  y: number;
  direction: number; // 1 for right, -1 for left
  speed: number;
  typeId?: string; // To potentially show different visuals later
}