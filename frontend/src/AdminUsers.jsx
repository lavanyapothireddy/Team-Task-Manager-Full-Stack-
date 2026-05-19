import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge, Avatar, Spinner, Alert } from '../components/UI';
import { Shield, Trash2, Users } from 'lucide-react';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listUsers()
      .then(({ users }) => setUsers(users))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'member' : 'admin';
    try {
      const { user: updated } = await api.updateUserRole(u.id, { role: newRole });
      setUsers(prev => prev.map(x => x.id === updated.id ? updated : x));
    } catch (err) { setError(err.message); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '26px' }}>User Management</h1>
          <Badge type="admin" label="Admin Only" />
        </div>
        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>{users.length} registered users</p>
      </div>

      <Alert message={error} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          {users.map(u => (
            <Card key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px' }}>
              <Avatar name={u.name} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{u.name}</span>
                  {u.id === me?.id && <span style={{ fontSize: '11px', background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '10px' }}>You</span>}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{u.email}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                  Joined {new Date(u.created_at).toLocaleDateString()}
                </div>
              </div>
              <Badge type={u.role} label={u.role} />
              {u.id !== me?.id && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button variant="secondary" size="sm" onClick={() => toggleRole(u)}>
                    <Shield size={13} /> {u.role === 'admin' ? 'Make Member' : 'Make Admin'}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => deleteUser(u.id)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
