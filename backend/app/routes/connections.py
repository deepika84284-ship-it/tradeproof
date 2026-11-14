import time
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import List, Literal
from pydantic import BaseModel
from app.models.schemas import BusinessConnection, Company
from app.services.store import get_all, get_by_id, insert_one, update_one

router = APIRouter(prefix="/api/connections", tags=["Business Network"])

class SendInvitationRequest(BaseModel):
    companyId: str
    partnerCompany: Company
    relationship: Literal['Supplier', 'Buyer']
    creditDays: int

class RespondInvitationRequest(BaseModel):
    accept: bool

@router.get("", response_model=List[BusinessConnection])
async def list_connections():
    return await get_all("connections")

@router.post("", response_model=BusinessConnection)
async def send_invitation(req: SendInvitationRequest):
    new_conn = {
        "id": f"conn-{int(time.time())}",
        "companyId": req.companyId,
        "partnerCompanyId": req.partnerCompany.id,
        "partnerName": req.partnerCompany.name,
        "partnerGstin": req.partnerCompany.gstin,
        "partnerIndustry": req.partnerCompany.industry,
        "partnerCity": req.partnerCompany.city,
        "relationship": req.relationship,
        "status": "Pending Sent",
        "creditTermsDays": req.creditDays,
        "connectedSince": datetime.now().strftime("%Y-%m-%d"),
        "totalVolumeInr": 0.0,
        "activeOrdersCount": 0,
    }
    await insert_one("connections", new_conn)
    return new_conn

@router.put("/{conn_id}/respond")
async def respond_invitation(conn_id: str, req: RespondInvitationRequest):
    conn = await get_by_id("connections", conn_id)
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")

    new_status = "Connected" if req.accept else "Suspended"
    await update_one("connections", conn_id, {"status": new_status})
    return {"message": "Invitation updated", "status": new_status}
