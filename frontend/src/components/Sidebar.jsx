import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, LogOut, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './UI';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: '220px', flexShrink: 0,
      background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '10px',
            background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>
            TaskFlow
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', padding: '8px 10px 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Menu
        </div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: 'var(--radius-sm)',
            fontSize: '14px', fontWeight: 500,
            color: isActive ? 'var(--accent)' : 'var(--text2)',
            background: isActive ? 'var(--accent-glow)' : 'transparent',
            transition: 'all 0.15s', marginBottom: '2px',
          })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', padding: '16px 10px 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Admin
            </div>
            <NavLink to="/admin/users" style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 10px', borderRadius: 'var(--radius-sm)',
              fontSize: '14px', fontWeight: 500,
              color: isActive ? 'var(--accent)' : 'var(--text2)',
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              transition: 'all 0.15s',
            })}>
              <Users size={16} />
              Users
            </NavLink>
          </>
        )}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg3)', marginBottom: '4px' }}>
          <Avatar name={user?.name} size={30} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
            padding: '8px 10px', borderRadius: 'var(--radius-sm)',
            fontSize: '14px', color: 'var(--text3)', cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
