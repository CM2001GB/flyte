from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from bson import ObjectId
from app.db import get_users, get_sessions
from app.models import (
    RegisterRequest, RegisterResponse,
    LoginRequest, LoginResponse,
    ProfileResponse, MessageResponse,
)
from app.auth import (
    hash_password, verify_password, create_token, decode_token, extract_bearer,
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(payload: RegisterRequest):
    users = get_users()

    existing = await users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    doc = {
        "first_name": payload.first_name,
        "last_name": payload.last_name,
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "drone_registration_number": payload.drone_registration_number,
        "flyer_id": payload.flyer_id,
        "created_at": datetime.now(timezone.utc),
    }
    result = await users.insert_one(doc)

    return RegisterResponse(
        user_id=str(result.inserted_id),
        email=doc["email"],
    )

@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    users = get_users()

    user = await users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    token = create_token(user_id, user["email"])
    return LoginResponse(token=token, user_id=user_id, email=user["email"])

@router.post("/logout", response_model=MessageResponse)
async def logout(token: str = Depends(extract_bearer)):
    sessions = get_sessions()
    payload = decode_token(token)

    # Store token in sessions blacklist until it would naturally expire
    await sessions.insert_one({
        "token": token,
        "user_id": payload["sub"],
        "blacklisted_at": datetime.now(timezone.utc),
        "expires_at": datetime.fromtimestamp(payload["exp"], tz=timezone.utc),
    })
    return MessageResponse(message="Logged out")

@router.get("/profile", response_model=ProfileResponse)
async def profile(token: str = Depends(extract_bearer)):
    payload = decode_token(token)

    # Reject blacklisted tokens
    sessions = get_sessions()
    blacklisted = await sessions.find_one({"token": token})
    if blacklisted:
        raise HTTPException(status_code=401, detail="Token has been revoked")

    users = get_users()
    user = await users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return ProfileResponse(
        user_id=str(user["_id"]),
        first_name=user["first_name"],
        last_name=user["last_name"],
        email=user["email"],
        drone_registration_number=user.get("drone_registration_number"),
        flyer_id=user.get("flyer_id"),
    )
