# FLYTE User Service

Registration, login, logout, profile. Port **8002**. Gateway route `/api/auth/*`.
Persistence: MongoDB Atlas (`users`, `sessions`).

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | Create account → `201` / `409` |
| POST | `/auth/login` | Get JWT → `200` / `401` |
| POST | `/auth/logout` | Blacklist token → `200` |
| GET | `/auth/profile` | User info (Bearer token) → `200` / `401` |
| GET | `/health` | Health check |

## Run

```bash
cp .env.example .env      # fill in MONGO_URI
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
