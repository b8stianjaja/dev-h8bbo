import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import { Entity } from '../types';
import { TILE_SIZE, TICK_RATE_MS } from '../constants';
import { Html } from '@react-three/drei';

interface AvatarProps {
  entity: Entity;
  currentMessage?: string;
}

const Avatar: React.FC<AvatarProps> = ({ entity, currentMessage }) => {
  const groupRef = useRef<Group>(null);
  
  const leftLegRef = useRef<any>(null);
  const rightLegRef = useRef<any>(null);
  const leftArmRef = useRef<any>(null);
  const rightArmRef = useRef<any>(null);
  const bodyRef = useRef<any>(null);
  
  const [blink, setBlink] = useState(false);
  
  // Neon Materials
  const skinMaterial = useMemo(() => <meshStandardMaterial color="#ffccaa" emissive="#ffccaa" emissiveIntensity={0.1} />, []);
  const shirtMaterial = useMemo(() => <meshStandardMaterial color={entity.color} emissive={entity.color} emissiveIntensity={0.3} />, [entity.color]);
  const pantsMaterial = useMemo(() => <meshStandardMaterial color="#1f2937" />, []);

  useFrame(() => {
    if (!groupRef.current) return;

    // --- SMOOTH INTERPOLATION LOGIC ---
    // We calculate "how far along are we in the current 480ms tick?"
    const now = Date.now();
    const timeSinceMove = now - entity.lastMoveStart;
    
    // Progress 0.0 to 1.0
    let progress = Math.min(timeSinceMove / TICK_RATE_MS, 1.0);
    
    // Use progress only if walking, otherwise snap to target
    const smoothProgress = entity.isWalking ? progress : 1; 

    const startX = entity.previousGridPosition.x * TILE_SIZE;
    const startZ = entity.previousGridPosition.y * TILE_SIZE;
    const endX = entity.nextGridPosition.x * TILE_SIZE;
    const endZ = entity.nextGridPosition.y * TILE_SIZE;

    const x = MathUtils.lerp(startX, endX, smoothProgress);
    const z = MathUtils.lerp(startZ, endZ, smoothProgress);
    
    // Add a slight bounce when walking
    const bounce = entity.isWalking ? Math.abs(Math.sin(smoothProgress * Math.PI)) * 0.15 : 0;
    const yOffset = entity.isSitting ? -0.25 : 0;
    
    groupRef.current.position.set(x, bounce + yOffset, z);

    // --- ROTATION ---
    const rotationMap: Record<number, number> = {
        0: Math.PI, 1: 3 * Math.PI / 4, 2: Math.PI / 2, 3: Math.PI / 4,
        4: 0, 5: -Math.PI / 4, 6: -Math.PI / 2, 7: -3 * Math.PI / 4
    };
    const targetRot = rotationMap[entity.rotation] ?? 0;
    let currentRot = groupRef.current.rotation.y;
    
    // Shortest path rotation
    let diff = targetRot - currentRot;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    // Smoothly rotate
    groupRef.current.rotation.y += diff * 0.2;

    // --- LIMB ANIMATION ---
    const walkCycle = timeSinceMove * 0.015;

    if (entity.isWalking) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.8;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.8;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(walkCycle) * 0.6;
    } else {
      // Reset limbs
      const legRot = entity.isSitting ? -Math.PI/2 : 0;
      if (leftLegRef.current) leftLegRef.current.rotation.x = MathUtils.lerp(leftLegRef.current.rotation.x, legRot, 0.1);
      if (rightLegRef.current) rightLegRef.current.rotation.x = MathUtils.lerp(rightLegRef.current.rotation.x, legRot, 0.1);
      if (leftArmRef.current) leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.1);
      if (rightArmRef.current) rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.1);
    }
  });

  useEffect(() => {
    const blinkLoop = setInterval(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
    }, Math.random() * 3000 + 2000);
    return () => clearInterval(blinkLoop);
  }, []);

  return (
    <group> 
      <group ref={groupRef}>
        {/* Simple Shadow Blob */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}ZF position={[0, 0.02, 0]}>
            <circleGeometry args={[0.25, 16]} />
            <meshBasicMaterial color="black" transparent opacity={0.4} />
        </mesh>

        <group position={[-0.1, 0.25, 0]}><mesh ref={leftLegRef} position={[0, -0.125, 0]} castShadow><boxGeometry args={[0.12, 0.35, 0.12]} />{pantsMaterial}</mesh></group>
        <group position={[0.1, 0.25, 0]}><mesh ref={rightLegRef} position={[0, -0.125, 0]} castShadow><boxGeometry args={[0.12, 0.35, 0.12]} />{pantsMaterial}</mesh></group>
        <mesh ref={bodyRef} position={[0, 0.45, 0]} castShadow><boxGeometry args={[0.32, 0.30, 0.16]} />{shirtMaterial}</mesh>
        <group position={[-0.2, 0.55, 0]}><mesh ref={leftArmRef} position={[0, -0.15, 0]} castShadow><boxGeometry args={[0.08, 0.32, 0.08]} />{shirtMaterial}<mesh position={[0, -0.2, 0]}><boxGeometry args={[0.08, 0.08, 0.08]} />{skinMaterial}</mesh></mesh></group>
        <group position={[0.2, 0.55, 0]}><mesh ref={rightArmRef} position={[0, -0.15, 0]} castShadow><boxGeometry args={[0.08, 0.32, 0.08]} />{shirtMaterial}<mesh position={[0, -0.2, 0]}><boxGeometry args={[0.08, 0.08, 0.08]} />{skinMaterial}</mesh></mesh></group>
        <mesh position={[0, 0.82, 0]} castShadow>
            <boxGeometry args={[0.24, 0.24, 0.24]} />{skinMaterial}
            {/* Cool Hair */}
            <mesh position={[0, 0.08, -0.02]}><boxGeometry args={[0.26, 0.12, 0.28]} /><meshStandardMaterial color="#222" roughness={0.2} /></mesh>
            {!blink && (<group position={[0, 0, 0.125]}><mesh position={[-0.06, 0.01, 0]}><planeGeometry args={[0.04, 0.04]} /><meshBasicMaterial color="black" /></mesh><mesh position={[0.06, 0.01, 0]}><planeGeometry args={[0.04, 0.04]} /><meshBasicMaterial color="black" /></mesh></group>)}
        </mesh>
      </group>

      <Html position={[0, 1.8, 0]} center zIndexRange={[50, 0]} style={{pointerEvents: 'none'}}>
        <div className="avatar-nametag">{entity.username}</div>
      </Html>

      {currentMessage && (
        <Html position={[0, 2.2, 0]} center zIndexRange={[100, 0]} style={{pointerEvents: 'none'}}>
          <div className="avatar-chat-bubble">
             <div className="bubble-content">
                <p>{currentMessage}</p>
             </div>
             <div className="triangle-outer"></div>
             <div className="triangle-inner"></div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default Avatar;