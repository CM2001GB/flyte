const { evaluate } = require('../src/safety');

const base = {
  wind_speed_kmh: 5, wind_gusts_kmh: 8,
  visibility_m: 10000, precipitation_mm: 0,
};

test('passes when all readings within thresholds', () => {
  const r = evaluate(base);
  expect(r.verdict).toBe('pass');
  expect(r.breached_conditions).toEqual([]);
});

test('fails on excessive wind speed', () => {
  const r = evaluate({ ...base, wind_speed_kmh: 999 });
  expect(r.verdict).toBe('fail');
  expect(r.breached_conditions).toContain('wind_speed');
});

test('fails on low visibility', () => {
  const r = evaluate({ ...base, visibility_m: 100 });
  expect(r.verdict).toBe('fail');
  expect(r.breached_conditions).toContain('visibility');
});

test('ignores null readings', () => {
  const r = evaluate({ ...base, wind_speed_kmh: null });
  expect(r.breached_conditions).not.toContain('wind_speed');
});

test('reports multiple breaches', () => {
  const r = evaluate({ ...base, wind_speed_kmh: 999, visibility_m: 1 });
  expect(r.breached_conditions).toEqual(
    expect.arrayContaining(['wind_speed', 'visibility'])
  );
});
