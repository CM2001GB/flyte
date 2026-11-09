# FLYTE Weather Service

Pre-flight weather safety check for the FLYTE drone companion app.

- Role: Queries Open-Meteo, compares readings against thresholds, returns pass/fail verdict. (BR1, BR3)
- Port: 8001
- Gateway route: /api/weather
- Persistence: SQLite audit log (BR8)

## Endpoint

GET /weather?lat=<float>&lon=<float>&datetime=<ISO8601>

200 -> { verdict, breached_conditions, readings }
400 -> bad input
503 -> Open-Meteo unavailable
