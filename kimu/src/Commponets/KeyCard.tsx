import { useState } from 'react';

interface KeyCardProps {
  name: string;
  value: string;
  tag?: string;
  memo?: string;
}

export default function KeyCard({ name, value, tag, memo }: KeyCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [hostPassword, setHostPassword] = useState('');

  const handleRevealClick = () => {
    if (isRevealed) {
      setIsRevealed(false);
    } else {
      setShowPasswordPrompt(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hostPassword === 'password') {
      setIsRevealed(true);
      setShowPasswordPrompt(false);
      setHostPassword('');
    } else {
      alert('Incorrect host password');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="key-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="key-card-header">{name}</div>
        {tag && (
          <span style={{ 
            fontSize: '0.7rem', 
            background: 'var(--eclipse-accent)', 
            color: 'var(--eclipse-text-dark)', 
            padding: '2px 8px', 
            borderRadius: '10px',
            fontWeight: '700'
          }}>
            {tag}
          </span>
        )}
      </div>

      <div className="key-value-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={isRevealed ? "" : "key-value-masked"} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {isRevealed ? value : "••••••••••••••••"}
        </span>
        <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
          <button 
            onClick={handleRevealClick}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
            title={isRevealed ? "Hide" : "Show"}
          >
            {isRevealed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--eclipse-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--eclipse-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            )}
          </button>
          <button 
            onClick={copyToClipboard}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
            title="Copy"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--eclipse-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>
      </div>

      {memo && (
        <div style={{ fontSize: '0.85rem', color: 'var(--eclipse-light)', marginTop: '4px', fontStyle: 'italic' }}>
          {memo}
        </div>
      )}

      {showPasswordPrompt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">Enter Host Password</div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <input
                  type="password"
                  value={hostPassword}
                  onChange={(e) => setHostPassword(e.target.value)}
                  placeholder="Host Password"
                  autoFocus
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--eclipse-muted)', background: 'var(--eclipse-deep)', color: 'var(--eclipse-text)' }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowPasswordPrompt(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
