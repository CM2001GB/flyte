cd ~/flyte/weather-service/WeatherService

cat > README.md << 'EOF'
# FLYTE Weather Service

Pre-flight weather safety check for the FLYTE drone companion app — queries Open-Meteo, compares readings against drone-flight thresholds, returns a pass/fail verdict.

---

## For the orchestrator integrator

Everything below is what you need to call this service from the orchestrator.

### Endpoint

The `/api/weather` prefix in the design doc is added by the API Gateway. This service handles `/weather` directly.

### Inputs

| Param | Type | Required | Notes |
|---|---|---|---|
| `lat` | float | Y | -90 to 90 |
| `lon` | float | Y | -180 to 180 |
| `datetime` | ISO 8601 string | Y | Must include time (not just date). Also accepts `date` as a fallback param name. Must be within ~48h — Open-Meteo forecast limit. |

### Example request

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

{ "error": "lat must be -90..90" }

{ "error": "Weather provider unavailable" }

npm install
npm start        # listens on :8001
npm test         # 17 tests across 3 files


## Why the version you saved is dangerous

The file you saved has these extra sections:
- `## What you should see` (a heading, not bash)
- `## Then upload the two changed files to GitHub` (a heading)
- `## After upload — send the orchestrator message` (heading + blockquote)
- `That's the whole thing.`

All of these are my *commentary*, not commands. They'd break the terminal.

## What to do

**Delete that `.txt` file** — it's my explanatory message, not usable.

**Instead, run the clean block above** (starting `cd ~/flyte/...` and ending `npm test`).

**If you prefer to save as a script and run it:**

```bash
nano ~/update-readme.sh
