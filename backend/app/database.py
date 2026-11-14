import os
import logging
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv

# Load backend/.env specifically
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger("tradeproof.database")

def get_mongo_uri():
    return os.getenv("MONGODB_URI", "mongodb://localhost:27017")

def get_mongo_dbname():
    return os.getenv("MONGODB_DB_NAME", "tradeproof_prod")

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None
_is_connected: bool = False

async def connect_to_mongo():
    global client, db, _is_connected
    uri = get_mongo_uri()
    dbname = get_mongo_dbname()
    try:
        client = AsyncIOMotorClient(
            uri,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
        )
        db = client[dbname]
        # Quick ping to test connectivity
        await client.admin.command('ping')
        _is_connected = True
        logger.info(f"Successfully connected to MongoDB ({dbname})")
    except Exception as e:
        _is_connected = False
        logger.warning(
            f"MongoDB connection could not be established: {e}. "
            f"Ensure MongoDB is running or check MONGODB_URI in backend/.env"
        )

async def close_mongo_connection():
    global client, _is_connected
    if client:
        client.close()
        _is_connected = False
        logger.info("MongoDB connection closed.")

def get_database() -> AsyncIOMotorDatabase | None:
    return db

def is_connected() -> bool:
    return _is_connected
