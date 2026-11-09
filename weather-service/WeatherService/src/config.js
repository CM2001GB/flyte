require('dotenv').config();
const num = (v, fallback) => (v !== undefined ? Number(v) : fallback);
module.exports = {
  port: num(process.env.PORT, 8001),
  openMeteo: {
    baseUrl: process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1/forecast',
    timeoutMs: num(process.env.OPEN_METEO_TIMEOUT_MS, 5000),
  },
  thresholds: {
    maxWindSpeedKmh:    num(process.env.MAX_WIND_SPEED_KMH, 30),
    maxWindGustsKmh:    num(process.env.MAX_WIND_GUSTS_KMH, 40),
    minVisibilityM:     num(process.env.MIN_VISIBILITY_M, 5000),
    maxPrecipitationMm: num(process.env.MAX_PRECIPITATION_MM, 1),
  },
  auditDbPath: process.env.AUDIT_DB_PATH || './weather_audit.db',
};
