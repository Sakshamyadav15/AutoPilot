from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse
from app.utils.helpers import serialize_doc
import logging

logger = logging.getLogger(__name__)


async def signup(request: SignupRequest, db: AsyncIOMotorDatabase) -> dict:
    existing = await db.users.find_one({"email": request.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user_doc = {
        "name": request.name,
        "email": request.email,
        "password": hash_password(request.password),
        "role": request.role,
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    logger.info(f"New user registered: {request.email}")
    return serialize_doc(user_doc)


async def login(request: LoginRequest, db: AsyncIOMotorDatabase) -> TokenResponse:
    user = await db.users.find_one({"email": request.email})
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "role": user["role"]})
    logger.info(f"User logged in: {request.email}")

    return TokenResponse(
        access_token=token,
        user_id=user_id,
        name=user["name"],
        email=user["email"],
        role=user["role"],
    )
