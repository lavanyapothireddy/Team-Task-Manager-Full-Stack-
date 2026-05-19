import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Avatar, Spinner } from '../components/UI';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, ListTodo, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: 44, height: 44, borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{value}</div>
        <div style={{ fontSize: '13px', color: 'var(--text3)' }}>{label}</div>
      </div>
    </Card>
  );
}

const priorityColor = { critical: 'var(--red)', high: 'var(--orange)', medium: 'var(--blue)', low: '#94a3b8' };

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <Spinner size={36} />
    </div>
  );

  const { myTasks = [], overdueTasks = [], stats = {}, recentActivity = [] } = data || {};

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Here's what's on your plate today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon={ListTodo} label="Total tasks" value={stats.total || 0} color="var(--accent)" />
        <StatCard icon={TrendingUp} label="In progress" value={stats.in_progress || 0} color="var(--blue)" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.done || 0} color="var(--green)" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue || 0} color="var(--red)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* My Tasks */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px' }}>My Tasks</h2>
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{myTasks.length} pending</span>
          </div>

          {myTasks.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
              <CheckCircle2 size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
              <p>All caught up! No pending tasks.</p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myTasks.slice(0, 8).map(task => (
                <Link key={task.id} to={`/projects/${task.project_id}`}>
                  <Card hover style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: 3, height: 36, borderRadius: 2, background: priorityColor[task.priority] || '#94a3b8', flexShrink: 0, marginTop: 2 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{task.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{task.project_name}</span>
                          <Badge type={task.status} label={task.status.replace('_', ' ')} />
                          {task.due_date && (
                            <span style={{ fontSize: '12px', color: new Date(task.due_date) < new Date() ? 'var(--red)' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={11} />
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--text3)', flexShrink: 0, marginTop: 2 }} />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <AlertTriangle size={14} color="var(--red)" />
                <h2 style={{ fontSize: '16px', color: 'var(--red)' }}>Overdue ({overdueTasks.length})</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {overdueTasks.map(task => (
                  <Link key={task.id} to={`/projects/${task.project_id}`}>
                    <Card style={{ padding: '12px 16px', borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)' }} hover>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{task.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--red)', marginTop: '2px' }}>
                        Due {new Date(task.due_date).toLocaleDateString()} · {task.project_name}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>Recent Activity</h2>
          <Card style={{ padding: '8px' }}>
            {recentActivity.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: '14px' }}>No recent activity</p>
            ) : (
              recentActivity.map((item, i) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '12px 12px',
                  borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', lineHeight: 1.4 }}>{item.title}</div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{item.project_name}</span>
                      <Badge type={item.status} label={item.status.replace('_', ' ')} />
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                      {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
