    Updates README.md with the full orchestrator guide

    Patches src/index.js to accept both datetime and date (closing the doc's ambiguity)

    Runs npm test to confirm nothing broke

bash

cd ~/flyte/weather-service/WeatherService

cat > README.md << 'EOF'
# FLYTE Weather Service

Pre-flight weather safety check for the FLYTE drone companion app — queries Open-Meteo, compares readings against drone-flight thresholds, returns a pass/fail verdict.

---

## For the orchestrator integrator

Everything below is what you need to call this service from the orchestrator.

### Endpoint

GET /weather?lat=<float>&lon=<float>&datetime=<ISO8601>
text


The `/api/weather` prefix in the design doc is added by the API Gateway. This service handles `/weather` directly.

### Inputs

| Param | Type | Required | Notes |
|---|---|---|---|
| `lat` | float | Y | -90 to 90 |
| `lon` | float | Y | -180 to 180 |
| `datetime` | ISO 8601 string | Y | Must include time (not just date). Also accepts `date` as a fallback param name. Must be within ~48h — Open-Meteo forecast limit. |

### Example request

GET /weather?lat=52.48&lon=-1.89&datetime=2026-11-10T14:00:00Z
text


### Responses

**`200 OK` — verdict calculated:**

```json
{
  "verdict": "pass",
  "breached_conditions": [],
  "readings": {
    "wind_speed_kmh": 10.1,
    "wind_gusts_kmh": 21.2,
    "visibility_m": 8000,
    "precipitation_mm": 0
  }
}

    verdict: "pass" or "fail"

    breached_conditions: array of strings; empty when pass. Possible values: "wind_speed", "wind_gusts", "visibility", "precipitation".

    readings: raw hourly readings from Open-Meteo for the requested hour.

400 Bad Request — invalid input:
json

{ "error": "lat must be -90..90" }

Also returned for invalid datetime format, or a datetime outside Open-Meteo's forecast window.

503 Service Unavailable — Open-Meteo unreachable:
json

{ "error": "Weather provider unavailable" }

How to aggregate in the orchestrator

Per the design doc's orchestrator section:

    200 with verdict: "pass" — this check passed

    200 with verdict: "fail" — this check failed; overall pre-flight should fail

    503 — this check is unavailable; treat as 207 Partial if the other checks returned 200

    400 — your orchestrator sent bad input; pass the 400 back to the client (do NOT convert to 207)

Caching (important)

Responses are cached for 10 minutes per rounded location (~1km) + hour. The second identical request returns instantly from memory — no new audit-log row, no Open-Meteo call. Not a bug.
Thresholds used
Condition	Default	Fails when
Wind speed	30 km/h	above
Wind gusts	40 km/h	above
Visibility	5000 m	below
Precipitation	1 mm	above

All configurable via env vars — see .env.example.
Response field names are stable

No plans to rename verdict / breached_conditions / readings. Build against these.
For the developer
bash

npm install
npm start        # listens on :8001
npm test         # 17 tests across 3 files

    Role: BR1 (pre-flight), BR3 (weather vs thresholds)

    Port: 8001

    Gateway route: /api/weather

    Persistence: SQLite audit log (BR8) at ./weather_audit.db
    EOF

Patch src/index.js: accept both datetime and date as param names

node -e "
const fs = require('fs');
const p = 'src/index.js';
let src = fs.readFileSync(p, 'utf8');

// validateQuery: resolve datetime from either param
src = src.replace(
"const datetime = q.datetime;",
"const datetime = q.datetime || q.date;"
);

// /weather handler: same resolution
src = src.replace(
"const datetime = req.query.datetime;",
"const datetime = req.query.datetime || req.query.date;"
);

fs.writeFileSync(p, src);
console.log('index.js patched');
"

echo '--- Verifying patch ---'
grep -n "datetime" src/index.js

echo '--- Running tests ---'
npm test
text


## What you should see

1. **README overwritten** — no output (heredoc writes silently)
2. **`index.js patched`** — the node script ran
3. **`grep` output** showing two lines with `q.datetime || q.date` and `req.query.datetime || req.query.date`
4. **`npm test`** → **17 passing**

## Then upload the two changed files to GitHub

Both files are now modified locally. Upload them via the web UI (drag-and-drop from `~/flyte/weather-service/WeatherService/`):

- `README.md` (visible, easy to drag)
- `src/index.js` (visible, inside `src/` folder — navigate into `src/` and drag `index.js`)

Upload both to `https://github.com/CM2001GB/flyte/upload/experimental/weather-service/WeatherService/` for the README, and `https://github.com/CM2001GB/flyte/upload/experimental/weather-service/WeatherService/src/` for `index.js`.

Commit message: `Expand README with orchestrator guide; accept date or datetime param`

## After upload — send the orchestrator message

> *Weather service is done on `experimental`. Full integration guide in `weather-service/WeatherService/README.md` — endpoint, examples, 200/400/503 handling, thresholds, caching. Accepts both `datetime` and `date` params so no naming mismatch. One question: does the response shape `{verdict, breached_conditions, readings}` work for your orchestrator? If not, tell me now — cheap to adjust before integration.*

That's the whole thing.

