import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';

interface SideBarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function SideBar({ collapsed }: SideBarProps) {
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
          
          {/* アプリアイコン・ロゴ部分 */}
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
            {/* <span style={{ color: 'var(--owl-accent-blue)', fontSize: '1.5rem' }}>✦</span> */}
            Kimu
          </div>

          <Menu 
            menuItemStyles={{
              root: {
                padding: '0 12px', 
              },
              button: {
                borderRadius: '10px', 
                margin: '4px 0',
                padding: '10px 16px',
                fontSize: '0.95rem',
                fontWeight: '500',
                color: 'var(--owl-muted)', 
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(130, 170, 255, 0.1)', 
                  color: 'var(--owl-accent-blue)',
                  transform: 'translateX(4px)',
                },
              },
            }}
          >
            <MenuItem onClick={() => console.log('Key Viewer clicked')}>🔑 Key Viewer </MenuItem>
            <MenuItem onClick={() => console.log('Key Tags clicked')}>🏷️ Key Tags </MenuItem>
            <MenuItem onClick={() => console.log('Favorites clicked')}>📍 Favorites </MenuItem>

            <div style={{ 
              marginTop: '24px', 
              paddingTop: '16px', 
              borderTop: '1px solid var(--owl-border)' 
            }}>
              <MenuItem onClick={() => console.log('Settings clicked')}>⚙️ Settings </MenuItem>
            </div>
          </Menu>

        </div>
      </Sidebar>
    </div>
  );
}