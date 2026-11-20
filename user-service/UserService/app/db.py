from motor.motor_asyncio import AsyncIOMotorClient
from app.config import config

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    """Called on startup."""
    global client, db
    client = AsyncIOMotorClient(config.MONGO_URI)
    db = client.get_default_database()  # uses /flyte from URI
    # Optional: ping to verify
    await client.admin.command("ping")
    print(f"Connected to MongoDB database: {db.name}")

async def close_db():
    """Called on shutdown."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")

def get_users():
    return db[config.USERS_COLLECTION]

def get_sessions():
    return db[config.SESSIONS_COLLECTION]
