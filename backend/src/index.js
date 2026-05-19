require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), ai: !!process.env.GROQ_API_KEY })
);

async function start() {
  await initializeDatabase();

  app.use('/api/auth',     require('./routes/auth'));
  app.use('/api/projects', require('./routes/projects'));
  app.use('/api/projects', require('./routes/tasks'));
  app.use('/api/users',    require('./routes/users'));
  app.use('/api/ai',       require('./routes/ai'));

  // Serve compiled frontend in production
  if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../../frontend/dist');
    app.use(express.static(frontendPath));
    app.get('*', (req, res) =>
      res.sendFile(path.join(frontendPath, 'index.html'))
    );
  }

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, () =>
    console.log(`🚀 TaskFlow running on port ${PORT} | AI: ${process.env.GROQ_API_KEY ? '✅' : '❌ (set GROQ_API_KEY)'}`)
  );
}

start().catch(err => { console.error('Startup failed:', err); process.exit(1); });
