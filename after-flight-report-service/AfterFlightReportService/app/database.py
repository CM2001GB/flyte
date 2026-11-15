import sqlite3
import os
from app.config import Config

def get_connection():
    """Create a new SQLite connection with row factory enabled."""
    conn = sqlite3.connect(Config.DB_PATH)
    conn.row_factory = sqlite3.Row  # enables dict-like access on rows
    conn.execute("PRAGMA journal_mode=WAL")  # Write-Ahead-Logging
    return conn

def init_db():
    """Create the reports table if it doesn't exist."""
    os.makedirs(os.path.dirname(Config.DB_PATH), exist_ok=True)
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            flight_id       TEXT    UNIQUE NOT NULL,
            flyer_id        TEXT    NOT NULL,
            location        TEXT    NOT NULL,
            date            TEXT    NOT NULL,
            start_time      TEXT,
            end_time        TEXT,
            drone_model     TEXT,
            flight_notes    TEXT,
            status          TEXT,
            created_at      TEXT    NOT NULL,
            updated_at      TEXT    NOT NULL
        )
    """)
    conn.commit()
    conn.close()