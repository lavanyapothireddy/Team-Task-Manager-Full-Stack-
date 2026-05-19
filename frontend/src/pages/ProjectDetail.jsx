import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Textarea, Select, Modal, Badge, Avatar, Spinner, Alert, EmptyState } from '../components/UI';
import { Plus, Users, Settings, Trash2, UserPlus, MessageSquare, Clock, ChevronLeft } from 'lucide-react';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' },
];

const priorityDot = { critical: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#94a3b8' };

function TaskCard({ task, projectId, members, onUpdate, onDelete, isAdmin }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const loadDetail = async () => {
    const { task: t, comments: c } = await api.getTask(projectId, task.id);
    setComments(c);
    setOpen(true);
  };

  const updateStatus = async (status) => {
    try {
      const { task: updated } = await api.updateTask(projectId, task.id, { status });
      onUpdate(updated);
    } catch {}
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSaving(true);
    try {
      const { comment: c } = await api.addComment(projectId, task.id, { content: comment });
      setComments(prev => [...prev, c]);
      setComment('');
    } catch {} finally { setSaving(false); }
  };

  return (
    <>
      <div
        onClick={loadDetail}
        style={{
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '12px',
          cursor: 'pointer', transition: 'border-color 0.15s',
          marginBottom: '8px',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: priorityDot[task.priority] || '#94a3b8', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '13px', fontWeight: 500, flex: 1, lineHeight: 1.4 }}>{task.title}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Badge type={task.priority} label={task.priority} />
            {task.due_date && (
              <span style={{ fontSize: '11px', color: new Date(task.due_date) < new Date() ? 'var(--red)' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Clock size={10} />{new Date(task.due_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          {task.assignee_name && <Avatar name={task.assignee_name} size={22} />}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={task.title} width="560px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Badge type={task.priority} label={task.priority} />
            <Badge type={task.status} label={task.status.replace('_', ' ')} />
            {task.due_date && <span style={{ fontSize: '13px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} />{new Date(task.due_date).toLocaleDateString()}</span>}
          </div>

          {task.description && <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.6 }}>{task.description}</p>}

          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text3)', display: 'block', marginBottom: '4px' }}>Assignee</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                {task.assignee_name ? <><Avatar name={task.assignee_name} size={20} />{task.assignee_name}</> : 'Unassigned'}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text3)', display: 'block', marginBottom: '4px' }}>Created by</label>
              <div style={{ fontSize: '13px' }}>{task.creator_name}</div>
            </div>
          </div>

          {/* Status update */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text3)', display: 'block', marginBottom: '8px' }}>Update Status</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {COLUMNS.map(col => (
                <button
                  key={col.key}
                  onClick={() => { updateStatus(col.key); setOpen(false); }}
                  style={{
                    padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                    cursor: 'pointer', border: '1px solid',
                    background: task.status === col.key ? 'var(--accent-glow)' : 'transparent',
                    borderColor: task.status === col.key ? 'var(--accent)' : 'var(--border)',
                    color: task.status === col.key ? 'var(--accent)' : 'var(--text3)',
                  }}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <MessageSquare size={14} color="var(--text3)" />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Comments ({comments.length})</span>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
              {comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <Avatar name={c.user_name} size={24} />
                  <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '8px 12px', flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>{c.user_name}</div>
                    <div style={{ fontSize: '13px' }}>{c.content}</div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={submitComment} style={{ display: 'flex', gap: '8px' }}>
              <input
                value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Write a comment..."
                style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--text)', fontSize: '13px' }}
              />
              <Button type="submit" size="sm" loading={saving}>Post</Button>
            </form>
          </div>

          {isAdmin && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="danger" size="sm" onClick={() => { onDelete(task.id); setOpen(false); }}>
                <Trash2 size={13} /> Delete Task
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [myRole, setMyRole] = useState('member');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('board');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', assignee_id: '', due_date: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = myRole === 'admin' || user?.role === 'admin';

  const loadProject = async () => {
    try {
      const [{ project, members, stats, myRole }, { tasks }] = await Promise.all([
        api.getProject(id),
        api.listTasks(id)
      ]);
      setProject(project);
      setMembers(members);
      setStats(stats);
      setTasks(tasks);
      setMyRole(myRole);
    } catch (err) {
      if (err.message.includes('not a member') || err.message.includes('not found')) navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProject(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const { task } = await api.createTask(id, taskForm);
      setTasks(prev => [task, ...prev]);
      setShowAddTask(false);
      setTaskForm({ title: '', description: '', priority: 'medium', assignee_id: '', due_date: '' });
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.addMember(id, { email: memberEmail, role: memberRole });
      await loadProject();
      setShowAddMember(false);
      setMemberEmail('');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteTask = async (taskId) => {
    await api.deleteTask(id, taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleUpdateTask = (updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Spinner size={36} /></div>;
  if (!project) return null;

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter(t => t.status === col.key);
    return acc;
  }, {});

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate('/projects')} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text3)', fontSize: '13px', cursor: 'pointer', marginBottom: '12px', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
          <ChevronLeft size={14} /> Projects
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '24px' }}>{project.name}</h1>
              <Badge type={project.status} label={project.status} />
            </div>
            {project.description && <p style={{ color: 'var(--text3)', fontSize: '14px' }}>{project.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isAdmin && (
              <Button variant="secondary" size="sm" onClick={() => setShowAddMember(true)}>
                <UserPlus size={14} /> Add Member
              </Button>
            )}
            <Button size="sm" onClick={() => setShowAddTask(true)}>
              <Plus size={14} /> New Task
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
          {[['total', 'Total'], ['todo', 'To Do'], ['in_progress', 'In Progress'], ['review', 'Review'], ['done', 'Done'], ['overdue', '⚠ Overdue']].map(([k, l]) => (
            <div key={k} style={{ fontSize: '13px', color: k === 'overdue' && stats[k] > 0 ? 'var(--red)' : 'var(--text3)' }}>
              <span style={{ fontWeight: 700, color: k === 'overdue' && stats[k] > 0 ? 'var(--red)' : 'var(--text)', fontFamily: 'var(--font-display)' }}>{stats[k] || 0}</span> {l}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        {[['board', 'Board'], ['members', `Members (${members.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '10px 20px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            color: tab === key ? 'var(--accent)' : 'var(--text3)',
            borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
            background: 'none', transition: 'all 0.15s', marginBottom: '-1px',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Board */}
      {tab === 'board' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', overflowX: 'auto' }}>
          {COLUMNS.map(col => (
            <div key={col.key}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{col.label}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text3)', background: 'var(--bg4)', borderRadius: '10px', padding: '2px 8px' }}>
                    {tasksByStatus[col.key].length}
                  </span>
                </div>
              </div>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px', minHeight: '200px' }}>
                {tasksByStatus[col.key].length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: '12px' }}>No tasks</div>
                ) : (
                  tasksByStatus[col.key].map(task => (
                    <TaskCard key={task.id} task={task} projectId={id} members={members} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} isAdmin={isAdmin} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members */}
      {tab === 'members' && (
        <div style={{ maxWidth: '600px' }}>
          {members.map(m => (
            <Card key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', padding: '14px 18px' }}>
              <Avatar name={m.name} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{m.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{m.email}</div>
              </div>
              <Badge type={m.project_role} label={m.project_role} />
              {isAdmin && m.id !== user?.id && (
                <Button variant="ghost" size="sm" style={{ color: 'var(--red)', padding: '4px 8px' }}
                  onClick={async () => { await api.removeMember(id, m.id); await loadProject(); }}>
                  <Trash2 size={13} />
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal open={showAddTask} onClose={() => setShowAddTask(false)} title="New Task">
        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Alert message={error} />
          <Input label="Title *" value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" required />
          <Textarea label="Description" value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description..." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select label="Priority" value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
            <Input label="Due Date" type="date" value={taskForm.due_date} onChange={e => setTaskForm(f => ({ ...f, due_date: e.target.value }))} />
          </div>
          <Select label="Assign to" value={taskForm.assignee_id} onChange={e => setTaskForm(f => ({ ...f, assignee_id: e.target.value }))}>
            <option value="">Unassigned</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setShowAddTask(false)}>Cancel</Button>
            <Button type="submit" loading={saving}><Plus size={14} /> Create Task</Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal open={showAddMember} onClose={() => setShowAddMember(false)} title="Add Member">
        <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Alert message={error} />
          <Input label="Member email" type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="team@example.com" required />
          <Select label="Role" value={memberRole} onChange={e => setMemberRole(e.target.value)}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </Select>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setShowAddMember(false)}>Cancel</Button>
            <Button type="submit" loading={saving}><UserPlus size={14} /> Add</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
