import { Vector3 } from 'three';

export interface GridPosition {
  x: number;
  y: number;
}

export type Direction = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface PathNode extends GridPosition {
  f: number;
  g: number;
  h: number;
  parent: PathNode | null;
}

export enum TileType {
  WALKABLE = 0,
  WALL = 1,
  VOID = 9,
}

// Entity State for the Engine
export interface Entity {
  id: string;
  username: string;
  // Logical State (Grid)
  gridPosition: GridPosition; 
  rotation: Direction;
  height: number; // z-height (for sitting/stacking)
  
  // Movement State
  path: GridPosition[]; // Queue of future tiles
  isWalking: boolean;
  isSitting: boolean;
  
  // Visual Interpolation State
  previousGridPosition: GridPosition;
  nextGridPosition: GridPosition;
  moveProgress: number; // 0.0 to 1.0
  
  // Appearance
  color: string;
}

export type FurnitureType = 'chair_basic' | 'table_wood' | 'lamp_tall';

export interface FurnitureItem {
  id: string;
  type: FurnitureType;
  position: GridPosition;
  rotation: Direction; // Usually 0, 2, 4, 6 for furniture
  state: number; // Interaction state
  canSit: boolean;
  canWalk: boolean;
  canStack: boolean;
}

export interface RoomState {
  tiles: number[][]; // 0 or 1
  furniture: FurnitureItem[];
  entities: Entity[];
}

export interface AuthData {
  username: string;
  look: {
    color: string;
  };
}

export enum GamePhase {
  LOGIN = 'LOGIN',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING'
}
