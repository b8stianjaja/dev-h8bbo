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
  return 4; 
};

export const useHabboEngine = () => {
  // --- STATE ---
  const [furniture, setFurniture] = useState<FurnitureItem[]>(INITIAL_FURNITURE);
  
  const [entities, setEntities] = useState<Entity[]>([
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
      lastMoveStart: Date.now(),
      color: '#7f8c8d'
    }
  ]);

  const [myEntityId, setMyEntityId] = useState<string | null>(null);

  // Mutable refs for the loop
  const entitiesRef = useRef(entities);
  const furnitureRef = useRef(furniture);
  const accumulatedTime = useRef(0);

  // Keep refs synced
  entitiesRef.current = entities;
  furnitureRef.current = furniture;

  // --- COLLISION MAP ---
  const collisionMap = useMemo(() => {
    const map = INITIAL_MAP_LAYOUT.map(row => [...row]);
    furniture.forEach(item => {
      if (item.position.x >= 0 && item.position.x < GRID_SIZE && item.position.y >= 0 && item.position.y < GRID_SIZE) {
        map[item.position.y][item.position.x] = item.canWalk ? 0 : 1;
      }
    });
    return map;
  }, [furniture]);

  // --- ACTIONS ---

  const joinRoom = useCallback((authData: AuthData) => {
    const startPos = { x: 12, y: 11 }; 
    const newId = `user-${Date.now()}`;
    
    const newEntity: Entity = {
      id: newId,
      username: authData.username,
      gridPosition: startPos,
      rotation: 7, 
      height: 0,
      path: [],
      isWalking: false,
      isSitting: false,
      previousGridPosition: startPos,
      nextGridPosition: startPos,
      lastMoveStart: Date.now(),
      color: authData.look.color
    };

    setEntities(prev => [...prev, newEntity]);
    setMyEntityId(newId);
    
    return newId;
  }, []);

  const moveEntity = useCallback((id: string, target: GridPosition) => {
    setEntities(prev => {
      const entity = prev.find(e => e.id === id);
      if (!entity) return prev;

      const startPos = entity.isWalking ? entity.nextGridPosition : entity.gridPosition;
      
      if (startPos.x === target.x && startPos.y === target.y) return prev;

      const path = findPath(startPos, target, collisionMap);
      
      if (path.length === 0) return prev; 

      return prev.map(ent => {
        if (ent.id !== id) return ent;
        return { ...ent, path: path };
      });
    });
  }, [collisionMap]);

  const interactFurniture = useCallback((id: string) => {
    if (!myEntityId) return;
    
    const item = furnitureRef.current.find(f => f.id === id);
    if (!item) return;

    if (item.type === 'lamp_tall') {
       setFurniture(prev => prev.map(f => f.id === id ? { ...f, state: f.state === 1 ? 0 : 1 } : f));
    } else if (item.canSit) {
       moveEntity(myEntityId, item.position);
    }
  }, [myEntityId, moveEntity]);


  // --- GAME LOOP ---
  useFrame((state, delta) => {
    accumulatedTime.current += delta * 1000; 

    while (accumulatedTime.current >= TICK_RATE_MS) {
      accumulatedTime.current -= TICK_RATE_MS;
      
      const shouldUpdate = entitiesRef.current.some(e => e.path.length > 0 || e.isWalking);

      if (shouldUpdate) {
        setEntities(prevEntities => prevEntities.map(entity => {
            let newEntity = { ...entity };
            
            if (newEntity.path.length > 0) {
              newEntity.previousGridPosition = newEntity.nextGridPosition;
              
              const nextStep = newEntity.path[0];
              newEntity.path = newEntity.path.slice(1);
              newEntity.nextGridPosition = nextStep;
              newEntity.gridPosition = nextStep;
              
              newEntity.rotation = getDirection(newEntity.previousGridPosition, newEntity.nextGridPosition);
              
              newEntity.isWalking = true;
              newEntity.isSitting = false; 
              newEntity.height = 0;
              newEntity.lastMoveStart = Date.now();
            } else {
              if (newEntity.isWalking) {
                 newEntity.isWalking = false;
                 newEntity.previousGridPosition = newEntity.nextGridPosition;
                 newEntity.lastMoveStart = Date.now();
                 
                 const furni = furnitureRef.current.find(f => f.position.x === newEntity.gridPosition.x && f.position.y === newEntity.gridPosition.y);
                 if (furni && furni.canSit) {
                   newEntity.isSitting = true;
                   newEntity.rotation = furni.rotation; 
                 }
              }
            }
            return newEntity;
        }));
      }
    }
  });

  return useMemo(() => ({
    entities,
    furniture,
    collisionMap,
    myEntityId,
    joinRoom,
    moveEntity,
    interactFurniture
  }), [entities, furniture, collisionMap, myEntityId, joinRoom, moveEntity, interactFurniture]);
};