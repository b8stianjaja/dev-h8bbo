import React, { useState, useEffect } from 'react';
import {UJ Canvas } from '@react-three/fiber';
import { OrthographicCamera, SoftShadows, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, TiltShift2 } from '@react-three/postprocessing';
import Room from './components/Room';
import Avatar from './components/Avatar';
import GameHUD from './components/Interface';
import LoginScreen from './components/LoginScreen';
import { GRID_SIZE, COLORS } from './constants';
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
  const [zoom, setZoom] = useState(38);

  useEffect(() => {
    if (phase === GamePhase.PLAYING && authData && !engine.myEntityId) {
      engine.joinRoom(authData);
    }
  }, [phase, authData]);

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

  return (
    <>
      <color attach="background" args={[COLORS.BACKGROUND]} />

      {/* Isometric Camera */}
      <OrthographicCamera 
        makeDefault 
        position={[20, 24, 20]} 
        zoom={zoom} 
        near={-50} 
        far={200}
        onUpdate={c => c.lookAt(0, 0, 0)}
      />

      {/* Neon Atmospheric Lighting */}
      <ambientLight intensity={0.2} color="#4c1d95" />
      
      {/* Main Key Light (Warm) */}
      <directionalLight 
        position={[-10, 20, 5]} 
        intensity={0.8} 
        color="#c084fc"
        castShadow 
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
      </directionalLight>

      {/* Rim Light (Cold) */}
      <directionalLight position={[10, 5, -10]} intensity={1.5} color="#38bdf8" />
      
      {/* Fill Light (Pink) */}
      <pointLight position={[10, 10, 10]} intensity={1} color="#ec4899" distance={30} />

      <SoftShadows size={8} samples={16} focus={0.4} />

      {/* Post Processing for the "Alive" look */}
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.4} mipmapBlur intensity={1.2} radius={0.5} />
        <Noise opacity={0.04} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <TiltShift2 blur={0.1} />
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
           <GameHUD onChat={handleChat} userData={authData} onZoom={z => setZoom(p => Math.max(20, Math.min(60, p + z)))} />
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
            <div className="loading-text">CONNECTING NEONVERSE...</div>
         </div>
      )}

      <Canvas 
        shadows 
        dpr={[1, 1.5]} 
        gl={{ antialias: false, stencil: true }} 
        className={`game-canvas ${phase === GamePhase.LOGIN ? 'mode-login' : 'mode-playing'}`}
      >
        <GameScene phase={phase} authData={authData} onLogout={() => setPhase(GamePhase.LOGIN)} />
      </Canvas>
    </div>
  );
};

export default App;