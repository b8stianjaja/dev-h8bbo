import { useState, useRef, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  GridPosition, 
  Entity, 
  FurnitureItem, 
  Direction, 
  AuthData
} from '../types';
import { 
  INITIAL_MAP_LAYOUT, 
  TICK_RATE_MS, 
  INITIAL_FURNITURE,
  GRID_SIZE
} from '../constants';
import { findPath } from '../utils/pathfinding';

// Helper to calculate direction (0-7) between two points
const getDirection = (from: GridPosition, to: GridPosition): Direction => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  if (dx === 0 && dy === -1) return 0;
  if (dx === 1 && dy === -1) return 1;
  if (dx === 1 && dy === 0) return 2;
  if (dx === 1 && dy === 1) return 3;
  if (dx === 0 && dy === 1) return 4;
  if (dx === -1 && dy === 1) return 5;
  if (dx === -1 && dy === 0) return 6;
  if (dx === -1 && dy === -1) return 7;
  return 4; // Default South
};

export const useHabboEngine = () => {
  // --- STATE ---
  const [furniture, setFurniture] = useState<FurnitureItem[]>(INITIAL_FURNITURE);

  // Start with empty entities or bots, Player joins later
  const [entities, setEntities] = useState<Entity[]>([
    // Example Bot
    {
      id: 'bot-1',
      username: 'Frank',
      gridPosition: { x: 12, y: 2 },
      rotation: 6,
      height: 0,
      path: [],
      isWalking: false,
      isSitting: false,
      previousGridPosition: { x: 12, y: 2 },
      nextGridPosition: { x: 12, y: 2 },
      moveProgress: 0,
      color: '#7f8c8d'
    }
  ]);

  const [myEntityId, setMyEntityId] = useState<string | null>(null);

  // Use refs for the simulation loop to avoid re-render lag during ticks
  const entitiesRef = useRef(entities);
  const furnitureRef = useRef(furniture);
  const accumulatedTime = useRef(0);

  // Sync refs when state changes externally
  entitiesRef.current = entities;
  furnitureRef.current = furniture;

  // --- COLLISION MAP ---
  const collisionMap = useMemo(() => {
    const map = INITIAL_MAP_LAYOUT.map(row => [...row]);
    furniture.forEach(item => {
      if (item.position.x >= 0 && item.position.x < GRID_SIZE && item.position.y >= 0 && item.position.y < GRID_SIZE) {
        // If it's a chair, it IS walkable (to sit on). If it's a table, it is blocked.
        map[item.position.y][item.position.x] = item.canWalk ? 0 : 1;
      }
    });
    return map;
  }, [furniture]);

  // --- ACTIONS ---

  const joinRoom = useCallback((authData: AuthData) => {
    const startPos = { x: 12, y: 11 }; // Door position
    const newId = `user-${Date.now()}`;
    
    const newEntity: Entity = {
      id: newId,
      username: authData.username,
      gridPosition: startPos,
      rotation: 7, // Facing into room
      height: 0,
      path: [],
      isWalking: false,
      isSitting: false,
      previousGridPosition: startPos,
      nextGridPosition: startPos,
      moveProgress: 0,
      color: authData.look.color
    };

    setEntities(prev => [...prev, newEntity]);
    setMyEntityId(newId);
    
    // Auto walk into room
    setTimeout(() => {
       moveEntity(newId, { x: 10, y: 8 });
    }, 500);

    return newId;
  }, []);

  const moveEntity = useCallback((id: string, target: GridPosition) => {
    setEntities(prev => {
      const entity = prev.find(e => e.id === id);
      if (!entity) return prev;

      // Start pathfinding from the NEXT logical position if currently moving
      const startPos = entity.isWalking ? entity.nextGridPosition : entity.gridPosition;
      
      const path = findPath(startPos, target, collisionMap);
      
      if (path.length === 0) return prev; // No path

      return prev.map(ent => {
        if (ent.id !== id) return ent;
        return { ...ent, path: path };
      });
    });
  }, [collisionMap]);

  const interactFurniture = useCallback((id: string) => {
    if (!myEntityId) return;
    
    const item = furniture.find(f => f.id === id);
    if (!item) return;

    if (item.type === 'lamp_tall') {
       // Toggle Lamp
       setFurniture(prev => prev.map(f => f.id === id ? { ...f, state: f.state === 1 ? 0 : 1 } : f));
    } else if (item.canSit) {
       // Walk to Chair
       moveEntity(myEntityId, item.position);
    }
  }, [furniture, moveEntity, myEntityId]);


  // --- GAME LOOP ---
  useFrame((state, delta) => {
    // 1. Accumulate time
    accumulatedTime.current += delta * 1000; // ms

    // 2. Interpolation Progress
    let progress = accumulatedTime.current / TICK_RATE_MS;
    if (progress > 1) progress = 1;

    // 3. Update Visual State (Mutable ref access for render loop, but we need to trigger React state for positions)
    const nextEntities = entitiesRef.current.map(entity => {
      if (entity.isWalking) {
        return { ...entity, moveProgress: progress };
      }
      return entity;
    });

    // 4. LOGIC TICK
    if (accumulatedTime.current >= TICK_RATE_MS) {
      accumulatedTime.current -= TICK_RATE_MS;
      
      const newTickEntities = nextEntities.map(entity => {
        let newEntity = { ...entity };
        
        if (newEntity.path.length > 0) {
          // Arrived at destination of previous step
          newEntity.previousGridPosition = { ...newEntity.nextGridPosition };
          
          // Pop next step
          const nextStep = newEntity.path[0];
          newEntity.path = newEntity.path.slice(1);
          newEntity.nextGridPosition = nextStep;
          newEntity.gridPosition = nextStep; 
          
          newEntity.rotation = getDirection(newEntity.previousGridPosition, newEntity.nextGridPosition);
          
          newEntity.isWalking = true;
          newEntity.moveProgress = 0; 
          newEntity.isSitting = false; 
          newEntity.height = 0;
        } else {
          // Stop
          if (newEntity.isWalking) {
             newEntity.isWalking = false;
             newEntity.previousGridPosition = newEntity.nextGridPosition;
             newEntity.moveProgress = 0;
             
             // Check Sit
             const furni = furnitureRef.current.find(f => f.position.x === newEntity.gridPosition.x && f.position.y === newEntity.gridPosition.y);
             if (furni && furni.canSit) {
               newEntity.isSitting = true;
               newEntity.rotation = furni.rotation; 
             }
          }
        }
        return newEntity;
      });

      setEntities(newTickEntities);
    } else {
      // Mid-tick update
      if (nextEntities.some(e => e.isWalking)) {
        setEntities(nextEntities);
      }
    }
  });

  return {
    entities,
    furniture,
    collisionMap,
    myEntityId,
    joinRoom,
    moveEntity,
    interactFurniture
  };
};
