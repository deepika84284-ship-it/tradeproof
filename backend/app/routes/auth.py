import time
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.models.schemas import (
    LoginRequest,
    SignupRequest,
    AuthResponse,
    UserSession,
    CreateCompanyRequest,
    Company,
)
from app.services.auth_service import create_access_token
from app.services.store import memory_store, insert_one, get_all

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class SwitchCompanyRequest(BaseModel):
    companyId: str

@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    session = memory_store["user_session"]
    # Check if perspective requested
    if req.perspective:
        session["activePerspective"] = req.perspective

    token = create_access_token({"sub": session["id"], "email": session["email"]})
    return {"token": token, "user": session}

@router.post("/signup", response_model=AuthResponse)
async def signup(req: SignupRequest):
    new_user: UserSession = {
        "id": f"usr-{int(time.time())}",
        "name": req.fullName,
        "email": req.email,
        "phone": req.phone,
        "avatarUrl": "/src/assets/images/avatar_exec_india_1794640509958.jpg",
        "memberships": [
            {
                "companyId": "comp-bharat-forge",
                "role": "Owner",
                "defaultPerspective": "buyer"
            }
        ],
        "activeCompanyId": "comp-bharat-forge",
        "activePerspective": "buyer"
    }
    memory_store["user_session"] = new_user
    token = create_access_token({"sub": new_user["id"], "email": new_user["email"]})
    return {"token": token, "user": new_user}

@router.get("/session", response_model=UserSession)
async def get_session():
    return memory_store["user_session"]

@router.post("/switch-company")
async def switch_company(req: SwitchCompanyRequest):
    session = memory_store["user_session"]
    session["activeCompanyId"] = req.companyId
    membership = next((m for m in session.get("memberships", []) if m["companyId"] == req.companyId), None)
    if membership:
        session["activePerspective"] = membership["defaultPerspective"]
    return session
