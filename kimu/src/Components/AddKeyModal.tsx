import React, { useState, useEffect } from 'react';
import { fetchTags, addTag } from '../lib/api';

interface AddKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, value: string, tag: string, memo: string) => Promise<void>;
}

export default function AddKeyModal({ isOpen, onClose, onAdd }: AddKeyModalProps) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [tag, setTag] = useState('');
  const [memo, setMemo] = useState('');
  const [showValue, setShowValue] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchTags()
        .then(setAvailableTags)
        .catch((err) => console.error("Failed to load tags:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;

    setIsSaving(true);
    try {
      const trimmedTag = tag.trim();
      if (trimmedTag && !availableTags.includes(trimmedTag)) {
        await addTag(trimmedTag);
      }

      await onAdd(name, value, trimmedTag, memo);
      setName('');
      setValue('');
      setTag('');
      setMemo('');
      setShowValue(false);
      onClose();
    } catch {
      // Error is handled by the parent via alert
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '400px' }}>
        <div className="modal-header" style={{ marginBottom: '24px' }}>Add New Key</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="keyName">Key Name</label>
            <input
              id="keyName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. GitHub Token"
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="keyValue" style={{ margin: 0 }}>Key Value</label>
              <button
                type="button"
                onClick={() => setShowValue(!showValue)}
                style={{ fontSize: '0.8rem', padding: '2px 8px', color: 'var(--owl-accent-blue)' }}
                className="btn-ghost"
              >
                {showValue ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="keyValue"
              type={showValue ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Paste your key here"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="keyTag">Key Tag</label>
            <input
              id="keyTag"
              type="text"
              list="tagSuggestions"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Select or type a new tag..."
              autoComplete="off"
            />
            <datalist id="tagSuggestions">
              {availableTags.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label htmlFor="keyMemo">Memo</label>
            <textarea
              id="keyMemo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Additional notes..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--owl-border)',
                background: 'var(--owl-bg)',
                color: 'var(--owl-text)',
                fontFamily: 'inherit',
                minHeight: '80px',
                resize: 'none'
              }}
            />
          </div>

          <div className="modal-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Add Key"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
