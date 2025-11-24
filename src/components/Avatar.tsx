import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import { Entity } from '../types';
import { TILE_SIZE } from '../constants';
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
  const headRef = useRef<any>(null);
  const bodyRef = useRef<any>(null);
  
  const [blink, setBlink] = useState(false);
  
  const skinMaterial = useMemo(() => <meshStandardMaterial color="#ffccaa" roughness={1} />, []);
  const shirtMaterial = useMemo(() => <meshStandardMaterial color={entity.color} />, [entity.color]);
  const pantsMaterial = useMemo(() => <meshStandardMaterial color="#303030" />, []);
  const eyeMaterial = useMemo(() => <meshBasicMaterial color="black" />, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Position
    const startX = entity.previousGridPosition.x * TILE_SIZE;
    const startZ = entity.previousGridPosition.y * TILE_SIZE;
    const endX = entity.nextGridPosition.x * TILE_SIZE;
    const endZ = entity.nextGridPosition.y * TILE_SIZE;

    const x = MathUtils.lerp(startX, endX, entity.moveProgress);
    const z = MathUtils.lerp(startZ, endZ, entity.moveProgress);
    const yOffset = entity.isSitting ? -0.15 : 0;
    
    groupRef.current.position.set(x, yOffset, z);

    // Rotation
    const rotationMap: Record<number, number> = {
        0: Math.PI, 1: 3 * Math.PI / 4, 2: Math.PI / 2, 3: Math.PI / 4,
        4: 0, 5: -Math.PI / 4, 6: -Math.PI / 2, 7: -3 * Math.PI / 4
    };
    const targetRot = rotationMap[entity.rotation] ?? 0;
    let currentRot = groupRef.current.rotation.y;
    let diff = targetRot - currentRot;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    groupRef.current.rotation.y += diff * 0.3;

    // Animation
    const time = state.clock.elapsedTime * 15;

    if (entity.isWalking) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time) * 0.8;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time + Math.PI) * 0.8;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time + Math.PI) * 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time) * 0.8;
      if (bodyRef.current) bodyRef.current.position.y = 0.45 + Math.abs(Math.sin(time)) * 0.04;
    } else {
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
        {!entity.isSitting && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <circleGeometry args={[0.3, 16]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.2} />
          </mesh>
        )}
        <group position={[-0.1, 0.25, 0]}><mesh ref={leftLegRef} position={[0, -0.125, 0]} castShadow><boxGeometry args={[0.13, 0.35, 0.13]} />{pantsMaterial}</mesh></group>
        <group position={[0.1, 0.25, 0]}><mesh ref={rightLegRef} position={[0, -0.125, 0]} castShadow><boxGeometry args={[0.13, 0.35, 0.13]} />{pantsMaterial}</mesh></group>
        <mesh ref={bodyRef} position={[0, 0.45, 0]} castShadow><boxGeometry args={[0.34, 0.32, 0.18]} />{shirtMaterial}</mesh>
        <group position={[-0.21, 0.55, 0]}><mesh ref={leftArmRef} position={[0, -0.15, 0]} castShadow><boxGeometry args={[0.09, 0.34, 0.09]} />{shirtMaterial}<mesh position={[0, -0.2, 0]}><boxGeometry args={[0.09, 0.08, 0.09]} />{skinMaterial}</mesh></mesh></group>
        <group position={[0.21, 0.55, 0]}><mesh ref={rightArmRef} position={[0, -0.15, 0]} castShadow><boxGeometry args={[0.09, 0.34, 0.09]} />{shirtMaterial}<mesh position={[0, -0.2, 0]}><boxGeometry args={[0.09, 0.08, 0.09]} />{skinMaterial}</mesh></mesh></group>
        <mesh ref={headRef} position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[0.24, 0.24, 0.24]} />{skinMaterial}
            <mesh position={[0, 0.08, -0.05]}><boxGeometry args={[0.26, 0.12, 0.26]} /><meshStandardMaterial color="#5e4033" roughness={0.9} /></mesh>
            {!blink && (<group position={[0, 0, 0.125]}><mesh position={[-0.06, 0.02, 0]}><planeGeometry args={[0.035, 0.035]} />{eyeMaterial}</mesh><mesh position={[0.06, 0.02, 0]}><planeGeometry args={[0.035, 0.035]} />{eyeMaterial}</mesh></group>)}
        </mesh>
      </group>

      <Html position={[0, 1.4, 0]} center zIndexRange={[50, 0]} style={{pointerEvents: 'none'}}>
        <div className="avatar-nametag">{entity.username}</div>
      </Html>

      {currentMessage && (
        <Html position={[0, 2.0, 0]} center zIndexRange={[100, 0]} style={{pointerEvents: 'none'}}>
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