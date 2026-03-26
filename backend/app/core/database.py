from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_db():
    global client, db
    logger.info("Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]
    # Create indexes
    await _create_indexes()
    logger.info("MongoDB connected.")


async def disconnect_db():
    global client
    if client:
        client.close()
        logger.info("MongoDB disconnected.")


async def _create_indexes():
    await db.users.create_index("email", unique=True)
    await db.meetings.create_index("owner_id")
    await db.tasks.create_index("meeting_id")
    await db.tasks.create_index("assigned_to")
    await db.notifications.create_index("user_id")
    await db.logs.create_index("task_id")
    await db.meeting_data.create_index("meeting_id")


def get_db() -> AsyncIOMotorDatabase:
    return db
