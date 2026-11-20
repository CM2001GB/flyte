// Minimal in-memory TTL cache for weather responses.
// Keyed on rounded location + hour so nearby requests share entries.
const TTL_MS = 10 * 60 * 1000; // 10 minutes

const store = new Map();

function get(key) {
  const hit = store.get(key);
  if (!hit) return null;
  if (hit.expires <= Date.now()) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

function set(key, value) {
  store.set(key, { value, expires: Date.now() + TTL_MS });
}

function clear() {
  store.clear();
}

function buildKey(lat, lon, datetimeISO) {
  // Round to 2dp (~1.1 km at UK latitudes) and hour, so nearby requests share.
  const latR = Number(lat).toFixed(2);
  const lonR = Number(lon).toFixed(2);
  const hour = String(datetimeISO).slice(0, 13); // "YYYY-MM-DDTHH"
  return `weather:${latR}:${lonR}:${hour}`;
}

module.exports = { get, set, clear, buildKey, TTL_MS };
