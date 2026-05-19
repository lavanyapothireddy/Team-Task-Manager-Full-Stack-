import { Loader2 } from 'lucide-react';

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, disabled, style, ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    fontFamily: 'var(--font-body)', fontWeight: 500, borderRadius: 'var(--radius-sm)',
    transition: 'all 0.15s ease', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1, border: 'none',
  };
  const sizes = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '9px 18px', fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '15px' },
  };
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff' },
    secondary: { background: 'var(--bg4)', color: 'var(--text)', border: '1px solid var(--border)' },
    danger: { background: 'rgba(239,68,68,0.12)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)' },
    ghost: { background: 'transparent', color: 'var(--text2)', padding: sizes[size]?.padding },
  };
  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)' }}>{label}</label>}
      <input
        style={{
          background: 'var(--bg3)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--text)',
          fontSize: '14px', width: '100%', transition: 'border-color 0.15s',
          ...style
        }}
        onFocus={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', color: 'var(--red)' }}>{error}</span>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, children, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)' }}>{label}</label>}
      <select
        style={{
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--text)',
          fontSize: '14px', width: '100%', cursor: 'pointer',
          ...style
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)' }}>{label}</label>}
      <textarea
        style={{
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--text)',
          fontSize: '14px', width: '100%', minHeight: '80px', resize: 'vertical',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
        {...props}
      />
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, onClick, hover = false }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: hover ? 'border-color 0.15s, transform 0.15s, box-shadow 0.15s' : 'none',
        ...style
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.borderColor = 'var(--border2)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      } : undefined}
    >
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const badgeColors = {
  todo: { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' },
  in_progress: { bg: 'rgba(59,130,246,0.12)', color: 'var(--blue)' },
  review: { bg: 'rgba(234,179,8,0.12)', color: 'var(--yellow)' },
  done: { bg: 'rgba(34,197,94,0.12)', color: 'var(--green)' },
  low: { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' },
  medium: { bg: 'rgba(59,130,246,0.12)', color: 'var(--blue)' },
  high: { bg: 'rgba(249,115,22,0.12)', color: 'var(--orange)' },
  critical: { bg: 'rgba(239,68,68,0.12)', color: 'var(--red)' },
  admin: { bg: 'rgba(108,99,255,0.15)', color: 'var(--accent)' },
  member: { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' },
  active: { bg: 'rgba(34,197,94,0.12)', color: 'var(--green)' },
  archived: { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' },
  completed: { bg: 'rgba(108,99,255,0.15)', color: 'var(--accent)' },
};

export function Badge({ label, type }) {
  const colors = badgeColors[type] || badgeColors.member;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
      background: colors.bg, color: colors.color,
    }}>
      {label || type}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = '480px' }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '16px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-fade"
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', width: '100%', maxWidth: width,
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px' }}>{title}</h3>
          <button onClick={onClose} style={{ color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>✕</button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 32 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hue = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue}, 60%, 35%)`, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, fontFamily: 'var(--font-display)',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
      {Icon && <Icon size={40} style={{ marginBottom: '16px', opacity: 0.4 }} />}
      <h3 style={{ color: 'var(--text2)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{title}</h3>
      {description && <p style={{ fontSize: '14px', marginBottom: '20px' }}>{description}</p>}
      {action}
    </div>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid var(--border)`,
      borderTopColor: 'var(--accent)', borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────
export function Alert({ type = 'error', message }) {
  if (!message) return null;
  const colors = {
    error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: 'var(--red)' },
    success: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', color: 'var(--green)' },
  };
  const c = colors[type];
  return (
    <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: c.bg, border: `1px solid ${c.border}`, color: c.color, fontSize: '14px' }}>
      {message}
    </div>
  );
}
