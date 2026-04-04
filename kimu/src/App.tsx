import { useState, useEffect, useCallback } from "react";
import "./App.css";
import SideBar from "./Components/SideBar";
import KeyCard from "./Components/KeyCard";
import AddKeyModal from "./Components/AddKeyModal";
import Favorites from "./Favorites";
import KeyTags from "./KeyTags";
import Settings from "./Settings";
import { fetchSecrets, saveSecret, type KeyMeta } from "./lib/api";

type View = "home" | "favorites" | "tags" | "settings";

function App() {
  const [keys, setKeys] = useState<KeyMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<View>("home");
  const [searchQuery, setSearchQuery] = useState("");

  const loadSecrets = useCallback(async () => {
    try {
      setError(null);
      const secrets = await fetchSecrets();
      setKeys(secrets);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to load secrets:", message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSecrets();
  }, [loadSecrets]);

  const handleAddKey = async (name: string, value: string, tag: string, memo: string) => {
    await saveSecret(name, value, tag, memo);
    await loadSecrets();
  };

  const filteredKeys = keys.filter((secret) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      secret.name.toLowerCase().includes(q) ||
      secret.tag.toLowerCase().includes(q)
    );
  });

  const viewTitles: Record<View, string> = {
    home: "Key Viewer",
    favorites: "Favorites",
    tags: "Key Tags",
    settings: "Settings",
  };

  const renderView = (): React.ReactNode => {
    switch (activeView) {
      case "favorites":
        return <Favorites keys={keys} onRefresh={loadSecrets} />;
      case "tags":
        return <KeyTags keys={keys} onNavigate={setSearchQuery} onSwitchToHome={() => setActiveView("home")} />;
      case "settings":
        return <Settings />;
      default:
        return renderHomeView();
    }
  };

  const renderHomeView = (): React.ReactNode => (
    <>
      <div className="search-bar-container">
        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
          >
            {"\u2715"}
          </button>
        )}
      </div>

      {isLoading && (
        <div className="empty-state">Loading secrets...</div>
      )}

      {error && (
        <div className="empty-state" style={{ color: '#ef5350' }}>
          Failed to load secrets: {error}
        </div>
      )}

      {!isLoading && !error && filteredKeys.length === 0 && (
        <div className="empty-state">
          {keys.length === 0
            ? 'No secrets stored yet. Click "+ Add Key" to get started.'
            : `No secrets matching "${searchQuery}".`}
        </div>
      )}

      {!isLoading && !error && filteredKeys.length > 0 && (
        <div className="key-grid">
          {filteredKeys.map((secret) => (
            <KeyCard
              key={secret.name}
              name={secret.name}
              tag={secret.tag}
              memo={secret.memo}
              isFavorite={secret.is_favorite}
              onRefresh={loadSecrets}
            />
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="app-container">
      <SideBar
        collapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        activeView={activeView}
        onNavigate={setActiveView}
      />

      <main className="main-content">
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '2.5rem',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'inherit',
                lineHeight: '1'
              }}
              aria-label="Toggle Sidebar"
            >
              {isCollapsed ? '\u2630' : '\u2715'}
            </button>
            <h1 style={{ margin: 0 }}>{viewTitles[activeView]}</h1>
          </div>
          <div className="header-right">
            {activeView === "home" && (
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                + Add Key
              </button>
            )}
          </div>
        </header>

        {renderView()}

        <AddKeyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddKey}
        />
      </main>
    </div>
  );
}

export default App;
