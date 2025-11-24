import React, { useMemo, memo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TileType, GridPosition, FurnitureItem } from '../types';
import { TILE_SIZE, COLORS, GRID_SIZE } from '../constants';
import { CursorMaterial } from './CursorShader';
import { createFloorTexture, createWallTexture } from '../utils/graphics';
import FurnitureObject from './FurnitureObject';

interface RoomProps {
  collisionMap: number[][]; 
  furniture: FurnitureItem[];
  onTileClick: (pos: GridPosition) => void;
  onFurnitureClick: (id: string) => void;
  selection: GridPosition | null;
}

const Room: React.FC<RoomProps> = memo(({ collisionMap, furniture, onTileClick, onFurnitureClick, selection }) => {
  const cursorMaterial = useMemo(() => new CursorMaterial(), []);

  useFrame((state) => {
    if (cursorMaterial) {
      cursorMaterial.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  const floorTexture = useMemo(() => createFloorTexture(), []);
  const wallLeftTexture = useMemo(() => createWallTexture(COLORS.WALL_LEFT), []);
  const wallRightTexture = useMemo(() => createWallTexture(COLORS.WALL_RIGHT), []);

  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    map: floorTexture, roughness: 0.4, metalness: 0.5 
  }), [floorTexture]);
  
  const wallLeftMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    map: wallLeftTexture, color: '#ffffff', roughness: 0.2, metalness: 0.1 
  }), [wallLeftTexture]);

  const wallRightMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    map: wallRightTexture, color: '#ffffff', roughness: 0.2, metalness: 0.1 
  }), [wallRightTexture]);
  
  const wallTopMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.WALL_TOP }), []);
  const baseboardMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#111' }), []);

  const floorGeo = useMemo(() => new THREE.BoxGeometry(TILE_SIZE, 0.05, TILE_SIZE), []);
  const wallGeo = useMemo(() => new THREE.BoxGeometry(TILE_SIZE, 3.5, TILE_SIZE), []);
  const baseboardGeo = useMemo(() => new THREE.BoxGeometry(TILE_SIZE + 0.05, 0.15, TILE_SIZE + 0.05), []);

  return (
    <group>
      {/* Map Rendering: Floor vs Walls based on Collision Map */}
      {collisionMap.map((row, y) =>
        row.map((val, x) => {
          // If 1, it's a Wall
          if (val === 1) {
            return (
              <group key={`w-${x}-${y}`} position={[x * TILE_SIZE, 0, y * TILE_SIZE]}>
                 {/* Walls are shifted up to sit on grid */}
                 <mesh 
                   position={[0, 1.75, 0]} 
                   geometry={wallGeo} 
                   material={[wallRightMaterial, wallLeftMaterial, wallTopMaterial, wallTopMaterial, wallLeftMaterial, wallRightMaterial]} 
                   castShadow 
                   receiveShadow 
                 />
                 <mesh 
                   position={[0, 0.075, 0]} 
                   geometry={baseboardGeo} 
                   material={baseboardMaterial} 
                 />
              </group>
            );
          }
          
          // Default Walkable (0) or Special (3-Door)
          return (
            <group key={`t-${x}-${y}`} position={[x * TILE_SIZE, 0, y * TILE_SIZE]}>
               <mesh 
                  geometry={floorGeo} 
                  material={floorMaterial} 
                  position={[0, -0.025, 0]} 
                  receiveShadow 
               />
               
               {/* Click Hitbox */}
               <mesh 
                  position={[0, 0.01, 0]}
                  onClick={(e) => { e.stopPropagation(); onTileClick({ x, y }); }}
                  visible={false}
               >
                  <boxGeometry args={[TILE_SIZE, 0.1, TILE_SIZE]} />
                  <meshBasicMaterial />
               </mesh>

               {/* Selection Cursor */}
               {selection && selection.x === x && selection.y === y && (
                  <group>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                      <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
                      <primitive object={cursorMaterial} attach="material" transparent depthTest={false} />
                    </mesh>
                  </group>
               )}
            </group>
          );
        })
      )}

      {furniture.map(item => (
        <FurnitureObject key={item.id} item={item} onClick={onFurnitureClick} />
      ))}
    </group>
  );
});

export default Room;