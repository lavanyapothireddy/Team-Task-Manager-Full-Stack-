import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, ListTodo, ArrowRight } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '20px',
      display: 'flex', alignItems: 'center', gap: '16px'
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '10px',
        background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>{value ?? 0}</div>
        <div style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '4px' }}>{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
    </div>
  );

  if (error) return (
    <div style={{ padding: '32px' }}>
      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '16px', color: '#f87171' }}>
        Error loading dashboard: {error}
      </div>
    </div>
  );

  const { myTasks = [], overdueTasks = [], stats = {}, recentActivity = [] } = data || {};

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>
          Good {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Here's what's on your plate today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon={ListTodo}     label="Total tasks"  value={stats.total}       color="#6366f1" />
        <StatCard icon={TrendingUp}   label="In progress"  value={stats.in_progress} color="#3b82f6" />
        <StatCard icon={CheckCircle2} label="Completed"    value={stats.done}        color="#22c55e" />
        <StatCard icon={AlertTriangle} label="Overdue"     value={stats.overdue}     color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

        {/* My Tasks */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>My Tasks</h2>
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{myTasks.length} pending</span>
          </div>

          {myTasks.length === 0 ? (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
              <CheckCircle2 size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
              <p>All caught up! No pending tasks.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myTasks.slice(0, 8).map(task => (
                <Link key={task.id} to={`/projects/${task.project_id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 18px', cursor: 'pointer', transition: 'border-color 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: 3, height: 36, borderRadius: 2, background: task.priority === 'high' || task.priority === 'critical' ? '#ef4444' : task.priority === 'medium' ? '#3b82f6' : '#94a3b8', flexShrink: 0, marginTop: 2 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{task.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{task.project_name}</span>
                          <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                            {task.status?.replace('_', ' ')}
                          </span>
                          {task.due_date && (
                            <span style={{ fontSize: '12px', color: new Date(task.due_date) < new Date() ? '#ef4444' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={11} />
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--text3)', flexShrink: 0, marginTop: 2 }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <AlertTriangle size={14} color="#ef4444" />
                <h2 style={{ fontSize: '16px', color: '#ef4444', fontWeight: 700 }}>Overdue ({overdueTasks.length})</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {overdueTasks.map(task => (
                  <Link key={task.id} to={`/projects/${task.project_id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 16px', cursor: 'pointer' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{task.title}</div>
                      <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>
                        Due {new Date(task.due_date).toLocaleDateString()} · {task.project_name}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Recent Activity</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px' }}>
            {recentActivity.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: '14px' }}>No recent activity</p>
            ) : (
              recentActivity.map((item, i) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '12px',
                  borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', lineHeight: 1.4 }}>{item.title}</div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{item.project_name}</span>
                      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                        {item.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                      {new Date(item.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
