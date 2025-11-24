import React, { useMemo, useRef, useLayoutEffect, memo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GridPosition, FurnitureItem } from '../types';
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
  
  // Instance Refs
  const floorMeshRef = useRef<THREE.InstancedMesh>(null);
  const wallMeshRef = useRef<THREE.InstancedMesh>(null);
  const baseboardMeshRef = useRef<THREE.InstancedMesh>(null);

  useFrame((state) => {
    if (cursorMaterial) {
      cursorMaterial.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  // --- TEXTURES & MATERIALS ---
  const floorTexture = useMemo(() => createFloorTexture(), []);
  const wallLeftTexture = useMemo(() => createWallTexture(COLORS.WALL_LEFT), []);
  const wallRightTexture = useMemo(() => createWallTexture(COLORS.WALL_RIGHT), []);

  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    map: floorTexture, roughness: 0.4, metalness: 0.5 
  }), [floorTexture]);
  
  const wallMaterials = useMemo(() => [
    new THREE.MeshStandardMaterial({ map: wallRightTexture, color: '#ffffff', roughness: 0.2, metalness: 0.1 }), // Right
    new THREE.MeshStandardMaterial({ map: wallLeftTexture, color: '#ffffff', roughness: 0.2, metalness: 0.1 }),  // Left
    new THREE.MeshStandardMaterial({ color: COLORS.WALL_TOP }), // Top
    new THREE.MeshStandardMaterial({ color: COLORS.WALL_TOP }), // Bottom
    new THREE.MeshStandardMaterial({ map: wallLeftTexture, color: '#ffffff', roughness: 0.2, metalness: 0.1 }),  // Front
    new THREE.MeshStandardMaterial({ map: wallRightTexture, color: '#ffffff', roughness: 0.2, metalness: 0.1 })  // Back
  ], [wallLeftTexture, wallRightTexture]);

  const baseboardMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#111' }), []);

  // --- GEOMETRIES ---
  const floorGeo = useMemo(() => new THREE.BoxGeometry(TILE_SIZE, 0.05, TILE_SIZE), []);
  const wallGeo = useMemo(() => new THREE.BoxGeometry(TILE_SIZE, 3.5, TILE_SIZE), []);
  const baseboardGeo = useMemo(() => new THREE.BoxGeometry(TILE_SIZE + 0.05, 0.15, TILE_SIZE + 0.05), []);

  // --- INSTANCE CALCULATION ---
  // We calculate the matrices for all tiles once
  const { floorCount, wallCount, instancesData } = useMemo(() => {
    let fCount = 0;
    let wCount = 0;
    const data: { x: number, y: number, type: 'wall' | 'floor' }[] = [];

    collisionMap.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val === 1) {
          wCount++;
          data.push({ x, y, type: 'wall' });
        } else {
          fCount++;
          data.push({ x, y, type: 'floor' });
        }
      });
    });
    return { floorCount: fCount, wallCount: wCount, instancesData: data };
  }, [collisionMap]);

  // Apply matrices to InstancedMeshes
  useLayoutEffect(() => {
    const tempObj = new THREE.Object3D();
    let fIdx = 0;
    let wIdx = 0;

    instancesData.forEach((item) => {
      if (item.type === 'wall') {
        if (wallMeshRef.current && baseboardMeshRef.current) {
          // Wall Position
          tempObj.position.set(item.x * TILE_SIZE, 1.75, item.y * TILE_SIZE);
          tempObj.rotation.set(0, 0, 0);
          tempObj.scale.set(1, 1, 1);
          tempObj.updateMatrix();
          wallMeshRef.current.setMatrixAt(wIdx, tempObj.matrix);
          
          // Baseboard Position
          tempObj.position.set(item.x * TILE_SIZE, 0.075, item.y * TILE_SIZE);
          tempObj.updateMatrix();
          baseboardMeshRef.current.setMatrixAt(wIdx, tempObj.matrix);
          wIdx++;
        }
      } else {
        if (floorMeshRef.current) {
          // Floor Position
          tempObj.position.set(item.x * TILE_SIZE, -0.025, item.y * TILE_SIZE);
          tempObj.rotation.set(0, 0, 0);
          tempObj.scale.set(1, 1, 1);
          tempObj.updateMatrix();
          floorMeshRef.current.setMatrixAt(fIdx++, tempObj.matrix);
        }
      }
    });

    if (floorMeshRef.current) floorMeshRef.current.instanceMatrix.needsUpdate = true;
    if (wallMeshRef.current) wallMeshRef.current.instanceMatrix.needsUpdate = true;
    if (baseboardMeshRef.current) baseboardMeshRef.current.instanceMatrix.needsUpdate = true;

  }, [instancesData]);

  return (
    <group>
      {/* 1. VISUALS: Instanced Rendering (High Performance) */}
      <instancedMesh 
        ref={floorMeshRef} 
        args={[floorGeo, floorMaterial, floorCount]} 
        receiveShadow 
      />
      <instancedMesh 
        ref={wallMeshRef} 
        args={[wallGeo, wallMaterials, wallCount]} 
        castShadow 
        receiveShadow 
      />
      <instancedMesh 
        ref={baseboardMeshRef} 
        args={[baseboardGeo, baseboardMaterial, wallCount]} 
      />

      {/* 2. INTERACTION: Invisible Hitboxes & Cursor */}
      {collisionMap.map((row, y) =>
        row.map((val, x) => {
          if (val === 1) return null; // No interaction for walls yet
          
          const isSelected = selection && selection.x === x && selection.y === y;
          
          return (
            <group key={`hitbox-${x}-${y}`} position={[x * TILE_SIZE, 0, y * TILE_SIZE]}>
               {/* Invisible Hitbox for clicking */}
               <mesh 
                  position={[0, 0.01, 0]}
                  onClick={(e) => { e.stopPropagation(); onTileClick({ x, y }); }}
                  visible={false}
               >
                  <boxGeometry args={[TILE_SIZE, 0.1, TILE_SIZE]} />
                  <meshBasicMaterial />
               </mesh>

               {/* Selection Cursor (Kept separate for animation) */}
               {isSelected && (
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                    <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
                    <primitive object={cursorMaterial} attach="material" transparent depthTest={false} />
                  </mesh>
               )}
            </group>
          );
        })
      )}

      {/* Furniture */}
      {furniture.map(item => (
        <FurnitureObject key={item.id} item={item} onClick={onFurnitureClick} />
      ))}
    </group>
  );
});

export default Room;