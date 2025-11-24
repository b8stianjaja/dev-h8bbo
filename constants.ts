import * as THREE from 'three';
import { FurnitureItem } from './types';

// --- ENGINE SETTINGS ---
export const TICK_RATE_MS = 480; 
export const TILE_SIZE = 1;
export const GRID_SIZE = 14;

// --- VISUALS ---
export const WALL_HEIGHT = 3.2; // Slightly taller for grandeur
export const WALL_THICKNESS = 0.2;

// Isometric Camera Angles
export const ISO_ANGLE_Y = Math.PI / 4; 
export const ISO_ANGLE_X = Math.atan(1 / Math.sqrt(2)); 

export const COLORS = {
  // Midnight Lounge Palette
  FLOOR_BASE: '#2c3e50',      // Dark Blue-Grey
  FLOOR_HIGHLIGHT: '#34495e', // Lighter Blue-Grey
  FLOOR_SHADOW: '#1a252f',    // Deep Shadow
  
  WALL_TOP: '#1a1a1a',        // Darkest
  WALL_LEFT: '#e0e0e0',       // Bright face
  WALL_RIGHT: '#bdc3c7',      // Dim face
  
  SELECTION: '#e74c3c',       // Vibrant Red for selection cursor
  SHADOW: '#000000',
  BACKGROUND: '#121212',      // Void color
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