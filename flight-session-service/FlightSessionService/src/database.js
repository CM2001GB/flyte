// Import Better-SQLite3 module
// Import Path module
// open or create database, create db in routes/data.js

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'data', 'flights.db'));

db.pragma('journal_mode = WAL'); // Write-Ahead-Logging for seamless read-right operations

// Execute query to create a table on startup
db.exec(`
    CREATE TABLE IF NOT EXISTS flight_sessions (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        flight_id       TEXT    UNIQUE NOT NULL,
        user_id         TEXT    NOT NULL,
        date            TEXT    NOT NULL,
        start_time      TEXT    NOT NULL,
        end_time        TEXT    NOT NULL,
        drone_model     TEXT    NOT NULL,
        flight_notes    TEXT,
        status          TEXT,
        created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    )
`);

module.exports = db;