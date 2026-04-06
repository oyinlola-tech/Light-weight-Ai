const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const config = require("../config");

let db = null;

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function initDb() {
  if (!config.enableDb) return null;
  ensureDir(config.dbPath);
  db = new Database(config.dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at);
  `);

  return db;
}
function getDb() {
  return db;
}

function insertMessage({ sessionId, role, content, type }) {
  if (!db) return;
  const stmt = db.prepare(
    "INSERT INTO chat_messages (session_id, role, content, type) VALUES (?, ?, ?, ?)"
  );
  stmt.run(sessionId, role, content, type);
}

function getRecentSessions(limit = 20) {
  if (!db) return [];
  const stmt = db.prepare(
    "SELECT session_id as sessionId, MAX(created_at) as lastMessageAt FROM chat_messages GROUP BY session_id ORDER BY lastMessageAt DESC LIMIT ?"
  );
  return stmt.all(limit);
}

function getSessionHistory(sessionId, limit = 50) {
  if (!db) return [];
  const stmt = db.prepare(
    "SELECT session_id as sessionId, role, content, type, created_at as createdAt FROM chat_messages WHERE session_id = ? ORDER BY id ASC LIMIT ?"
  );
  return stmt.all(sessionId, limit);
}

module.exports = {
  initDb,
  getDb,
  insertMessage,
  getRecentSessions,
  getSessionHistory
};
