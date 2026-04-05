import React, { useState, useEffect } from 'react';
import {
  revealSecret,
  updateSecretValue,
  updateSecretMeta,
  fetchTags,
  addTag,
} from '../lib/api';

interface EditKeyModalProps {
  isOpen: boolean;
  name: string;
  currentTag: string;
  currentMemo: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditKeyModal({
  isOpen,
  name,
  currentTag,
  currentMemo,
  onClose,
  onSaved,
}: EditKeyModalProps) {
  const [value, setValue] = useState('');
  const [tag, setTag] = useState('');
  const [memo, setMemo] = useState('');
  const [showValue, setShowValue] = useState(false);
  const [isLoadingValue, setIsLoadingValue] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    setTag(currentTag);
    setMemo(currentMemo);
    setShowValue(false);

    setIsLoadingValue(true);
    revealSecret(name)
      .then((v) => setValue(v))
      .catch((err) => {
        console.error("Failed to load secret value:", err);
        alert(`Failed to load secret value: ${err}`);
        onClose();
      })
      .finally(() => setIsLoadingValue(false));

    fetchTags()
      .then(setAvailableTags)
      .catch((err) => console.error("Failed to load tags:", err));
  }, [isOpen, name, currentTag, currentMemo, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;

    setIsSaving(true);
    try {
      const trimmedTag = tag.trim();

      if (trimmedTag && !availableTags.includes(trimmedTag)) {
        await addTag(trimmedTag);
      }

      await updateSecretValue(name, value);
      await updateSecretMeta(name, { tag: trimmedTag, memo, is_favorite: undefined });

      onSaved();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to update secret: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '400px' }}>
        <div className="modal-header" style={{ marginBottom: '24px' }}>Edit Secret</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="editKeyName">Key Name</label>
            <input
              id="editKeyName"
              type="text"
              value={name}
              disabled
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="editKeyValue" style={{ margin: 0 }}>Key Value</label>
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
              id="editKeyValue"
              type={showValue ? "text" : "password"}
              value={isLoadingValue ? "" : value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={isLoadingValue ? "Loading..." : "Enter new value"}
              disabled={isLoadingValue}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="editKeyTag">Key Tag</label>
            <input
              id="editKeyTag"
              type="text"
              list="editTagSuggestions"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Select, type, or leave empty to remove"
              autoComplete="off"
            />
            <datalist id="editTagSuggestions">
              {availableTags.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label htmlFor="editKeyMemo">Memo</label>
            <textarea
              id="editKeyMemo"
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
            <button type="submit" className="btn-primary" disabled={isSaving || isLoadingValue}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
