import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Card, Button, Input, Textarea, Modal, Badge, EmptyState, Spinner, Alert } from '../components/UI';
import { FolderKanban, Plus, CheckCircle2, ListTodo, Users } from 'lucide-react';

function ProjectCard({ project }) {
  const progress = project.task_count > 0
    ? Math.round((project.completed_tasks / project.task_count) * 100)
    : 0;

  return (
    <Link to={`/projects/${project.id}`}>
      <Card hover style={{ height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderKanban size={18} color="var(--accent)" />
          </div>
          <Badge type={project.status} label={project.status} />
        </div>

        <h3 style={{ fontSize: '15px', marginBottom: '6px' }}>{project.name}</h3>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px', lineHeight: 1.5, minHeight: '40px' }}>
          {project.description || 'No description provided.'}
        </p>

        {/* Progress bar */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Progress</span>
            <span style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 600 }}>{progress}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? 'var(--green)' : 'var(--accent)', borderRadius: 2, transition: 'width 0.3s ease' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text3)' }}>
            <Users size={12} /> {project.member_count}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text3)' }}>
            <ListTodo size={12} /> {project.task_count} tasks
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--green)' }}>
            <CheckCircle2 size={12} /> {project.completed_tasks} done
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listProjects()
      .then(({ projects }) => setProjects(projects))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setCreating(true);
    try {
      const { project } = await api.createProject(form);
      setProjects(prev => [project, ...prev]);
      setShowCreate(false);
      setForm({ name: '', description: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>Projects</h1>
          <p style={{ color: 'var(--text3)', fontSize: '14px' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Project
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to get started."
          action={<Button onClick={() => setShowCreate(true)}><Plus size={16} /> Create Project</Button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {projects.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Project">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Alert message={error} />
          <Input label="Project name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My Awesome Project" required />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project about?" />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={creating}><Plus size={14} /> Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
