import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, MathUtils } from 'three';
import { Entity } from '../types';
import { TILE_SIZE } from '../constants';
import { Html } from '@react-three/drei';

interface AvatarProps {
  entity: Entity;
  currentMessage?: string;
}

const Avatar: React.FC<AvatarProps> = ({ entity, currentMessage }) => {
  const groupRef = useRef<Group>(null);
  
  // Body Parts Refs
  const leftLegRef = useRef<any>(null);
  const rightLegRef = useRef<any>(null);
  const leftArmRef = useRef<any>(null);
  const rightArmRef = useRef<any>(null);
  const headRef = useRef<any>(null);
  const bodyRef = useRef<any>(null);
  
  // Blink State
  const [blink, setBlink] = useState(false);
  
  // Materials
  const skinMaterial = useMemo(() => <meshStandardMaterial color="#ffccaa" roughness={1} />, []);
  const shirtMaterial = useMemo(() => <meshStandardMaterial color={entity.color} />, [entity.color]);
  const pantsMaterial = useMemo(() => <meshStandardMaterial color="#303030" />, []);
  const eyeMaterial = useMemo(() => <meshBasicMaterial color="black" />, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    // --- POSITIONAL INTERPOLATION ---
    const startX = entity.previousGridPosition.x * TILE_SIZE;
    const startZ = entity.previousGridPosition.y * TILE_SIZE;
    const endX = entity.nextGridPosition.x * TILE_SIZE;
    const endZ = entity.nextGridPosition.y * TILE_SIZE;

    const x = MathUtils.lerp(startX, endX, entity.moveProgress);
    const z = MathUtils.lerp(startZ, endZ, entity.moveProgress);
    
    // Sit Adjustment
    const yOffset = entity.isSitting ? -0.15 : 0;
    
    groupRef.current.position.set(x, yOffset, z);

    // --- ROTATION ---
    const rotationMap: Record<number, number> = {
        0: Math.PI,       // N
        1: 3 * Math.PI / 4, // NE 
        2: Math.PI / 2,   // E 
        3: Math.PI / 4,
        4: 0,             // S
        5: -Math.PI / 4,
        6: -Math.PI / 2,  // W
        7: -3 * Math.PI / 4
    };
    
    const targetRot = rotationMap[entity.rotation] ?? 0;
    
    // Shortest path interpolation
    let currentRot = groupRef.current.rotation.y;
    let diff = targetRot - currentRot;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    groupRef.current.rotation.y += diff * 0.3; // Fast smooth snap

    // --- ANIMATIONS ---
    const time = state.clock.elapsedTime * 15;

    if (entity.isWalking) {
      // Walking Animation
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time) * 0.8;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time + Math.PI) * 0.8;
      
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time + Math.PI) * 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time) * 0.8;
      
      if (bodyRef.current) bodyRef.current.position.y = 0.45 + Math.abs(Math.sin(time)) * 0.04;
    } else {
      // Idle / Sitting
      
      // Reset Arms
      if (leftArmRef.current) leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.2);
      if (rightArmRef.current) rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.2);

      if (entity.isSitting) {
         if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI / 2;
         if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 2;
         if (bodyRef.current) bodyRef.current.position.y = 0.35; 
         if (headRef.current) headRef.current.position.y = 0.75;
      } else {
         if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
         if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
         if (bodyRef.current) bodyRef.current.position.y = 0.45;
         if (headRef.current) headRef.current.position.y = 0.85;
      }
    }
  });

  // Blink Effect
  useEffect(() => {
    const blinkLoop = setInterval(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
    }, Math.random() * 3000 + 2000);
    return () => clearInterval(blinkLoop);
  }, []);

  return (
    <group position={[0,0,0]}> 
      <group ref={groupRef}>
        
        {/* Shadow */}
        {!entity.isSitting && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <circleGeometry args={[0.3, 16]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.2} />
          </mesh>
        )}

        {/* Legs */}
        <group position={[-0.1, 0.25, 0]}>
           <mesh ref={leftLegRef} position={[0, -0.125, 0]} castShadow>
               <boxGeometry args={[0.13, 0.35, 0.13]} />
               {pantsMaterial}
           </mesh>
        </group>
        <group position={[0.1, 0.25, 0]}>
           <mesh ref={rightLegRef} position={[0, -0.125, 0]} castShadow>
               <boxGeometry args={[0.13, 0.35, 0.13]} />
               {pantsMaterial}
           </mesh>
        </group>

        {/* Torso */}
        <mesh ref={bodyRef} position={[0, 0.45, 0]} castShadow>
           <boxGeometry args={[0.34, 0.32, 0.18]} />
           {shirtMaterial}
        </mesh>

        {/* Arms */}
        <group position={[-0.21, 0.55, 0]}>
            <mesh ref={leftArmRef} position={[0, -0.15, 0]} castShadow>
               <boxGeometry args={[0.09, 0.34, 0.09]} />
               {shirtMaterial}
               <mesh position={[0, -0.2, 0]}>
                  <boxGeometry args={[0.09, 0.08, 0.09]} />
                  {skinMaterial}
               </mesh>
            </mesh>
        </group>
        <group position={[0.21, 0.55, 0]}>
            <mesh ref={rightArmRef} position={[0, -0.15, 0]} castShadow>
               <boxGeometry args={[0.09, 0.34, 0.09]} />
               {shirtMaterial}
                <mesh position={[0, -0.2, 0]}>
                  <boxGeometry args={[0.09, 0.08, 0.09]} />
                  {skinMaterial}
               </mesh>
            </mesh>
        </group>

        {/* Head */}
        <mesh ref={headRef} position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[0.24, 0.24, 0.24]} />
            {skinMaterial}
            
            {/* Hair */}
            <mesh position={[0, 0.08, -0.05]}>
                <boxGeometry args={[0.26, 0.12, 0.26]} />
                <meshStandardMaterial color="#5e4033" roughness={0.9} />
            </mesh>
            
            {/* Eyes */}
            {!blink && (
              <group position={[0, 0, 0.125]}>
                 <mesh position={[-0.06, 0.02, 0]}>
                    <planeGeometry args={[0.035, 0.035]} />
                    {eyeMaterial}
                 </mesh>
                 <mesh position={[0.06, 0.02, 0]}>
                    <planeGeometry args={[0.035, 0.035]} />
                    {eyeMaterial}
                 </mesh>
              </group>
            )}
        </mesh>
      </group>

      {/* Name Tag */}
      <Html position={[0, 1.4, 0]} center zIndexRange={[50, 0]} style={{pointerEvents: 'none'}}>
        <div className="whitespace-nowrap text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)] pixel-font tracking-wide opacity-90 px-1.5 py-0.5 rounded-sm bg-black/20 backdrop-blur-[2px]">
          {entity.username}
        </div>
      </Html>

      {/* Chat */}
      {currentMessage && (
        <Html position={[0, 2.0, 0]} center zIndexRange={[100, 0]} style={{pointerEvents: 'none'}}>
          <div className="relative transform -translate-y-2 animate-bounce-slight origin-bottom">
             <div className="bg-white border-2 border-black shadow-lg px-3 py-2 rounded-lg relative min-w-[80px] max-w-[200px]">
                <p className="text-[11px] text-black font-semibold text-center leading-tight pixel-font break-words">
                  {currentMessage}
                </p>
                <div className="absolute left-1/2 -ml-1.5 -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-black"></div>
                <div className="absolute left-1/2 -ml-[4px] -bottom-[5px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-white"></div>
             </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default Avatar;
