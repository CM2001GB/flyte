from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db import connect_db, close_db
from app.routes.auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(
    title="FLYTE User Service",
    description="User registration, authentication, and profile management.",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(auth_router)

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    from app.config import config
    uvicorn.run("app.main:app", host="0.0.0.0", port=config.PORT, reload=True)
