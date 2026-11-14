import time
from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from app.models.schemas import InvoiceRecord
from app.services.store import get_all, get_by_id, insert_one, update_one

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])

class RejectInvoiceRequest(BaseModel):
    reason: str

@router.get("", response_model=List[InvoiceRecord])
async def list_invoices():
    return await get_all("invoices")

@router.post("", response_model=InvoiceRecord)
async def upload_invoice(invoice: InvoiceRecord):
    inv_dict = invoice.model_dump()
    if not inv_dict.get("id"):
        inv_dict["id"] = f"inv-{int(time.time())}"
    await insert_one("invoices", inv_dict)
    return inv_dict

@router.put("/{inv_id}/approve")
async def approve_invoice(inv_id: str):
    updated = await update_one("invoices", inv_id, {"status": "Approved for Payment"})
    if not updated:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"message": "Invoice approved for payment", "invoiceId": inv_id}

@router.put("/{inv_id}/reject")
async def reject_invoice(inv_id: str, req: RejectInvoiceRequest):
    updated = await update_one("invoices", inv_id, {
        "status": "Rejected",
        "mismatchDetails": req.reason,
    })
    if not updated:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"message": "Invoice rejected", "invoiceId": inv_id, "reason": req.reason}
