import React, { useState } from 'react';
import { AuthData } from '../types';

interface LoginScreenProps {
  onLogin: (data: AuthData) => void;
}

const AVATAR_COLORS = [
  '#e74c3c', '#3498db', '#9b59b6', '#2ecc71', '#f1c40f', '#e67e22', '#ecf0f1', '#34495e'
];

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[1]);
  const [error, setError] = useState('');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFinish = () => {
    onLogin({
      username,
      look: { color: selectedColor }
    });
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-auto">
      <div className="w-[380px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="h-32 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <h1 className="text-3xl font-black text-white tracking-tighter z-10 drop-shadow-lg">
            MIDNIGHT <span className="text-blue-400">LOUNGE</span>
          </h1>
          <p className="text-xs text-blue-200 uppercase tracking-widest mt-1 z-10 font-bold">Beta Client v0.9</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleNext} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider ml-1">Identity</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter Username"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors mt-1 font-medium"
                  autoFocus
                />
                {error && <p className="text-red-400 text-xs mt-2 font-medium">{error}</p>}
              </div>

              <button 
                type="submit"
                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-4"
              >
                ENTER HOTEL
              </button>
              
              <div className="text-center mt-4">
                 <p className="text-gray-500 text-xs">Don't have an account?</p>
                 <button type="button" className="text-blue-400 text-xs font-bold hover:underline">Register for free</button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-6 animate-fade-in-down">
              <div className="text-center">
                 <h2 className="text-white font-bold text-lg">Choose your Style</h2>
                 <p className="text-gray-400 text-xs">How will others see you?</p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`
                      w-12 h-12 rounded-full border-2 transition-all transform hover:scale-110
                      ${selectedColor === c ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-transparent opacity-60 hover:opacity-100'}
                    `}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="bg-black/40 rounded-lg p-4 flex items-center justify-center h-24 border border-white/5 relative">
                 {/* Mini Preview */}
                 <div className="w-8 h-16 relative">
                    <div className="absolute top-0 w-8 h-8 rounded-full bg-[#ffccaa] z-20 border border-black/20"></div> {/* Head */}
                    <div className="absolute top-7 w-10 -left-1 h-8 rounded bg-current z-10" style={{ color: selectedColor }}></div> {/* Body */}
                    <div className="absolute top-14 w-3 left-0 h-8 bg-gray-800 rounded-b"></div> {/* Leg */}
                    <div className="absolute top-14 w-3 right-0 h-8 bg-gray-800 rounded-b"></div> {/* Leg */}
                 </div>
              </div>

              <button 
                onClick={handleFinish}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50"
              >
                START PLAYING
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
