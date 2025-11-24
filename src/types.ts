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
  height: number;
  
  // Movement State
  path: GridPosition[];
  isWalking: boolean;
  isSitting: boolean;
  
  // Interpolation State (Decoupled from render loop)
  previousGridPosition: GridPosition;
  nextGridPosition: GridPosition;
  lastMoveStart: number; // Timestamp of the last logic tick
  
  // Appearance
  color: string;
}

export type FurnitureType = 'chair_basic' | 'table_wood' | 'lamp_tall' | 'neon_tube';

export interface FurnitureItem {
  id: string;
  type: FurnitureType;
  position: GridPosition;
  rotation: Direction;
  state: number;
  canSit: boolean;
  canWalk: boolean;
  canStack: boolean;
}

export interface RoomState {
  tiles: number[][];
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