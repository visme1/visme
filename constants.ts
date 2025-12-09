import { MonkeyType } from './types';

export const TICK_RATE_MS = 100; // Game loop update rate
export const SAVE_KEY = 'banana-tycoon-save-v3';

// Visual Limits
export const MAX_VISUAL_MONKEYS = 50;
export const WIN_AMOUNT = 100000000;

// Clicker Upgrade Config
export const CLICK_UPGRADE_BASE_COST = 500;
export const CLICK_UPGRADE_COST_MULTIPLIER = 1.5;

// Monkey Cost Scaling
export const MONKEY_COST_MULTIPLIER = 1.15;

// Monkey Definitions
export const MONKEY_TYPES: MonkeyType[] = [
  { 
    id: 'normal', 
    name: 'Normal Monkey', 
    cost: 100, 
    bps: 1, 
    emoji: '🐒', 
    description: 'A basic monkey. Works for bananas.' 
  },
  { 
    id: 'smart', 
    name: 'Smart Monkey', 
    cost: 1000, 
    bps: 11, 
    emoji: '🤓', 
    description: 'Optimized banana peeling techniques.' 
  },
  { 
    id: 'cool', 
    name: 'Cool Looking Monkey', 
    cost: 10000, 
    bps: 60, 
    emoji: '😎', 
    description: 'Too cool for school, but gets the job done.' 
  },
  { 
    id: 'rich', 
    name: 'Rich Monkey', 
    cost: 150000, 
    bps: 450, 
    emoji: '🧐', 
    description: 'Invests in banana futures.' 
  },
  { 
    id: 'badidas', 
    name: 'Badidas Monkey', 
    cost: 1500000, 
    bps: 2150, 
    emoji: '👟', 
    description: 'Runs extremely fast in tracksuits.' 
  },
  { 
    id: 'ai', 
    name: 'A-I Monkey', 
    cost: 20000000, 
    bps: 1, // Dynamic base, multiplies by 1.2x/sec in logic
    emoji: '🤖', 
    description: 'Self-improving banana algorithm. Grows x1.2/sec!' 
  }
];