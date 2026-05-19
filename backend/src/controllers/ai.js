const Groq = require('groq-sdk');
const { getDb } = require('../database');

function getDb2() {
  return getDb();
}

async function aiAssist(req, res) {
  const { prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI features not configured. Set GROQ_API_KEY.' });
  }

  try {
    const groq = new Groq({ apiKey });

    const systemPrompt = `You are a helpful project management assistant for TaskFlow.
You help teams with:
- Breaking down tasks and creating subtask lists
- Suggesting task priorities and deadlines
- Writing clear task descriptions
- Identifying potential blockers
- Summarizing project status
Keep responses concise, actionable, and formatted nicely.
${context ? `Current context: ${context}` : ''}`;

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'No response generated.';
    res.json({ reply, model: completion.model });
  } catch (err) {
    console.error('Groq API error:', err.message);
    res.status(500).json({ error: 'AI request failed: ' + err.message });
  }
}

async function generateTaskDescription(req, res) {
  const { title, projectName } = req.body;
  if (!title) return res.status(400).json({ error: 'Task title is required' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI features not configured. Set GROQ_API_KEY.' });

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{
        role: 'user',
        content: `Write a clear, concise task description (2-3 sentences) for this task:
Task: "${title}"
${projectName ? `Project: "${projectName}"` : ''}
Return only the description text, nothing else.`
      }],
      max_tokens: 150,
      temperature: 0.6,
    });
    const description = completion.choices[0]?.message?.content?.trim() || '';
    res.json({ description });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate description: ' + err.message });
  }
}

async function suggestSubtasks(req, res) {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Task title is required' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI features not configured. Set GROQ_API_KEY.' });

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{
        role: 'user',
        content: `Break this task into 3-5 concrete subtasks. Return ONLY a JSON array of strings, no explanation:
Task: "${title}"
${description ? `Description: "${description}"` : ''}
Example format: ["Subtask 1", "Subtask 2", "Subtask 3"]`
      }],
      max_tokens: 200,
      temperature: 0.5,
    });
    const text = completion.choices[0]?.message?.content?.trim() || '[]';
    let subtasks = [];
    try {
      subtasks = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      subtasks = text.split('\n').filter(l => l.trim()).map(l => l.replace(/^[-*\d.]+\s*/, '').trim());
    }
    res.json({ subtasks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to suggest subtasks: ' + err.message });
  }
}

module.exports = { aiAssist, generateTaskDescription, suggestSubtasks };
