import time
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import Company, CreateCompanyRequest
from app.services.store import get_all, insert_one, update_one

router = APIRouter(prefix="/api/companies", tags=["Companies"])

@router.get("", response_model=List[Company])
async def list_companies():
    return await get_all("companies")

@router.post("", response_model=Company)
async def create_company(req: CreateCompanyRequest):
    new_comp = {
        "id": f"comp-{int(time.time())}",
        "name": req.name,
        "gstin": req.gstin,
        "pan": req.gstin[2:12] if len(req.gstin) >= 12 else "AAACA1234B",
        "cinOrUdyam": "UDYAM-MH-00-0192831",
        "industry": req.industry,
        "city": req.city or "Mumbai",
        "state": "Maharashtra",
        "address": f"{req.city or 'Mumbai'} Industrial Estate",
        "verificationStatus": "Pending Review",
        "roleCapabilities": ["Buyer", "Supplier"],
        "memberCount": 1,
        "onTimeRate": 100.0,
        "disputeRate": 0.0,
        "avgSettlementDays": 30,
        "plan": "Starter MSME",
        "joinedDate": datetime.now().strftime("%Y-%m-%d"),
    }
    await insert_one("companies", new_comp)
    return new_comp

@router.put("/{company_id}/verify")
async def verify_company(company_id: str):
    res = await update_one("companies", company_id, {"verificationStatus": "Verified"})
    if not res:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"message": "Company verified successfully", "companyId": company_id}
