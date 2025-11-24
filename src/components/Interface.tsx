import React, { useState, useEffect, useRef } from 'react';
import { AuthData } from '../types';

interface GameHUDProps {
  onChat: (msg: string) => void;
  userData: AuthData;
  onZoom: (delta: number) => void;
}

interface ChatLogItem {
  id: number;
  user: string;
  text: string;
  time: string;
}

const GameHUD: React.FC<GameHUDProps> = ({ onChat, userData, onZoom }) => {
  const [msg, setMsg] = useState('');
  const [chatLog, setChatLog] = useState<ChatLogItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (msg.trim()) {
      const newItem = {
        id: Date.now(),
        user: userData.username,
        text: msg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatLog(prev => [...prev.slice(-19), newItem]);
      onChat(msg);
      setMsg('');
    }
  };

  useEffect(() => {
    if (showHistory && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog, showHistory]);

  return (
    <div className="game-hud">
      
      {/* --- TOP BAR --- */}
      <div className="top-bar">
         {/* Room Badge */}
         <div className="room-badge">
            <div className="icon-box">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
               </svg>
            </div>
            <div className="info">
              <h1>Public Lounge</h1>
              <div className="status">
                 <div className="dot"></div>
                 <span>ONLINE</span>
              </div>
            </div>
         </div>

         {/* Toolbar */}
         <div className="toolbar">
            <button onClick={() => onZoom(-5)}>+</button>
            <button onClick={() => onZoom(5)}>-</button>
         </div>
      </div>

      {/* --- BOTTOM CONSOLE --- */}
      <div className="bottom-console">
        <div className="console-inner">
           
           {/* Chat History Popover */}
           {showHistory && (
             <div className="chat-history-popover" ref={scrollRef}>
                {chatLog.length === 0 && <div style={{color: '#4b5563', fontStyle: 'italic', padding: '0.5rem'}}>No chat history...</div>}
                {chatLog.map(item => (
                  <div key={item.id} className="chat-msg">
                    <span className="time">[{item.time}]</span>{' '}
                    <span className="user">{item.user}:</span>{' '}
                    <span className="text">{item.text}</span>
                  </div>
                ))}
             </div>
           )}

           {/* User Avatar Box */}
           <div className="avatar-face">
              <div className="face-box">
                 <div style={{transform: 'scale(1.5)', marginTop: '1rem'}}>
                   <div style={{width: '1rem', height: '1rem', background: '#ffccaa', borderRadius: '50%', margin: '0 auto -2px auto', border: '1px solid rgba(0,0,0,0.2)'}}></div>
                   <div style={{width: '1.5rem', height: '1.25rem', borderRadius: '4px 4px 0 0', margin: '0 auto', backgroundColor: userData.look.color}}></div>
                 </div>
              </div>
              <span>{userData.username}</span>
           </div>

           {/* Chat Input Area */}
           <div className="chat-bar">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`history-btn ${showHistory ? 'active' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <form onSubmit={handleSubmit} style={{flex: 1}}>
                <input 
                  type="text" 
                  placeholder="Type here to chat..."
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                />
              </form>
              <div className={`label ${msg ? 'typing' : ''}`}>
                SAY
              </div>
           </div>

           {/* Actions */}
           <div className="action-buttons">
             {['Me', 'Nav', 'Shop'].map(label => (
               <button key={label}>{label}</button>
             ))}
           </div>

        </div>
      </div>
    </div>
  );
};

export default GameHUD;