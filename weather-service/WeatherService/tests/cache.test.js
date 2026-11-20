const cache = require('../src/cache');

beforeEach(() => cache.clear());

test('miss returns null', () => {
  expect(cache.get('nope')).toBeNull();
});

test('set then get returns value', () => {
  cache.set('k1', { verdict: 'pass' });
  expect(cache.get('k1')).toEqual({ verdict: 'pass' });
});

test('expired entry returns null', () => {
  cache.set('k2', { verdict: 'pass' });
  // Fast-forward: manually expire by overwriting with past timestamp
  // (we can't wait 10 real minutes in a test)
  const realNow = Date.now;
  Date.now = () => realNow() + cache.TTL_MS + 1;
  try {
    expect(cache.get('k2')).toBeNull();
  } finally {
    Date.now = realNow;
  }
});

test('buildKey rounds lat/lon to 2dp and truncates to hour', () => {
  const a = cache.buildKey(52.4812, -1.8934, '2026-11-09T16:45:00Z');
  const b = cache.buildKey(52.4799, -1.8901, '2026-11-09T16:05:00Z');
  expect(a).toBe(b);                 // same rounded coords + hour → same key
  expect(a).toBe('weather:52.48:-1.89:2026-11-09T16');
});

test('buildKey differs across hours', () => {
  const a = cache.buildKey(52.48, -1.89, '2026-11-09T16:00:00Z');
  const b = cache.buildKey(52.48, -1.89, '2026-11-09T17:00:00Z');
  expect(a).not.toBe(b);
});

test('clear empties the store', () => {
  cache.set('k3', { x: 1 });
  cache.clear();
  expect(cache.get('k3')).toBeNull();
});
