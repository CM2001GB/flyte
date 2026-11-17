// SQLite audit log for sunrise-sunset evaluations
// Matches the standardised DB pattern used across Flyte services

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'sunrise_sunset_audit.db');
const db = new Database(dbPath);

// WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS sunrise_sunset_audit (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        lat         REAL    NOT NULL,
        lon         REAL    NOT NULL,
        flight_dt   TEXT    NOT NULL,
        sunrise     TEXT,
        sunset      TEXT,
        verdict     TEXT    NOT NULL,
        breached    TEXT,
        evaluated_at TEXT   NOT NULL DEFAULT (datetime('now'))
    )
`);

const insertAudit = db.prepare(`
    INSERT INTO sunrise_sunset_audit (lat, lon, flight_dt, sunrise, sunset, verdict, breached)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

module.exports = { db, insertAudit };