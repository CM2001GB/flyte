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
| `datetime` | ISO 8601 string | Y | Must include time (not just date). Must be within ~48h — Open-Meteo forecast limit. |

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


invalid input - { "error": "lat must be -90..90" }
503 Service Unavailable - { "error": "Weather provider unavailable" }
