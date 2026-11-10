const Database = require('better-sqlite3');
const config = require('./config');

const db = new Database(config.auditDbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS weather_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    flight_datetime TEXT NOT NULL,
    verdict TEXT NOT NULL,
    breached_conditions TEXT,
    wind_speed_kmh REAL,
    wind_gusts_kmh REAL,
    visibility_m REAL,
    precipitation_mm REAL,
    checked_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const insert = db.prepare(`
  INSERT INTO weather_checks
    (lat, lon, flight_datetime, verdict, breached_conditions,
     wind_speed_kmh, wind_gusts_kmh, visibility_m, precipitation_mm)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

function logCheck({ lat, lon, flightDatetime, verdict, breached, readings }) {
  insert.run(
    lat,
    lon,
    flightDatetime,
    verdict,
    breached.join(','),
    readings.wind_speed_kmh,
    readings.wind_gusts_kmh,
    readings.visibility_m,
    readings.precipitation_mm,
  );
}

module.exports = { logCheck };