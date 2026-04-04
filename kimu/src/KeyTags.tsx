import { useState, useEffect, useCallback } from "react";
import { fetchTags, addTag, removeTag } from "./lib/api";
import type { KeyMeta } from "./lib/api";

interface KeyTagsProps {
  keys: KeyMeta[];
  onNavigate: (query: string) => void;
  onSwitchToHome: () => void;
}

export default function KeyTags({ keys, onNavigate, onSwitchToHome }: KeyTagsProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const loadTags = useCallback(async () => {
    try {
      const result = await fetchTags();
      setTags(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to load tags:", message);
      alert(`Failed to load tags: ${message}`);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const countForTag = (tag: string): number =>
    keys.filter((k) => k.tag === tag).length;

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    setIsAdding(true);
    try {
      await addTag(trimmed);
      setNewTagName("");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to add tag: ${message}`);
      setIsAdding(false);
      return;
    }

    try {
      await loadTags();
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    const count = countForTag(tag);
    const msg = count > 0
      ? `Delete tag "${tag}"? ${count} secret(s) still use it.`
      : `Delete tag "${tag}"?`;

    if (!confirm(msg)) return;

    try {
      await removeTag(tag);
      await loadTags();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to remove tag: ${message}`);
    }
  };

  const handleTagClick = (tag: string) => {
    onNavigate(tag);
    onSwitchToHome();
  };

  return (
    <div>
      <form onSubmit={handleAddTag} className="tag-add-form">
        <input
          type="text"
          className="tag-add-input"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="New tag name..."
        />
        <button type="submit" className="btn-primary" disabled={isAdding || !newTagName.trim()}>
          {isAdding ? "Adding..." : "+ Add Tag"}
        </button>
      </form>

      {tags.length === 0 && (
        <div className="empty-state">
          No tags yet. Create one above to get started.
        </div>
      )}

      {tags.length > 0 && (
        <div className="tags-grid">
          {tags.map((tag) => {
            const count = countForTag(tag);
            return (
              <div key={tag} className="tag-card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <button
                    type="button"
                    className="tag-card-name-btn"
                    onClick={() => handleTagClick(tag)}
                    title={`Filter secrets by "${tag}"`}
                  >
                    {tag}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      flexShrink: 0,
                    }}
                    title="Delete tag"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef5350" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
                <span className="tag-card-count">
                  {count} {count === 1 ? "secret" : "secrets"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
