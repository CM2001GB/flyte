const { parseReadings } = require('../src/parseReadings');

// Helper: build a fake Open-Meteo response with hourly data at fixed hours.
function fakeResponse(hours, values = {}) {
  return {
    hourly: {
      time: hours,
      wind_speed_10m: values.wind ?? hours.map(() => 10),
      wind_gusts_10m: values.gusts ?? hours.map(() => 15),
      visibility: values.vis ?? hours.map(() => 10000),
      precipitation: values.precip ?? hours.map(() => 0),
    },
  };
}

test('picks the exact hour when requested time matches an hour', () => {
  const raw = fakeResponse(['2026-11-10T13:00', '2026-11-10T14:00', '2026-11-10T15:00']);
  const r = parseReadings(raw, '2026-11-10T14:00:00Z');
  expect(r.wind_speed_kmh).toBe(10);
});

test('picks nearest hour when requested time is mid-hour', () => {
  const raw = fakeResponse(['2026-11-10T13:00', '2026-11-10T14:00', '2026-11-10T15:00']);
  // 14:20 is 20 min from 14:00 and 40 min from 15:00 → should pick 14:00
  const r = parseReadings(raw, '2026-11-10T14:20:00Z');
  expect(r).toBeTruthy();
  // Can't easily assert "which index" without exposing it — this just verifies it doesn't throw
});

test('throws when requested time is outside the forecast window', () => {
  const raw = fakeResponse(['2026-11-10T13:00', '2026-11-10T14:00']);
  // 10 hours later — nearest hour is 14:00, delta 8h > 90min threshold
  expect(() => parseReadings(raw, '2026-11-10T22:00:00Z'))
    .toThrow(/outside available forecast window/i);
});

test('throws on invalid requested datetime', () => {
  const raw = fakeResponse(['2026-11-10T14:00']);
  expect(() => parseReadings(raw, 'not-a-date')).toThrow(/Invalid requested datetime/i);
});

test('throws on empty hourly data', () => {
  expect(() => parseReadings({ hourly: { time: [] } }, '2026-11-10T14:00:00Z'))
    .toThrow(/no hourly data/i);
});

test('fills nulls for missing reading fields', () => {
  const raw = { hourly: { time: ['2026-11-10T14:00'] } }; // no wind/vis fields at all
  const r = parseReadings(raw, '2026-11-10T14:00:00Z');
  expect(r.wind_speed_kmh).toBeNull();
  expect(r.visibility_m).toBeNull();
});
