import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert } from '../components/UI';
import { Zap } from 'lucide-react';

function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(108,99,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%)',
      padding: '20px',
    }}>
      <div className="animate-fade" style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '14px',
            background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <Zap size={24} color="#fff" fill="#fff" />
          </div>
          <h1 style={{ fontSize: '28px', marginBottom: '6px' }}>TaskFlow</h1>
          <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Team Task Manager</p>
        </div>

        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '32px',
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '6px' }}>{title}</h2>
          <p style={{ color: 'var(--text3)', fontSize: '14px', marginBottom: '24px' }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Alert message={error} />
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}>
          Sign in
        </Button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text3)' }}>
        No account?{' '}
        <Link to="/signup" style={{ color: 'var(--accent)' }}>Create one</Link>
      </p>
    </AuthLayout>
  );
}

export function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Join TaskFlow and start collaborating">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Alert message={error} />
        <Input label="Full name" value={form.name} onChange={set('name')} placeholder="Jane Smith" required />
        <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" required />
        <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required />
        <p style={{ fontSize: '12px', color: 'var(--text3)' }}>The first account created automatically becomes Admin.</p>
        <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}>
          Create account
        </Button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text3)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}
