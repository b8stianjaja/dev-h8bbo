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
  const [isFocused, setIsFocused] = useState(false);
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
      setChatLog(prev => [...prev.slice(-19), newItem]); // Keep last 20
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
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between overflow-hidden font-sans">
      
      {/* --- TOP BAR --- */}
      <div className="flex justify-between items-start p-6 pointer-events-auto">
         {/* Room Badge */}
         <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-3 flex gap-3 shadow-lg animate-fade-in-down">
            <div className="w-10 h-10 bg-blue-900/50 rounded border border-blue-500/30 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
               </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-wide">Public Lounge</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(74,222,128,0.8)]"></div>
                 <span className="text-[10px] text-gray-400 font-mono">ONLINE</span>
              </div>
            </div>
         </div>

         {/* Toolbar */}
         <div className="flex flex-col gap-2 animate-fade-in-down delay-100">
            <button 
              onClick={() => onZoom(-5)}
              className="w-10 h-10 bg-black/60 backdrop-blur border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white"
            >
              <span className="text-xl font-bold">+</span>
            </button>
            <button 
              onClick={() => onZoom(5)}
              className="w-10 h-10 bg-black/60 backdrop-blur border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white"
            >
              <span className="text-xl font-bold">-</span>
            </button>
         </div>
      </div>

      {/* --- BOTTOM CONSOLE --- */}
      <div className="pointer-events-auto bg-black/80 backdrop-blur-lg border-t border-white/10 p-3 pb-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-fade-in-up">
        <div className="max-w-4xl mx-auto flex gap-4 items-end relative">
           
           {/* Chat History Popover */}
           {showHistory && (
             <div className="absolute bottom-16 left-0 w-80 h-64 bg-black/90 border border-white/10 rounded-lg p-3 overflow-y-auto mb-2 shadow-xl" ref={scrollRef}>
                {chatLog.length === 0 && <div className="text-gray-600 text-xs italic p-2">No chat history...</div>}
                {chatLog.map(item => (
                  <div key={item.id} className="mb-2 text-xs">
                    <span className="text-gray-500 font-mono">[{item.time}]</span>{' '}
                    <span className="font-bold text-white">{item.user}:</span>{' '}
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
             </div>
           )}

           {/* User Avatar Box */}
           <div className="hidden sm:flex flex-col items-center gap-1">
              <div 
                className="w-12 h-12 rounded-lg bg-gradient-to-b from-gray-700 to-gray-900 border border-white/20 flex items-center justify-center overflow-hidden"
              >
                 <div className="mt-4 transform scale-150">
                   {/* Simplified CSS Avatar Preview */}
                   <div className="w-4 h-4 bg-[#ffccaa] rounded-full mx-auto mb-[-2px] border border-black/20"></div>
                   <div className="w-6 h-5 rounded-t mx-auto" style={{ backgroundColor: userData.look.color }}></div>
                 </div>
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{userData.username}</span>
           </div>

           {/* Chat Input Area */}
           <div className="flex-1 bg-black/40 border border-white/10 rounded-md flex items-center p-1 focus-within:ring-1 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded hover:bg-white/10 transition-colors ${showHistory ? 'text-blue-400' : 'text-gray-500'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <form onSubmit={handleSubmit} className="flex-1">
                <input 
                  type="text" 
                  className="w-full bg-transparent border-none outline-none text-white text-sm px-2 font-medium placeholder-gray-600"
                  placeholder="Type here to chat..."
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </form>
              <div className={`px-2 text-[10px] font-bold transition-colors ${msg ? 'text-blue-400' : 'text-gray-700'}`}>
                SAY
              </div>
           </div>

           {/* Actions */}
           <div className="flex gap-2">
             {['Me', 'Nav', 'Shop'].map(label => (
               <button 
                key={label}
                className="px-4 py-3 bg-gradient-to-b from-gray-800 to-black border border-white/10 rounded text-xs font-bold text-gray-300 hover:text-white hover:border-white/30 transition-all active:transform active:scale-95 shadow-lg"
               >
                 {label}
               </button>
             ))}
           </div>

        </div>
      </div>
    </div>
  );
};

export default GameHUD;
