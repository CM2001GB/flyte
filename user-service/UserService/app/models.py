from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# ---------- Request models ----------

class RegisterRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    drone_registration_number: str = Field(..., min_length=1)
    flyer_id: str = Field(..., min_length=1)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# ---------- Response models ----------

class RegisterResponse(BaseModel):
    user_id: str
    email: str

class LoginResponse(BaseModel):
    token: str
    user_id: str
    email: str
    flyer_id: str

class ProfileResponse(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    email: str
    drone_registration_number: Optional[str] = None
    flyer_id: Optional[str] = None

class MessageResponse(BaseModel):
    message: str
