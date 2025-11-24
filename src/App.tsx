import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Html, CameraControls, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, TiltShift2 } from '@react-three/postprocessing';
import * as THREE from 'three';
import Room from './components/Room';
import Avatar from './components/Avatar';
import GameHUD from './components/Interface';
import LoginScreen from './components/LoginScreen';
import { GRID_SIZE } from './constants';
import { useHabboEngine } from './hooks/useHabboEngine';
import { GridPosition, AuthData, GamePhase } from './types';

interface GameSceneProps {
  phase: GamePhase;
  authData: AuthData | null;
  onLogout: () => void;
}

const GameScene: React.FC<GameSceneProps> = ({ phase, authData, onLogout }) => {
  const engine = useHabboEngine();
  const [selectedTile, setSelectedTile] = useState<GridPosition | null>(null);
  const [lastMsg, setLastMsg] = useState<{id: string, text: string} | null>(null);
  const joinedRef = useRef(false);
  const cameraRef = useRef<CameraControls>(null);

  // Initial Join Logic
  useEffect(() => {
    if (phase === GamePhase.PLAYING && authData && !engine.myEntityId && !joinedRef.current) {
      joinedRef.current = true;
      const id = engine.joinRoom(authData);
      
      // Cinematic entrance: Start zoomed out, then zoom in
      if (cameraRef.current) {
        // Force the camera to the "perfect" isometric angle immediately
        cameraRef.current.setLookAt(20, 20, 20, 0, 0, 0, false);
        // Smooth zoom transition
        cameraRef.current.dollyTo(40, true); 
      }

      setTimeout(() => {
         engine.moveEntity(id, { x: 10, y: 8 });
      }, 800);
    }
  }, [phase, authData, engine]);

  const handleTileClick = (pos: GridPosition) => {
    setSelectedTile(pos);
    if (engine.myEntityId) {
      engine.moveEntity(engine.myEntityId, pos);
    }
  };

  const handleFurnitureClick = (id: string) => {
     engine.interactFurniture(id);
  };

  const handleChat = (msg: string) => {
    setLastMsg({ id: engine.myEntityId || 'unknown', text: msg });
    setTimeout(() => setLastMsg(null), 5000);
  };

  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      cameraRef.current.zoom(delta * 0.01, true); 
    }
  };

  return (
    <>
      {/* CAMERA SETUP 
        - Polar Locked: Users cannot tilt up/down (ruins isometric view).
        - Azimuth Limited: Users can peek left/right but not spin 360 (keeps walls valid).
      */}
      <OrthographicCamera 
        makeDefault 
        position={[20, 20, 20]} 
        zoom={30} 
        near={-50} 
        far={200}
      />

      <CameraControls 
        ref={cameraRef} 
        makeDefault
        minZoom={20} 
        maxZoom={80}
        // LOCK VERTICAL AXIS (Polar Angle)
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 3} 
        // LIMIT ROTATION (Azimuth)
        minAzimuthAngle={Math.PI / 4 - 0.5} // Allow slight rotation left
        maxAzimuthAngle={Math.PI / 4 + 0.5} // Allow slight rotation right
        azimuthRotateSpeed={0.5} // Slower, heavier rotation
        dollySpeed={0.5}
        dampingFactor={0.1} // Smooth dampening
      />

      {/* --- LIGHTING & ATMOSPHERE --- */}
      
      {/* Environment for realistic reflections */}
      <Environment preset="apartment" blur={0.8} background={false} />

      {/* Key Light (Warm Sun) */}
      <directionalLight 
        position={[-10, 25, 10]} 
        intensity={1.5} 
        color="#fffbeb" // Warm white
        castShadow 
        shadow-mapSize={[2048, 2048]} 
        shadow-bias={-0.0001}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Fill Light (Cool Shadows) */}
      <ambientLight intensity={0.6} color="#e0f2fe" />

      {/* Contact Shadows: The "Grounding" Effect */}
      <ContactShadows 
        position={[0, 0.01, 0]} 
        opacity={0.35} 
        scale={50} 
        blur={2.5} 
        far={2} 
        resolution={512} 
        color="#1e293b" 
      />

      {/* --- POST PROCESSING --- */}
      <EffectComposer enableNormalPass={false} multisampling={0}>
        <Bloom luminanceThreshold={1.1} mipmapBlur intensity={0.4} radius={0.5} />
        {/* TiltShift adjusted for a "Dollhouse" miniature look */}
        <TiltShift2 blur={0.1} /> 
        <Vignette eskil={false} offset={0.05} darkness={0.3} />
      </EffectComposer>

      <group position={[-GRID_SIZE/2, 0, -GRID_SIZE/2]}>
         <Room 
           collisionMap={engine.collisionMap} 
           furniture={engine.furniture}
           onTileClick={handleTileClick}
           onFurnitureClick={handleFurnitureClick}
           selection={selectedTile}
         />
         
         {engine.entities.map(ent => (
           <Avatar 
             key={ent.id} 
             entity={ent} 
             currentMessage={lastMsg?.id === ent.id ? lastMsg.text : undefined} 
           />
         ))}
      </group>

      {phase === GamePhase.PLAYING && authData && (
        <Html fullscreen style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
           <GameHUD onChat={handleChat} userData={authData} onZoom={handleZoom} />
        </Html>
      )}
    </>
  );
};

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.LOGIN);
  const [authData, setAuthData] = useState<AuthData | null>(null);

  const handleLogin = (data: AuthData) => {
    setAuthData(data);
    setPhase(GamePhase.LOADING);
    setTimeout(() => {
      setPhase(GamePhase.PLAYING);
    }, 1500);
  };

  return (
    <div className="app-container">
      {phase !== GamePhase.PLAYING && (
        <div className={`login-transition-wrapper ${phase === GamePhase.LOADING ? 'fade-out' : ''}`}>
          <LoginScreen onLogin={handleLogin} />
        </div>
      )}

      {phase === GamePhase.LOADING && (
         <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">CONNECTING...</div>
         </div>
      )}

      <style>{`
        .loading-spinner {
          width: 40px; height: 40px; 
          border: 4px solid #e2e8f0; border-top-color: #3b82f6; 
          border-radius: 50%; animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Canvas 
        shadows 
        dpr={[1, 1.5]} 
        // Tone mapping for better colors
        gl={{ antialias: true, stencil: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} 
        className="game-canvas"
      >
        <GameScene phase={phase} authData={authData} onLogout={() => setPhase(GamePhase.LOGIN)} />
      </Canvas>
    </div>
  );
};

export default App;