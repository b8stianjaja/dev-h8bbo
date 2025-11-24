import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, SoftShadows, Html } from '@react-three/drei';
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

// Internal component that lives INSIDE the Canvas context
const GameScene: React.FC<GameSceneProps> = ({ phase, authData, onLogout }) => {
  const engine = useHabboEngine();
  const [selectedTile, setSelectedTile] = useState<GridPosition | null>(null);
  const [lastMsg, setLastMsg] = useState<{id: string, text: string} | null>(null);
  const [zoom, setZoom] = useState(38);

  // Join Room Effect
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

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(20, Math.min(60, prev + delta)));
  };

  return (
    <>
      {/* Cinematic Fog for Infinite Void effect */}
      <fog attach="fog" args={[COLORS.BACKGROUND, 30, 80]} />
      <color attach="background" args={[COLORS.BACKGROUND]} />

      {/* Isometric Camera Setup */}
      <OrthographicCamera 
        makeDefault 
        position={[20, 24, 20]} 
        zoom={zoom} 
        near={-50} 
        far={200}
        onUpdate={c => c.lookAt(0, 0, 0)}
      />

      {/* Lighting Setup */}
      <ambientLight intensity={0.4} color="#aaccff" />
      
      <directionalLight 
        position={[-15, 30, 10]} 
        intensity={0.8} 
        color="#ffecd1"
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001} 
        shadow-radius={4}
      >
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
      </directionalLight>

      <directionalLight position={[10, 5, -10]} intensity={0.3} color="#4a69bd" />

      <SoftShadows size={8} samples={16} focus={0.6} />

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

      {/* In-Game HUD via Html overlay inside Canvas */}
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
    // Fake loading delay
    setTimeout(() => {
      setPhase(GamePhase.PLAYING);
    }, 1500);
  };

  return (
    <div className="app-container">
      
      {/* Login Overlay - Only visible when not playing */}
      {phase !== GamePhase.PLAYING && (
        <div className={`login-transition-wrapper ${phase === GamePhase.LOADING ? 'fade-out' : ''}`}>
          <LoginScreen onLogin={handleLogin} />
        </div>
      )}

      {/* Loading Overlay */}
      {phase === GamePhase.LOADING && (
         <div className="loading-overlay">
            <div className="loading-text">
              ENTERING HOTEL...
            </div>
         </div>
      )}

      {/* Vignette Overlay */}
      <div className="vignette-overlay"></div>

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