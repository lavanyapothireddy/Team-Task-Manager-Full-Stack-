import { useState } from 'react';
import { Sparkles, Send, X, ChevronDown, ChevronUp, Wand2, ListTodo } from 'lucide-react';
import { aiApi } from '../utils/api';

export default function AIAssistant({ projectName, onSubtasksGenerated }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('chat'); // 'chat' | 'subtasks'
  const [prompt, setPrompt] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '👋 Hi! I\'m your AI project assistant powered by Groq. Ask me to help break down tasks, write descriptions, or suggest priorities.' }
  ]);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendChat = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    const userMsg = prompt.trim();
    setPrompt('');
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const { reply } = await aiApi.assist({
        prompt: userMsg,
        context: projectName ? `Working on project: "${projectName}"` : ''
      });
      setMessages(m => [...m, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', text: '⚠️ ' + (err.message || 'AI unavailable. Check GROQ_API_KEY.') }]);
    } finally {
      setLoading(false);
    }
  };

  const generateSubtasks = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || loading) return;
    setLoading(true);
    setSubtasks([]);
    try {
      const { subtasks: result } = await aiApi.suggestSubtasks({ title: taskTitle });
      setSubtasks(result);
    } catch (err) {
      setSubtasks(['⚠️ Failed: ' + err.message]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 500 }}>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(108,99,255,0.5)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          title="AI Assistant (Groq)"
        >
          <Sparkles size={22} color="#fff" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div style={{
          width: 360, background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', maxHeight: 520,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(139,92,246,0.1))',
            borderRadius: 'var(--radius) var(--radius) 0 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="var(--accent)" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>AI Assistant</span>
              <span style={{ fontSize: 10, background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 6px', borderRadius: 10 }}>Groq</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: 'var(--text3)', cursor: 'pointer', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>

          {/* Mode tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {[['chat', 'Chat', Wand2], ['subtasks', 'Subtasks', ListTodo]].map(([key, label, Icon]) => (
              <button key={key} onClick={() => setMode(key)} style={{
                flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 5, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                color: mode === key ? 'var(--accent)' : 'var(--text3)',
                borderBottom: mode === key ? '2px solid var(--accent)' : '2px solid transparent',
                background: 'none', marginBottom: -1,
              }}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>

          {/* Chat mode */}
          {mode === 'chat' && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 240, maxHeight: 340 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '85%', padding: '8px 12px', borderRadius: 10, fontSize: 13, lineHeight: 1.5,
                      background: m.role === 'user' ? 'var(--accent)' : 'var(--bg3)',
                      color: m.role === 'user' ? '#fff' : 'var(--text)',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', gap: 4, padding: '8px 12px' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', opacity: 0.6, animation: `pulse 1s ${i*0.2}s infinite` }} />
                    ))}
                  </div>
                )}
              </div>
              <form onSubmit={sendChat} style={{ display: 'flex', gap: 8, padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
                <input
                  value={prompt} onChange={e => setPrompt(e.target.value)}
                  placeholder="Ask anything about your project…"
                  disabled={loading}
                  style={{
                    flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--text)', fontSize: 13,
                  }}
                />
                <button type="submit" disabled={loading || !prompt.trim()} style={{
                  width: 36, height: 36, borderRadius: 8, background: 'var(--accent)',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: !prompt.trim() || loading ? 0.5 : 1,
                }}>
                  <Send size={15} color="#fff" />
                </button>
              </form>
            </>
          )}

          {/* Subtasks mode */}
          {mode === 'subtasks' && (
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: 400 }}>
              <form onSubmit={generateSubtasks} style={{ display: 'flex', gap: 8 }}>
                <input
                  value={taskTitle} onChange={e => setTaskTitle(e.target.value)}
                  placeholder="Enter task title…"
                  disabled={loading}
                  style={{
                    flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--text)', fontSize: 13,
                  }}
                />
                <button type="submit" disabled={loading || !taskTitle.trim()} style={{
                  padding: '8px 12px', borderRadius: 8, background: 'var(--accent)',
                  border: 'none', cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600,
                  opacity: !taskTitle.trim() || loading ? 0.5 : 1,
                }}>
                  {loading ? '...' : 'Generate'}
                </button>
              </form>

              {subtasks.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>Suggested subtasks (click to copy):</div>
                  {subtasks.map((s, i) => (
                    <div key={i} onClick={() => navigator.clipboard?.writeText(s)} style={{
                      padding: '8px 12px', background: 'var(--bg3)', borderRadius: 6,
                      fontSize: 13, marginBottom: 6, cursor: 'pointer', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 12 }}>{i+1}</span>
                      {s}
                    </div>
                  ))}
                  {onSubtasksGenerated && (
                    <button onClick={() => onSubtasksGenerated(subtasks)} style={{
                      width: '100%', padding: '8px', marginTop: 4,
                      background: 'var(--accent-glow)', border: '1px solid var(--accent)',
                      borderRadius: 6, color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      + Add all as tasks
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
