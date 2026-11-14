import time
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from app.models.schemas import DisputeRecord, DisputeComment, EvidenceFile
from app.services.store import get_all, get_by_id, insert_one, update_one

router = APIRouter(prefix="/api/disputes", tags=["Disputes"])

class AddCommentRequest(BaseModel):
    authorName: str
    authorCompany: str
    message: str

class AddEvidenceRequest(BaseModel):
    filename: str
    uploadedBy: str

class ResolveDisputeRequest(BaseModel):
    resolutionSummary: str

@router.get("", response_model=List[DisputeRecord])
async def list_disputes():
    return await get_all("disputes")

@router.post("", response_model=DisputeRecord)
async def create_dispute(dispute: DisputeRecord):
    d_dict = dispute.model_dump()
    if not d_dict.get("id"):
        d_dict["id"] = f"disp-{int(time.time())}"
    await insert_one("disputes", d_dict)
    return d_dict

@router.post("/{dispute_id}/comments")
async def add_comment(dispute_id: str, req: AddCommentRequest):
    disp = await get_by_id("disputes", dispute_id)
    if not disp:
        raise HTTPException(status_code=404, detail="Dispute not found")

    new_comment = {
        "id": f"c-{int(time.time())}",
        "authorName": req.authorName,
        "authorCompany": req.authorCompany,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "message": req.message,
    }
    comments = disp.get("comments", [])
    comments.append(new_comment)
    await update_one("disputes", dispute_id, {"comments": comments})
    return new_comment

@router.post("/{dispute_id}/evidence")
async def add_evidence(dispute_id: str, req: AddEvidenceRequest):
    disp = await get_by_id("disputes", dispute_id)
    if not disp:
        raise HTTPException(status_code=404, detail="Dispute not found")

    new_evidence = {
        "name": req.filename,
        "uploadedBy": req.uploadedBy,
        "uploadedAt": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "hash": f"sha256:{hex(int(time.time()))[2:]}...e1a",
    }
    files = disp.get("evidenceFiles", [])
    files.append(new_evidence)
    await update_one("disputes", dispute_id, {"evidenceFiles": files})
    return new_evidence

@router.put("/{dispute_id}/resolve")
async def resolve_dispute(dispute_id: str, req: ResolveDisputeRequest):
    disp = await get_by_id("disputes", dispute_id)
    if not disp:
        raise HTTPException(status_code=404, detail="Dispute not found")

    await update_one("disputes", dispute_id, {
        "status": "Resolved",
        "resolutionSummary": req.resolutionSummary,
    })
    return {"message": "Dispute resolved successfully", "disputeId": dispute_id}
