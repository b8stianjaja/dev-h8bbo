import { FurnitureItem } from './types';

// --- ENGINE SETTINGS ---
export const TICK_RATE_MS = 480; 
export const TILE_SIZE = 1;
export const GRID_SIZE = 14;

// --- VISUALS ---
export const WALL_HEIGHT = 3.5; 
export const WALL_THICKNESS = 0.2;

export const COLORS = {
  // Cozy Modern Palette
  FLOOR_BASE: '#e2e8f0',      // Light Slate
  FLOOR_HIGHLIGHT: '#f8fafc', // Almost White
  FLOOR_SHADOW: '#cbd5e1',    
  
  WALL_TOP: '#94a3b8',        // Grey-ish top
  WALL_LEFT: '#e5e7eb',       // Bright White/Grey Walls
  WALL_RIGHT: '#d1d5db',      // Slightly darker for depth
  
  SELECTION: '#fbbf24',       // Warm Amber selection
  SHADOW: '#64748b',
  BACKGROUND: '#f0f9ff',      // Very light airy blue sky
};

// 0 = Walkable, 1 = Wall
export const INITIAL_MAP_LAYOUT = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0], // Door
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const INITIAL_FURNITURE: FurnitureItem[] = [
  { id: 't1', type: 'table_wood', position: { x: 4, y: 4 }, rotation: 0, state: 0, canSit: false, canWalk: false, canStack: true },
  { id: 't2', type: 'table_wood', position: { x: 5, y: 4 }, rotation: 0, state: 0, canSit: false, canWalk: false, canStack: true },
  { id: 'c1', type: 'chair_basic', position: { x: 3, y: 4 }, rotation: 2, state: 0, canSit: true, canWalk: true, canStack: false }, 
  { id: 'c2', type: 'chair_basic', position: { x: 6, y: 4 }, rotation: 6, state: 0, canSit: true, canWalk: true, canStack: false },
  { id: 'l1', type: 'lamp_tall', position: { x: 1, y: 1 }, rotation: 0, state: 1, canSit: false, canWalk: false, canStack: false },
  { id: 'l2', type: 'lamp_tall', position: { x: 12, y: 1 }, rotation: 0, state: 1, canSit: false, canWalk: false, canStack: false },
];