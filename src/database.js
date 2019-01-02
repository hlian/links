// @flow
import sqlite3 from 'sqlite3';
import pino from 'pino';

const logger = pino('database');

const migrate = `
CREATE TABLE links (
  id INTEGER PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dead BOOLEAN NOT NULL DEFAULT FALSE,
  channel STRING NOT NULL,
  json JSON NOT NULL
)
`;

class Database {
  sqlite: any;
  constructor(sqlite: any) {
    this.sqlite = sqlite;
  }

  run(sql: string, bindings: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sqlite.run(sql, bindings, e => (e ? reject(e) : resolve()));
    });
  }

  all(sql: string, bindings: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.sqlite.all(sql, bindings, (e, rows) => (e ? reject(e) : resolve(rows)));
    });
  }
}

const withDB = (path: string, inner: (db: any) => void) => {
  const db = new sqlite3.Database(path);
  db.run(migrate, e => {
    if (e && e.message.indexOf('already exists') >= 0) {
      logger.error('>>> table already exists; skipping migration');
    } else if (e) {
      throw e;
    }
    inner(new Database(db));
  });
};

export { Database, withDB };
