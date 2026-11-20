const axios = require('axios');
const config = require('./config');

class OpenMeteoError extends Error {}

async function fetchWeather(lat, lon) {
  try {
    const { data } = await axios.get(config.openMeteo.baseUrl, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'wind_speed_10m,wind_gusts_10m,visibility,precipitation',
        timezone: 'auto',
        forecast_days: 2,
      },
      timeout: config.openMeteo.timeoutMs,
    });
    return data;
  } catch (err) {
    throw new OpenMeteoError(err.message);
  }
}

module.exports = { fetchWeather, OpenMeteoError };
