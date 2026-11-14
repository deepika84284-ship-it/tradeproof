import time
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from app.models.schemas import PurchaseOrder, POAmendment
from app.services.store import get_all, get_by_id, insert_one, update_one

router = APIRouter(prefix="/api/purchase-orders", tags=["Purchase Orders"])

class AmendmentRequest(BaseModel):
    reason: str
    summary: str
    requestedBy: str

@router.get("", response_model=List[PurchaseOrder])
async def list_purchase_orders():
    return await get_all("purchase_orders")

@router.post("", response_model=PurchaseOrder)
async def create_purchase_order(po: PurchaseOrder):
    po_dict = po.model_dump()
    if not po_dict.get("id"):
        po_dict["id"] = f"po-{int(time.time())}"
    await insert_one("purchase_orders", po_dict)
    return po_dict

@router.put("/{po_id}/confirm")
async def confirm_purchase_order(po_id: str):
    updated = await update_one("purchase_orders", po_id, {"status": "Confirmed"})
    if not updated:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    return {"message": "Purchase Order confirmed", "poId": po_id, "status": "Confirmed"}

@router.post("/{po_id}/amend")
async def request_amendment(po_id: str, req: AmendmentRequest):
    po = await get_by_id("purchase_orders", po_id)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")

    next_version = po.get("version", 1) + 1
    new_amendment = {
        "id": f"amd-{int(time.time())}",
        "version": next_version,
        "requestedBy": req.requestedBy,
        "requestedAt": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "reason": req.reason,
        "summary": req.summary,
        "status": "Pending Supplier Acceptance",
    }
    amendments = po.get("amendments", [])
    amendments.append(new_amendment)

    await update_one("purchase_orders", po_id, {
        "version": next_version,
        "status": "Amendment Requested",
        "amendments": amendments,
    })
    return {"message": "Amendment requested", "version": next_version, "amendment": new_amendment}
