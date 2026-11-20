// Import Better-SQLite3 module
// Import Path module
// open or create database, create db in routes/data.js

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'data', 'notams.db'));

db.pragma('journal_mode = WAL'); // Write-Ahead-Logging for seamless read-right operations

// Execute query to create a table on startup
db.exec(`
    CREATE TABLE IF NOT EXISTS notams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        notam_id TEXT UNIQUE NOT NULL,
        fir TEXT,
        location TEXT,
        coordinates_raw TEXT,
        latitude REAL,
        longitude REAL,
        radius REAL,
        lower_fl INTEGER,
        upper_fl INTEGER,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        description TEXT,
        q_code TEXT,
        section TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
`);

module.exports = db;