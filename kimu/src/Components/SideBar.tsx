import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';

type View = "home" | "favorites" | "tags" | "settings";

interface SideBarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeView: View;
  onNavigate: (view: View) => void;
}

export default function SideBar({ collapsed, activeView, onNavigate }: SideBarProps) {
  const activeStyle = (view: View) => ({
    backgroundColor: activeView === view ? 'rgba(130, 170, 255, 0.15)' : undefined,
    color: activeView === view ? 'var(--owl-accent-blue)' : undefined,
  });

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: collapsed ? '0px' : '250px',
      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      flexShrink: 0,
      borderRight: collapsed ? 'none' : '1px solid var(--owl-border)',
      backgroundColor: 'var(--owl-bg)'
    }}>
      <Sidebar
        backgroundColor="transparent"
        collapsed={collapsed}
        collapsedWidth="0px"
        width="250px"
        rootStyles={{
          border: 'none',
          color: 'var(--owl-text)',
          height: '100%'
        }}
      >
        <div style={{
          opacity: collapsed ? 0 : 1,
          visibility: collapsed ? 'hidden' : 'visible',
          transition: 'opacity 0.3s ease-in-out',
          height: '100%',
          width: '250px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '32px 24px 24px',
            fontWeight: '800',
            fontSize: '1.75rem',
            color: 'var(--owl-text)',
            letterSpacing: '-0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            Kimu
          </div>

          <Menu
            menuItemStyles={{
              root: {
                padding: '0 12px',
              },
              button: ({ active }) => ({
                borderRadius: '10px',
                margin: '4px 0',
                padding: '10px 16px',
                fontSize: '0.95rem',
                fontWeight: active ? '600' : '500',
                color: active ? 'var(--owl-accent-blue)' : 'var(--owl-muted)',
                backgroundColor: active ? 'rgba(130, 170, 255, 0.12)' : undefined,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(130, 170, 255, 0.1)',
                  color: 'var(--owl-accent-blue)',
                  transform: 'translateX(4px)',
                },
              }),
            }}
          >
            <MenuItem
              active={activeView === 'home'}
              onClick={() => onNavigate('home')}
              style={activeStyle('home')}
            >
              {"\uD83D\uDD11"} Key Viewer
            </MenuItem>
            <MenuItem
              active={activeView === 'tags'}
              onClick={() => onNavigate('tags')}
              style={activeStyle('tags')}
            >
              {"\uD83C\uDFF7\uFE0F"} Key Tags
            </MenuItem>
            <MenuItem
              active={activeView === 'favorites'}
              onClick={() => onNavigate('favorites')}
              style={activeStyle('favorites')}
            >
              {"\uD83D\uDCCD"} Favorites
            </MenuItem>

            <div style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--owl-border)'
            }}>
              <MenuItem
                active={activeView === 'settings'}
                onClick={() => onNavigate('settings')}
                style={activeStyle('settings')}
              >
                {"\u2699\uFE0F"} Settings
              </MenuItem>
            </div>
          </Menu>
        </div>
      </Sidebar>
    </div>
  );
}
