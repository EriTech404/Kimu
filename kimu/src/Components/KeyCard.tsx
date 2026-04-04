import { useState } from 'react';
import { revealSecret, deleteSecret, updateSecretMeta } from '../lib/api';

interface KeyCardProps {
  name: string;
  tag?: string;
  memo?: string;
  isFavorite: boolean;
  onRefresh: () => void;
}

export default function KeyCard({ name, tag, memo, isFavorite, onRefresh }: KeyCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedValue, setRevealedValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRevealClick = async () => {
    if (isRevealed) {
      setIsRevealed(false);
      setRevealedValue('');
      return;
    }

    setIsLoading(true);
    try {
      const value = await revealSecret(name);
      setRevealedValue(value);
      setIsRevealed(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to reveal secret:", message);
      alert(`Failed to reveal secret: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      const value = isRevealed ? revealedValue : await revealSecret(name);
      await navigator.clipboard.writeText(value);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to copy secret:", message);
      alert(`Failed to copy: ${message}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteSecret(name);
      onRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to delete secret:", message);
      alert(`Failed to delete: ${message}`);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await updateSecretMeta(name, { is_favorite: !isFavorite });
      onRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to update favorite:", message);
      alert(`Failed to update favorite: ${message}`);
    }
  };

  return (
    <div className="key-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleToggleFavorite}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
              fontSize: '1.1rem',
              lineHeight: '1',
              filter: isFavorite ? 'none' : 'grayscale(1) opacity(0.4)',
              transition: 'filter 0.2s',
            }}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {"\u2B50"}
          </button>
          <div className="key-card-header">{name}</div>
        </div>
        {tag && (
          <span style={{
            fontSize: '0.7rem',
            background: 'var(--owl-accent-cyan)',
            color: 'var(--owl-bg)',
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: '700',
            flexShrink: 0,
          }}>
            {tag}
          </span>
        )}
      </div>

      <div className="key-value-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          className={isRevealed ? "" : "key-value-masked"}
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}
        >
          {isLoading ? "Loading..." : isRevealed ? revealedValue : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
        </span>
        <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
          <button
            onClick={handleRevealClick}
            disabled={isLoading}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
            title={isRevealed ? "Hide" : "Show"}
          >
            {isRevealed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--owl-accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--owl-accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            )}
          </button>
          <button
            onClick={handleCopy}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
            title="Copy"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--owl-accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
          <button
            onClick={handleDelete}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef5350" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>

      {memo && (
        <div style={{ fontSize: '0.85rem', color: 'var(--owl-muted)', marginTop: '4px', fontStyle: 'italic' }}>
          {memo}
        </div>
      )}
    </div>
  );
}
