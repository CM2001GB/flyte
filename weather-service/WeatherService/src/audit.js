const Database = require('better-sqlite3');
const config = require('./config');

const db = new Database(config.auditDbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS weather_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requested_at TEXT NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    flight_datetime TEXT NOT NULL,
    verdict TEXT NOT NULL,
    breached_conditions TEXT,
    readings_json TEXT
  )
`);
const insert = db.prepare(`
  INSERT INTO weather_audit
    (requested_at, lat, lon, flight_datetime, verdict, breached_conditions, readings_json)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
function logCheck({ lat, lon, flightDatetime, verdict, breached, readings }) {
  insert.run(
    new Date().toISOString(), lat, lon, flightDatetime,
    verdict, breached.join(','), JSON.stringify(readings)
  );
}
module.exports = { logCheck };
