import DatabaseConstructor from 'better-sqlite3';
import path from 'path';

const DB_FILE = process.env.DATA_DIR ? path.join(process.env.DATA_DIR, 'issuance.db') : path.join(__dirname, '..', 'issuance.db');

export class Database {
  db: DatabaseConstructor.Database;
  constructor(filename?: string) {
    this.db = new DatabaseConstructor(filename || DB_FILE);
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS credentials (
        cred_hash TEXT PRIMARY KEY,
        cred_json TEXT,
        worker TEXT,
        issued_at TEXT
      )
    `).run();
  }

  getCredential(hash: string) {
    return this.db.prepare('SELECT * FROM credentials WHERE cred_hash = ?').get(hash);
  }

  insertCredential(hash: string, json: string, worker: string, issuedAt: string) {
    const stmt = this.db.prepare(`INSERT INTO credentials (cred_hash, cred_json, worker, issued_at) VALUES (?, ?, ?, ?)`);
    return stmt.run(hash, json, worker, issuedAt);
  }

  all() {
    return this.db.prepare('SELECT * FROM credentials').all();
  }
}
