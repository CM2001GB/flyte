function parseReadings(raw, requestedISO) {
  const times = raw && raw.hourly && raw.hourly.time;
  if (!Array.isArray(times) || times.length === 0) {
    throw new Error('Upstream returned no hourly data');
  }
  const wanted = new Date(requestedISO).getTime();
  if (Number.isNaN(wanted)) {
    throw new Error('Invalid requested datetime');
  }
  let bestIdx = -1;
  let bestDelta = Infinity;
  for (let i = 0; i < times.length; i++) {
    const delta = Math.abs(new Date(times[i]).getTime() - wanted);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIdx = i;
    }
  }
  if (bestDelta > 90 * 60 * 1000) {
    throw new Error('Requested datetime outside available forecast window');
  }
  const h = raw.hourly;
  return {
    wind_speed_kmh:   h.wind_speed_10m && h.wind_speed_10m[bestIdx] != null ? h.wind_speed_10m[bestIdx] : null,
    wind_gusts_kmh:   h.wind_gusts_10m && h.wind_gusts_10m[bestIdx] != null ? h.wind_gusts_10m[bestIdx] : null,
    visibility_m:     h.visibility     && h.visibility[bestIdx]     != null ? h.visibility[bestIdx]     : null,
    precipitation_mm: h.precipitation  && h.precipitation[bestIdx]  != null ? h.precipitation[bestIdx]  : null,
  };
}
module.exports = { parseReadings };
