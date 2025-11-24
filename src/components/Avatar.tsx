import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils, MeshStandardMaterial, BoxGeometry, CircleGeometry } from 'three';
import { Entity } from '../types';
import { TILE_SIZE, TICK_RATE_MS } from '../constants';
import { Html } from '@react-three/drei';

// --- SHARED RESOURCES (Optimization) ---
// Define static resources outside component to share across all instances
const SKIN_MAT = new MeshStandardMaterial({ color: "#ffccaa", emissive: "#ffccaa", emissiveIntensity: 0.1 });
const PANTS_MAT = new MeshStandardMaterial({ color: "#1f2937" });
const SHADOW_GEO = new CircleGeometry(0.25, 16);
const SHADOW_MAT = new MeshStandardMaterial({ color: "black", transparent: true, opacity: 0.4 });

// Limb Geometries
const LEG_GEO = new BoxGeometry(0.12, 0.35, 0.12);
const BODY_GEO = new BoxGeometry(0.32, 0.30, 0.16);
const ARM_GEO = new BoxGeometry(0.08, 0.32, 0.08);
const HAND_GEO = new BoxGeometry(0.08, 0.08, 0.08);
const HEAD_GEO = new BoxGeometry(0.24, 0.24, 0.24);
const HAIR_GEO = new BoxGeometry(0.26, 0.12, 0.28);
const HAIR_MAT = new MeshStandardMaterial({ color: "#222", roughness: 0.2 });

interface AvatarProps {
  entity: Entity;
  currentMessage?: string;
}

const Avatar: React.FC<AvatarProps> = React.memo(({ entity, currentMessage }) => {
  const groupRef = useRef<Group>(null);
  
  const leftLegRef = useRef<any>(null);
  const rightLegRef = useRef<any>(null);
  const leftArmRef = useRef<any>(null);
  const rightArmRef = useRef<any>(null);
  
  const [blink, setBlink] = useState(false);
  
  // Custom shirt color per instance
  const shirtMaterial = useMemo(() => new MeshStandardMaterial({ 
    color: entity.color, 
    emissive: entity.color, 
    emissiveIntensity: 0.3 
  }), [entity.color]);

  useFrame(() => {
    if (!groupRef.current) return;

    // --- SMOOTH INTERPOLATION LOGIC ---
    const now = Date.now();
    const timeSinceMove = now - entity.lastMoveStart;
    
    const rawProgress = timeSinceMove / TICK_RATE_MS;
    const progress = Math.min(rawProgress, 1.0);
    const smoothProgress = entity.isWalking ? progress : 1; 

    const startX = entity.previousGridPosition.x * TILE_SIZE;
    const startZ = entity.previousGridPosition.y * TILE_SIZE;
    const endX = entity.nextGridPosition.x * TILE_SIZE;
    const endZ = entity.nextGridPosition.y * TILE_SIZE;

    const x = MathUtils.lerp(startX, endX, smoothProgress);
    const z = MathUtils.lerp(startZ, endZ, smoothProgress);
    
    const bounce = entity.isWalking ? Math.abs(Math.sin(smoothProgress * Math.PI)) * 0.15 : 0;
    const yOffset = entity.isSitting ? -0.25 : 0;
    
    groupRef.current.position.set(x, bounce + yOffset, z);

    // Rotation Logic
    const rotationMap: Record<number, number> = {
        0: Math.PI, 1: 3 * Math.PI / 4, 2: Math.PI / 2, 3: Math.PI / 4,
        4: 0, 5: -Math.PI / 4, 6: -Math.PI / 2, 7: -3 * Math.PI / 4
    };
    const targetRot = rotationMap[entity.rotation] ?? 0;
    let currentRot = groupRef.current.rotation.y;
    
    let diff = targetRot - currentRot;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    groupRef.current.rotation.y += diff * 0.2;

    // Animation Logic
    const walkCycle = timeSinceMove * 0.015;

    if (entity.isWalking) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.8;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.8;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(walkCycle) * 0.6;
    } else {
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
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} geometry={SHADOW_GEO} material={SHADOW_MAT} />

        <group position={[-0.1, 0.25, 0]}><mesh ref={leftLegRef} position={[0, -0.125, 0]} castShadow geometry={LEG_GEO} material={PANTS_MAT} /></group>
        <group position={[0.1, 0.25, 0]}><mesh ref={rightLegRef} position={[0, -0.125, 0]} castShadow geometry={LEG_GEO} material={PANTS_MAT} /></group>
        
        <mesh position={[0, 0.45, 0]} castShadow geometry={BODY_GEO} material={shirtMaterial} />
        
        <group position={[-0.2, 0.55, 0]}>
            <mesh ref={leftArmRef} position={[0, -0.15, 0]} castShadow geometry={ARM_GEO} material={shirtMaterial}>
                <mesh position={[0, -0.2, 0]} geometry={HAND_GEO} material={SKIN_MAT} />
            </mesh>
        </group>
        <group position={[0.2, 0.55, 0]}>
            <mesh ref={rightArmRef} position={[0, -0.15, 0]} castShadow geometry={ARM_GEO} material={shirtMaterial}>
                <mesh position={[0, -0.2, 0]} geometry={HAND_GEO} material={SKIN_MAT} />
            </mesh>
        </group>
        
        <mesh position={[0, 0.82, 0]} castShadow geometry={HEAD_GEO} material={SKIN_MAT}>
            {/* Hair */}
            <mesh position={[0, 0.08, -0.02]} geometry={HAIR_GEO} material={HAIR_MAT} />
            {/* Eyes */}
            {!blink && (
                <group position={[0, 0, 0.125]}>
                    <mesh position={[-0.06, 0.01, 0]}><planeGeometry args={[0.04, 0.04]} /><meshBasicMaterial color="black" /></mesh>
                    <mesh position={[0.06, 0.01, 0]}><planeGeometry args={[0.04, 0.04]} /><meshBasicMaterial color="black" /></mesh>
                </group>
            )}
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
             <div className="triangle-inner"></div>
          </div>
        </Html>
      )}
    </group>
  );
});

export default Avatar;