import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.getenv("PORT", 8011))
    DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "reports.db")