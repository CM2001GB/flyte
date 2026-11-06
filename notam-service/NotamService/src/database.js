// Import Better-SQLite3 module
// Import Path module
// Create connection to database, create db in routes/data.js

const Database = require('better-sqlite3');
const path = require(path);
const db = new Database(path.join(__dirname, '..', 'data', 'notams.db'));

db.pragma('journal_mode = WAL'); // Write-Ahead-Logging for seamless read-right operations

// Execute query to create a table on startup
db.exec(`
    CREATE TABLE IF NOT EXISTS notams (
        notamId INTEGER PRIMARY KEY AUTOINCREMENT,
        lon FLOAT NOT NULL,
        lat FLOAT NOT NULL,
        radius FLOAT NOT NULL,
        description TEXT,
        start_date TEXT NOT NULL,
        end_data TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'advisory',
        created_at TEXT NOT NULL DEFAULT (datetime('now))
    )
`);

module.exports = db;