# FLYTE Weather Service

Queries Open-Meteo, compares readings against drone-flight thresholds, and returns a pass/fail verdict (BR1, BR3).

## Endpoint

`GET /weather?lat=<float>&lon=<float>&datetime=<ISO8601>`

## Success — `200 OK`

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

400 Bad Request — invalid input:

{ "error": "lat must be -90..90" }

503 Service Unavailable — Open-Meteo unreachable:

{ "error": "Weather provider unavailable" }

