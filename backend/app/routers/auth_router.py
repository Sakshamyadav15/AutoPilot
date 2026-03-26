from fastapi import APIRouter, Depends
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse
from app.services.auth_service import signup, login
from app.core.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", status_code=201)
async def signup_route(request: SignupRequest, db=Depends(get_db)):
    return await signup(request, db)


@router.post("/login", response_model=TokenResponse)
async def login_route(request: LoginRequest, db=Depends(get_db)):
    return await login(request, db)
