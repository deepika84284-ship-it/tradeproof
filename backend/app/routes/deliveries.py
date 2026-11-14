import time
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.models.schemas import DeliveryDispatch, DeliveryItemCheck
from app.services.store import get_all, get_by_id, insert_one, update_one

router = APIRouter(prefix="/api/deliveries", tags=["Deliveries"])

class VerifyDeliveryRequest(BaseModel):
    checkedItems: List[DeliveryItemCheck]
    proofFile: str
    acceptPartial: bool
    verifiedBy: str

@router.get("", response_model=List[DeliveryDispatch])
async def list_dispatches():
    return await get_all("dispatches")

@router.post("", response_model=DeliveryDispatch)
async def create_dispatch(dispatch: DeliveryDispatch):
    d_dict = dispatch.model_dump()
    if not d_dict.get("id"):
        d_dict["id"] = f"dsp-{int(time.time())}"
    await insert_one("dispatches", d_dict)

    # Update corresponding PO status
    po_status = "Partially Dispatched" if d_dict.get("isPartialDispatch") else "Dispatched"
    await update_one("purchase_orders", d_dict["poId"], {"status": po_status})
    return d_dict

@router.post("/{dispatch_id}/verify")
async def verify_delivery(dispatch_id: str, req: VerifyDeliveryRequest):
    dispatch = await get_by_id("dispatches", dispatch_id)
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")

    new_status = "Partial Delivery Accepted" if req.acceptPartial else "Verified & Accepted"
    proof_files = dispatch.get("proofFiles", [])
    if req.proofFile and req.proofFile not in proof_files:
        proof_files.append(req.proofFile)

    items_dict = [it.model_dump() for it in req.checkedItems]

    await update_one("dispatches", dispatch_id, {
        "status": new_status,
        "items": items_dict,
        "proofFiles": proof_files,
        "verifiedBy": req.verifiedBy,
        "verifiedAt": datetime.now().strftime("%Y-%m-%d %H:%M"),
    })

    # Update line item received quantities on corresponding PO
    po = await get_by_id("purchase_orders", dispatch["poId"])
    if po:
        po_items = po.get("items", [])
        for li in po_items:
            match = next((ci for ci in items_dict if ci["lineItemId"] == li["id"]), None)
            if match:
                li["receivedQty"] = match["verifiedReceivedQty"]
        po_status = "Partially Delivered" if req.acceptPartial else "Delivered"
        await update_one("purchase_orders", po["id"], {"status": po_status, "items": po_items})

    return {"message": "Delivery verified successfully", "status": new_status}
