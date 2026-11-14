import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI: str = os.getenv("MONGO_URI", "")
    PORT: int = int(os.getenv("PORT", "8002"))
    JWT_SECRET: str = os.getenv("JWT_SECRET", "flyte1234")
    JWT_EXPIRES_MINUTES: int = int(os.getenv("JWT_EXPIRES_MINUTES", "60"))
    JWT_ALGORITHM: str = "HS256"

    # Collections
    USERS_COLLECTION = "users"
    SESSIONS_COLLECTION = "sessions"

    @classmethod
    def validate(cls):
        if not cls.MONGO_URI:
            raise ValueError("MONGO_URI is not set in .env")
        if cls.JWT_SECRET == "dev-secret-change-me":
            print("WARNING: Using default JWT_SECRET — fine for dev, not for production")

config = Config()
config.validate()
