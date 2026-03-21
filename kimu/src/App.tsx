import { useState } from "react";
import "./App.css";
import SideBar from "./Commponets/SideBar";
import KeyCard from "./Commponets/KeyCard";
import AddKeyModal from "./Commponets/AddKeyModal";

interface Key {
  id: string;
  name: string;
  value: string;
  tag?: string;
  memo?: string;
}

function App() {
  const [keys, setKeys] = useState<Key[]>([
    { id: '1', name: 'Example Key', value: 'my-secret-value-123', tag: 'Dev', memo: 'Example memo' },
    { id: '2', name: 'GitHub Token', value: 'ghp_xxxxxxxxxxxxxxxxxxxx', tag: 'Work' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleAddKey = (name: string, value: string, tag: string, memo: string) => {
    const newKey = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      value,
      tag,
      memo,
    };
    setKeys([...keys, newKey]);
  };

  return (
    <div className="app-container">
      <SideBar collapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      
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
              {isCollapsed ? '☰' : '✕'}
            </button>
            <h1 style={{ margin: 0 }}>Key Viewer</h1>
          </div>
          <div className="header-right">
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              + Add Key
            </button>
          </div>
        </header>

        <div className="key-grid">
          {keys.map((key) => (
            <KeyCard 
              key={key.id} 
              name={key.name} 
              value={key.value} 
              tag={key.tag}
              memo={key.memo}
            />
          ))}
        </div>

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
