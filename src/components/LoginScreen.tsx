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
    <div className="login-overlay">
      <div className="login-card">
        
        {/* Header */}
        <div className="login-header">
          <h1>MIDNIGHT <span>LOUNGE</span></h1>
          <p>Beta Client v0.9</p>
        </div>

        {/* Content */}
        <div className="login-body">
          {step === 1 ? (
            <form onSubmit={handleNext}>
              <div>
                <label>Identity</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter Username"
                  autoFocus
                />
                {error && <p style={{color: '#f87171', fontSize: '0.75rem', marginTop: '0.5rem'}}>{error}</p>}
              </div>

              <button type="submit" className="btn-primary">
                ENTER HOTEL
              </button>
              
              <div style={{textAlign: 'center', marginTop: '1rem'}}>
                 <p style={{color: '#6b7280', fontSize: '0.75rem', margin: 0}}>Don't have an account?</p>
                 <button type="button" style={{color: '#60a5fa', background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer'}}>Register for free</button>
              </div>
            </form>
          ) : (
            <div style={{animation: 'fadeInDown 0.6s ease-out'}}>
              <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
                 <h2 style={{fontWeight: 'bold', fontSize: '1.125rem'}}>Choose your Style</h2>
                 <p style={{color: '#9ca3af', fontSize: '0.75rem'}}>How will others see you?</p>
              </div>

              <div className="color-grid">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={selectedColor === c ? 'selected' : ''}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="avatar-preview">
                 {/* Mini Preview */}
                 <div style={{width: '2rem', height: '4rem', position: 'relative'}}>
                    <div style={{position: 'absolute', top: 0, width: '2rem', height: '2rem', borderRadius: '50%', background: '#ffccaa', zIndex: 20, border: '1px solid rgba(0,0,0,0.2)'}}></div>
                    <div style={{position: 'absolute', top: '1.75rem', left: '-0.25rem', width: '2.5rem', height: '2rem', borderRadius: '0.25rem', background: selectedColor, zIndex: 10}}></div>
                    <div style={{position: 'absolute', top: '3.5rem', left: 0, width: '0.75rem', height: '2rem', background: '#1f2937', borderBottomLeftRadius: '0.25rem'}}></div>
                    <div style={{position: 'absolute', top: '3.5rem', right: 0, width: '0.75rem', height: '2rem', background: '#1f2937', borderBottomRightRadius: '0.25rem'}}></div>
                 </div>
              </div>

              <button onClick={handleFinish} className="btn-action">
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