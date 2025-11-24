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
    map: floorTexture, roughness: 0.8, metalness: 0.1 
  }), [floorTexture]);
  
  const wallLeftMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    map: wallLeftTexture, color: '#ffffff', roughness: 0.9 
  }), [wallLeftTexture]);

  const wallRightMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    map: wallRightTexture, color: '#ffffff', roughness: 0.9 
  }), [wallRightTexture]);
  
  const wallTopMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.WALL_TOP }), []);
  const baseboardMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#555555' }), []);

  const floorGeo = useMemo(() => new THREE.BoxGeometry(TILE_SIZE, 0.05, TILE_SIZE), []);
  const wallGeo = useMemo(() => new THREE.BoxGeometry(TILE_SIZE, 3.0, TILE_SIZE), []);
  const baseboardGeo = useMemo(() => new THREE.BoxGeometry(TILE_SIZE + 0.05, 0.15, TILE_SIZE + 0.05), []);

  return (
    <group>
      {/* Floor Tiles */}
      {collisionMap.map((row, y) =>
        row.map((val, x) => {
          return (
            <group key={`t-${x}-${y}`} position={[x * TILE_SIZE, 0, y * TILE_SIZE]}>
               <mesh 
                  geometry={floorGeo} 
                  material={floorMaterial} 
                  position={[0, -0.025, 0]} 
                  receiveShadow 
               />
               <mesh 
                  position={[0, 0.01, 0]}
                  onClick={(e) => { e.stopPropagation(); onTileClick({ x, y }); }}
                  visible={false}
               >
                  <boxGeometry args={[TILE_SIZE, 0.1, TILE_SIZE]} />
                  <meshBasicMaterial />
               </mesh>

               {selection && selection.x === x && selection.y === y && (
                  <group>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                      <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
                      <primitive object={cursorMaterial} attach="material" transparent depthTest={false} />
                    </mesh>
                    <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI]}>
                        <coneGeometry args={[0.2, 0.5, 4]} />
                        <meshStandardMaterial color="#fff" emissive="#aaa" />
                    </mesh>
                  </group>
               )}
            </group>
          );
        })
      )}

      {/* Render Static Walls at the room boundaries (0 coordinates) */}
      {Array.from({ length: GRID_SIZE }).map((_, i) => (
         <group key={`w-back-${i}`} position={[i * TILE_SIZE, 0, 0]}>
            <mesh position={[0, 1.5, 0]} geometry={wallGeo} material={[wallRightMaterial, wallLeftMaterial, wallTopMaterial, wallTopMaterial, wallLeftMaterial, wallRightMaterial]} castShadow receiveShadow />
            <mesh position={[0, 0.075, 0]} geometry={baseboardGeo} material={baseboardMaterial} />
         </group>
      ))}
      {Array.from({ length: GRID_SIZE }).map((_, i) => (
         <group key={`w-left-${i}`} position={[0, 0, i * TILE_SIZE]}>
             <mesh position={[0, 1.5, 0]} geometry={wallGeo} material={[wallRightMaterial, wallLeftMaterial, wallTopMaterial, wallTopMaterial, wallLeftMaterial, wallRightMaterial]} castShadow receiveShadow />
             <mesh position={[0, 0.075, 0]} geometry={baseboardGeo} material={baseboardMaterial} />
         </group>
      ))}

      {furniture.map(item => (
        <FurnitureObject key={item.id} item={item} onClick={onFurnitureClick} />
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7, -2, 7]} onClick={(e) => e.stopPropagation()} receiveShadow>
         <planeGeometry args={[100, 100]} />
         <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
});

export default Room;