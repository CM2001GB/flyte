const express = require('express');
const config = require('./config');
const { fetchWeather, OpenMeteoError } = require('./openMeteo');
const { parseReadings } = require('./parseReadings');
const { evaluate } = require('./safety');
const audit = require('./audit');
const cache = require('./cache');

const app = express();
app.use(express.json());

function validateQuery(q) {
  const lat = Number(q.lat);
  const lon = Number(q.lon);
  const datetime = q.datetime;
  if (!Number.isFinite(lat) || lat < -90  || lat > 90)  return 'lat must be -90..90';
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) return 'lon must be -180..180';
  if (!datetime || Number.isNaN(new Date(datetime).getTime())) return 'datetime must be ISO 8601';
  return null;
}

app.get('/weather', async (req, res) => {
  const err = validateQuery(req.query);
  if (err) return res.status(400).json({ error: err });

  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  const datetime = req.query.datetime;

  // Cache lookup BEFORE any external call.
  const key = cache.buildKey(lat, lon, datetime);
  const cached = cache.get(key);
  if (cached) {
    return res.status(200).json(cached);
  }

  let raw;
  try {
    raw = await fetchWeather(lat, lon);
  } catch (e) {
    if (e instanceof OpenMeteoError) {
      return res.status(503).json({ error: 'Weather provider unavailable' });
    }
    throw e;
  }

  let readings;
  try {
    readings = parseReadings(raw, datetime);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const result = evaluate(readings);

  audit.logCheck({
    lat, lon, flightDatetime: datetime,
    verdict: result.verdict,
    breached: result.breached_conditions,
    readings: result.readings,
  });

  // Only cache successful verdicts, never errors.
  cache.set(key, result);

  return res.status(200).json(result);
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

if (require.main === module) {
  app.listen(config.port, () => console.log('Weather service listening on :' + config.port));
}

module.exports = app;
