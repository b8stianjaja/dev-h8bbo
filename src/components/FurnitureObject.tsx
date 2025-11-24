import React, { useMemo } from 'react';
import { FurnitureItem } from '../types';
import { TILE_SIZE } from '../constants';
import * as THREE from 'three';

interface FurnitureObjectProps {
  item: FurnitureItem;
  onClick: (id: string) => void;
}

const FurnitureObject: React.FC<FurnitureObjectProps> = ({ item, onClick }) => {
  const { type, position, rotation, state } = item;
  
  const rotationRad = -(rotation * Math.PI) / 2;

  const handleClick = (e: any) => {
    // Critical: Stop propagation so we don't click the floor tile underneath
    e.stopPropagation();
    onClick(item.id);
  };

  const GroupContent = useMemo(() => {
    switch (type) {
      case 'chair_basic':
        return (
          <group>
            {/* Legs */}
            <mesh position={[0.15, 0.1, 0.15]} castShadow>
              <boxGeometry args={[0.07, 0.2, 0.07]} />
              <meshStandardMaterial color="#5c3a21" />
            </mesh>
            <mesh position={[-0.15, 0.1, 0.15]} castShadow>
              <boxGeometry args={[0.07, 0.2, 0.07]} />
              <meshStandardMaterial color="#5c3a21" />
            </mesh>
            <mesh position={[0.15, 0.1, -0.15]} castShadow>
              <boxGeometry args={[0.07, 0.2, 0.07]} />
              <meshStandardMaterial color="#5c3a21" />
            </mesh>
            <mesh position={[-0.15, 0.1, -0.15]} castShadow>
              <boxGeometry args={[0.07, 0.2, 0.07]} />
              <meshStandardMaterial color="#5c3a21" />
            </mesh>
            
            {/* Seat - Rounded slightly via geometry if possible, but keeping boxy style for retro look */}
            <mesh position={[0, 0.25, 0]} castShadow>
              <boxGeometry args={[0.42, 0.1, 0.42]} />
              <meshStandardMaterial color="#d63a3a" /> {/* Classic Red */}
            </mesh>
            
            {/* Backrest */}
            <mesh position={[0, 0.55, -0.17]} castShadow>
              <boxGeometry args={[0.42, 0.5, 0.08]} />
              <meshStandardMaterial color="#d63a3a" />
            </mesh>
          </group>
        );

      case 'table_wood':
        return (
          <group>
             {/* Legs */}
             <mesh position={[0.3, 0.2, 0.3]} castShadow>
               <boxGeometry args={[0.08, 0.4, 0.08]} />
               <meshStandardMaterial color="#3e2723" />
             </mesh>
             <mesh position={[-0.3, 0.2, 0.3]} castShadow>
               <boxGeometry args={[0.08, 0.4, 0.08]} />
               <meshStandardMaterial color="#3e2723" />
             </mesh>
             <mesh position={[0.3, 0.2, -0.3]} castShadow>
               <boxGeometry args={[0.08, 0.4, 0.08]} />
               <meshStandardMaterial color="#3e2723" />
             </mesh>
             <mesh position={[-0.3, 0.2, -0.3]} castShadow>
               <boxGeometry args={[0.08, 0.4, 0.08]} />
               <meshStandardMaterial color="#3e2723" />
             </mesh>
             
             {/* Surface */}
             <mesh position={[0, 0.425, 0]} castShadow receiveShadow>
               <boxGeometry args={[0.95, 0.05, 0.95]} />
               <meshStandardMaterial color="#5d4037" roughness={0.6} />
             </mesh>
             
             {/* Detail overlay */}
             <mesh position={[0, 0.43, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                <planeGeometry args={[0.8, 0.8]} />
                <meshStandardMaterial color="#6d4c41" transparent opacity={0.5} />
             </mesh>
          </group>
        );

      case 'lamp_tall':
        const isOn = state === 1;
        return (
          <group>
            {/* Base */}
            <mesh position={[0, 0.02, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.2, 0.05, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Pole */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Shade */}
            <mesh position={[0, 0.9, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.22, 0.3, 32]} />
              <meshStandardMaterial 
                color={isOn ? "#ffffcc" : "#f0f0f0"} 
                emissive={isOn ? "#ffaa00" : "#000000"} 
                emissiveIntensity={isOn ? 0.5 : 0}
                transparent
                opacity={0.9}
              />
            </mesh>
            
            {/* Light Source */}
            {isOn && (
              <pointLight position={[0, 0.85, 0]} intensity={2} distance={6} decay={2} color="#ffaa00" castShadow />
            )}
          </group>
        );

      default:
        return null;
    }
  }, [type, state]);

  return (
    <group 
      position={[position.x * TILE_SIZE, 0, position.y * TILE_SIZE]} 
      rotation={[0, rotationRad, 0]}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {/* Hitbox helper for smaller items like lamps to make them easier to click */}
      <mesh visible={false}>
         <boxGeometry args={[0.6, 1, 0.6]} />
         <meshBasicMaterial />
      </mesh>
      {GroupContent}
    </group>
  );
};

export default FurnitureObject;