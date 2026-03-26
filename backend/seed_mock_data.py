import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import hash_password
from bson import ObjectId
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_data():
    logger.info("Connecting to MongoDB for seeding data...")
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]

    # Clear old data
    await db.users.delete_many({})
    await db.meetings.delete_many({})
    await db.tasks.delete_many({})
    
    # Create Users
    demo_user_id = ObjectId()
    colleague1_id = ObjectId()
    colleague2_id = ObjectId()

    users = [
        {
            "_id": demo_user_id,
            "name": "Demo User",
            "email": "demo@example.com",
            "hashed_password": hash_password("password123"),
            "created_at": datetime.utcnow()
        },
        {
            "_id": colleague1_id,
            "name": "Alice Smith",
            "email": "alice@example.com",
            "hashed_password": hash_password("password123"),
            "created_at": datetime.utcnow()
        },
        {
            "_id": colleague2_id,
            "name": "Bob Jones",
            "email": "bob@example.com",
            "hashed_password": hash_password("password123"),
            "created_at": datetime.utcnow()
        }
    ]
    await db.users.insert_many(users)
    logger.info(f"Inserted 3 users. Demo user id: {demo_user_id}")

    # Create Meetings
    meeting_id_1 = ObjectId()
    meeting_id_2 = ObjectId()

    meetings = [
        {
            "_id": meeting_id_1,
            "title": "Q3 Planning Kickoff",
            "owner_id": str(demo_user_id),
            "owner_name": "Demo User",
            "participants": [
                {"id": str(demo_user_id), "name": "Demo User", "email": "demo@example.com"},
                {"id": str(colleague1_id), "name": "Alice Smith", "email": "alice@example.com"}
            ],
            "created_at": datetime.utcnow()
        },
        {
            "_id": meeting_id_2,
            "title": "Design Sync",
            "owner_id": str(demo_user_id),
            "owner_name": "Demo User",
            "participants": [
                {"id": str(demo_user_id), "name": "Demo User", "email": "demo@example.com"},
                {"id": str(colleague2_id), "name": "Bob Jones", "email": "bob@example.com"}
            ],
            "created_at": datetime.utcnow()
        }
    ]
    await db.meetings.insert_many(meetings)
    logger.info("Inserted 2 meetings.")

    # Create Tasks
    tasks = [
        {
            "meeting_id": str(meeting_id_1),
            "task": "Finalize Q3 roadmap document",
            "assigned_to": str(demo_user_id),
            "assignee_name": "Demo User",
            "owner_id": str(demo_user_id),
            "owner_name": "Demo User",
            "deadline": (datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%d"),
            "status": "pending",
            "created_at": datetime.utcnow()
        },
        {
            "meeting_id": str(meeting_id_1),
            "task": "Review budget allocation",
            "assigned_to": str(colleague1_id),
            "assignee_name": "Alice Smith",
            "owner_id": str(demo_user_id),
            "owner_name": "Demo User",
            "deadline": (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d"),
            "status": "completed",
            "created_at": datetime.utcnow()
        },
        {
            "meeting_id": str(meeting_id_2),
            "task": "Update Figma prototypes",
            "assigned_to": str(demo_user_id),
            "assignee_name": "Demo User",
            "owner_id": str(demo_user_id),
            "owner_name": "Demo User",
            "deadline": (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d"),
            "status": "in_progress",
            "created_at": datetime.utcnow()
        }
    ]
    await db.tasks.insert_many(tasks)
    logger.info("Inserted 3 tasks.")
    
    print("MOCK DATA SEEDED FOR DEMO SHOWCASE. Use demo@example.com / password123 to login.")

if __name__ == "__main__":
    asyncio.run(seed_data())
