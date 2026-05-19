const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../taskflow.db');

let _sqlDb = null;

function saveDb() {
  const data = _sqlDb.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function nullify(params) {
  return params.map(p => (p === undefined ? null : p));
}

function rowToObj(cols, vals) {
  return Object.fromEntries(cols.map((c, i) => [c, vals[i]]));
}

function makeProxy() {
  return {
    prepare(sql) {
      return {
        run(...params) {
          // Use prepare+step so last_insert_rowid works reliably
          const stmt = _sqlDb.prepare(sql);
          stmt.bind(nullify(params));
          stmt.step();
          stmt.free();
          const r = _sqlDb.exec('SELECT last_insert_rowid()');
          const lastInsertRowid = r[0]?.values[0]?.[0] ?? null;
          saveDb();
          return { lastInsertRowid };
        },
        get(...params) {
          const stmt = _sqlDb.prepare(sql);
          stmt.bind(nullify(params));
          let row;
          if (stmt.step()) {
            row = rowToObj(stmt.getColumnNames(), stmt.get());
          }
          stmt.free();
          return row;
        },
        all(...params) {
          const results = [];
          const stmt = _sqlDb.prepare(sql);
          stmt.bind(nullify(params));
          while (stmt.step()) {
            results.push(rowToObj(stmt.getColumnNames(), stmt.get()));
          }
          stmt.free();
          return results;
        }
      };
    },
    exec(sql) {
      _sqlDb.run(sql);
      saveDb();
    },
    pragma() {}
  };
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    owner_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS project_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    project_id INTEGER NOT NULL,
    assignee_id INTEGER,
    creator_id INTEGER NOT NULL,
    due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS task_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

async function initializeDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    _sqlDb = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    _sqlDb = new SQL.Database();
  }

  _sqlDb.run('PRAGMA foreign_keys = ON');

  // Run each statement separately
  SCHEMA.split(';').map(s => s.trim()).filter(Boolean).forEach(s => {
    _sqlDb.run(s);
  });

  saveDb();
  console.log('✅ Database initialized');
}

function getDb() {
  if (!_sqlDb) throw new Error('Database not initialized');
  return makeProxy();
}

module.exports = { initializeDatabase, getDb };
