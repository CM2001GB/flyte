const config = require('./config');

function evaluate(readings) {
  const t = config.thresholds;
  const breached = [];
  if (readings.wind_speed_kmh   != null && readings.wind_speed_kmh   > t.maxWindSpeedKmh)    breached.push('wind_speed');
  if (readings.wind_gusts_kmh   != null && readings.wind_gusts_kmh   > t.maxWindGustsKmh)    breached.push('wind_gusts');
  if (readings.visibility_m     != null && readings.visibility_m     < t.minVisibilityM)     breached.push('visibility');
  if (readings.precipitation_mm != null && readings.precipitation_mm > t.maxPrecipitationMm) breached.push('precipitation');
  return {
    verdict: breached.length === 0 ? 'pass' : 'fail',
    breached_conditions: breached,
    readings,
  };
}
module.exports = { evaluate };
