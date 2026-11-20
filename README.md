**FLYTE**

Drone Flight Safety Companion. An SOA microservice system for pre-flight safety checks and post-flight record keeping.

**CMP7174 — Service-Oriented Architecture | MSc Advanced Computer Science**

## What is FLYTE

Drone pilots must verify multiple factors like NOTAMs, weather and daylight before each flight. No single tool does all three. FLYTE provides a unified, multi-platform companion that:

- Automates all flight checks for Drone pilot including NOTAMs, Weather, Sunrise-Sunset
- Makes an After Session Report for logging flights
- Login and Register for drone pilots 
- Data persistence for reports

## Architecture

1.Client (React frontend)

2.API Gateway (ASP.NET Core, Ocelot)
  /api/auth | /api/weather | /api/flight

3.User Service Weather Service Orchestrator
(FastAPI, (Express, (ASP.NET Core)
MongoDB Atlas) SQLite, SQLite)
Open-Meteo)

4.NOTAM Service + Sunrise-Sunset Service
(Express, SQLite)

Each service is independently deployable and owns its own database. Each service communicates over HTTP. 
The API Gateway is the single entry point and the orchestrator coordinates multi service pre flight workflows

## Services

| Service | Stack | Port | Persistence | Responsibility |
|---|---|---|---|---|
| **User Service** | FastAPI, Python, MongoDB Atlas | 8002 | MongoDB | Registration, login, JWT auth, profile |
| **NOTAM Service** | Express, Node.js | 3000 | SQLite | Fetches UK NOTAMs, classifies by Q-code, spatial safety checks |
| **Weather Service** | Express, Node.js | 8001 | SQLite | Fetches Open-Meteo, evaluates against drone thresholds |
| **Sunrise-Sunset Service** | Express, Node.js | 8005 | SQLite | Daylight safety with CAA twilight buffer |
| **Flight Session Service** | Express, Node.js | 8010 | SQLite | Flight lifecycle (create, list, get) |
| **After-Report Service** | FastAPI, Python | 8011 | SQLite | Post-flight reports (create, read, update, delete) |
| **Orchestrator** | ASP.NET Core | 3002 | None | Coordinates pre-flight and post-flight workflows |
| **API Gateway** | ASP.NET Core, Ocelot | 7000 | None | Single entry point, prefix-based routing |
| **Frontend** | React 19, Vite, Pico CSS | 8080 | — | User-facing SPA |


## Business Requirements

| ID | Requirement |
|---|---|
| BR1 | Automated pre-flight safety checks (NOTAM and Weather) |
| BR2 | Detection of flight-restricting NOTAMs within a user-defined radius |
| BR3 | Weather assessment against drone flight thresholds |
| BR4 | Daylight assessment against drone flight thresholds |
| BR5 | Flight-session lifecycle management |
| BR6 | After session report generation |
| BR7 | After session report retrieval and presentation |
| BR8 | Audit logging of all pre flight safety checks |

## Quick Start

**Prerequisites:** Docker Engine + Docker Compose, Git

```bash
# Clone the repository
git clone https://github.com/CM2001GB/flyte.git
cd flyte

# Create .env at the repository root with these values:
cat > .env << 'EOF'
MONGO_URI=mongodb+srv://flyte:flytepass123@flyte.lcgfrik.mongodb.net/flyte
JWT_SECRET=flyte1234
JWT_EXPIRES_MINUTES=60
EOF

# Build and start the full stack
docker compose up --build
```

Once all 9 containers are running:

Frontend: http://localhost:8080

API Gateway: http://localhost:7000

Swagger UIs: http://localhost:8002/docs (User), http://localhost:8011/docs (After-Report)

Setup instructions, configuration details and testing guidelines are in the User Manual document.

Tech Stack

Languages: Python 3.12, Node.js 20/22, C# (.NET 10)

Frameworks: FastAPI, Express, ASP.NET Core

Databases: MongoDB Atlas (cloud), SQLite (file-based)

Infrastructure: Docker, Docker Compose, Azure Container Apps

External APIs: Open-Meteo (weather), sunrise-sunset.org (daylight), NATS PIB archive (NOTAMs)

Gateway: Ocelot (ASP.NET Core)

Auth: JWT (HS256) + bcrypt password hashing


Student	Service(s) Built	Student Number
Callum Miller: NOTAM Service, API Gateway, Orchestrator, Azure Deployment, Docker Containerisation, Frontend 
Ibraheem Asim -	Weather Service, User Service, MongoDB Atlas setup, Contributed to API Gateway and Orchestrator
Jubair Rahman Jim: Sunset/Sunrise Service, Frontend, contributed to API Gateway and Orchestrator
 


flyte/
|-- api-gateway/                  # ASP.NET Core gateway (Ocelot)
|-- orchestrator/                 # ASP.NET Core orchestration service
|-- notam-service/                # NOTAM microservice
|-- weather-service/              # Weather microservice
|-- user-service/                 # User microservice
|-- sunrise-sunset-service/       # Sunrise-Sunset microservice
|-- flight-session-service/       # Flight session microservice
|-- after-flight-report-service/  # After-Report microservice
|-- frontend-service/             # React frontend
|-- client/                       # Prototype frontend (legacy)
|-- docker-compose.yml            # Full stack definition
|-- README.md                     # This file
|-- requirements.txt              # Shared Python dependencies


## Key Design Decisions

1. Microservices over monolith 
2. REST over SOAP 
3. Gateway vs Orchestrator 
4. Per-service persistence
5. Environment-specific configuration

Coursework project — BCU MSc Advanced Computer Science, CMP7174, 2026

## References
Casmir Onyekani (2025). How to structure your README file: README template example. [online] freeCodeCamp.org. Available at: https://www.freecodecamp.org/news/how-to-structure-your-readme-file/ [Accessed 20 Nov. 2026].
