import { FurnitureItem } from '../types';

// --- ENGINE SETTINGS ---
export constZS TICK_RATE_MS = 480; 
export const TILE_SIZE = 1;
export const GRID_SIZE = 14;

// --- VISUALS ---
export const WALL_HEIGHT = 3.5; 
export const WALL_THICKNESS = 0.2;

export const COLORS = {
  // Neon Cyberpunk Palette
  FLOOR_BASE: '#0f172a',      // Dark Indigo Void
  FLOOR_HIGHLIGHT: '#1e293b', 
  FLOOR_SHADOW: '#020617',    
  
  WALL_TOP: '#000000',        
  WALL_LEFT: '#334155',       // Metallic Blue-Grey
  WALL_RIGHT: '#1e293b',      
  
  SELECTION: '#22d3ee',       // Cyan Glow
  SHADOW: '#000000',
  BACKGROUND: '#050510',      // Deep Void
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