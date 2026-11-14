import time
from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from app.models.schemas import CompanyMember, MemberRole
from app.services.store import get_all, get_by_id, insert_one, update_one

router = APIRouter(prefix="/api/members", tags=["Team Members"])

class InviteMemberRequest(BaseModel):
    name: str
    email: str
    role: MemberRole
    department: str

class UpdateRoleRequest(BaseModel):
    role: MemberRole

@router.get("", response_model=List[CompanyMember])
async def list_members():
    return await get_all("members")

@router.post("", response_model=CompanyMember)
async def invite_member(req: InviteMemberRequest):
    new_mem = {
        "id": f"mem-{int(time.time())}",
        "name": req.name,
        "email": req.email,
        "phone": "+91 98000 00000",
        "role": req.role,
        "department": req.department,
        "status": "Invited",
        "lastActive": "Invite Sent",
    }
    await insert_one("members", new_mem)
    return new_mem

@router.put("/{member_id}/role")
async def update_member_role(member_id: str, req: UpdateRoleRequest):
    updated = await update_one("members", member_id, {"role": req.role})
    if not updated:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Role updated", "memberId": member_id, "role": req.role}
