import uvicorn
from fastapi import FastAPI
from app.config import Config
from app.database import init_db
from app.routes.reports import router as reports_router

app = FastAPI(title="FLYTE After-Report Service", redirect_slashes=False)

# initialise the SQLite database on startup
init_db()

# register routes
app.include_router(reports_router)

# health check
@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=Config.PORT, reload=True)