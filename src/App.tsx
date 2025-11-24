import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Html } from '@react-three/drei';
// Removed SoftShadows for performance
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
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
  const joinedRef = useRef(false);

  useEffect(() => {
    if (phase === GamePhase.PLAYING && authData && !engine.myEntityId && !joinedRef.current) {
      joinedRef.current = true;
      const id = engine.joinRoom(authData);
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

  return (
    <>
      <color attach="background" args={[COLORS.BACKGROUND]} />

      <OrthographicCamera 
        makeDefault 
        position={[20, 24, 20]} 
        zoom={zoom} 
        near={-50} 
        far={200}
        onUpdate={c => c.lookAt(0, 0, 0)}
      />

      <ambientLight intensity={0.2} color="#4c1d95" />
      
      {/* Optimized Light: Reduced map size, removed SoftShadows */}
      <directionalLight 
        position={[-10, 20, 5]} 
        intensity={0.8} 
        color="#c084fc"
        castShadow 
        shadow-mapSize={[1024, 1024]} 
        shadow-bias={-0.0001}
      >
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
      </directionalLight>

      <directionalLight position={[10, 5, -10]} intensity={1.5} color="#38bdf8" />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ec4899" distance={30} />

      {/* Removed TiltShift for cleaner look and higher FPS */}
      <EffectComposer enableNormalPass={false} multisampling={0}>
        <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.0} radius={0.4} />
        <Noise opacity={0.04} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      <group position={[-GRID_SIZE/2, 0, -GRID_SIZE/2]}>
         <Room 
           collisionMap={engine.collisionMap} 
           furniture={engine.furniture}
           onTileClick={handleTileClick}
           onFurnitureClick={handleFurnitureClick}
           selection={selectedTile}
         />
         
         {/* Avatars are now memoized and lightweight */}
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
        gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }} 
        className={`game-canvas ${phase === GamePhase.LOGIN ? 'mode-login' : 'mode-playing'}`}
      >
        <GameScene phase={phase} authData={authData} onLogout={() => setPhase(GamePhase.LOGIN)} />
      </Canvas>
    </div>
  );
};

export default App;