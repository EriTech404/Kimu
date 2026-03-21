import React, { useState } from 'react';

interface AddKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, value: string, tag: string, memo: string) => void;
}

export default function AddKeyModal({ isOpen, onClose, onAdd }: AddKeyModalProps) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [tag, setTag] = useState('');
  const [memo, setMemo] = useState('');
  const [showValue, setShowValue] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && value) {
      onAdd(name, value, tag, memo);
      // Reset form
      setName('');
      setValue('');
      setTag('');
      setMemo('');
      setShowValue(false);
      onClose();
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
                style={{ fontSize: '0.8rem', padding: '2px 8px', color: 'var(--ios-blue)' }}
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
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. Work, Personal, Dev"
            />
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
                border: '1px solid var(--ios-border)',
                background: 'var(--ios-card-bg)',
                color: 'var(--ios-text)',
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
            <button type="submit" className="btn-primary">
              Add Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
