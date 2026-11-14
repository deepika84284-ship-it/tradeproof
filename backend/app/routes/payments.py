import time
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import List, Literal
from pydantic import BaseModel
from app.models.schemas import PaymentEntry
from app.services.store import get_all, get_by_id, insert_one, update_one

router = APIRouter(prefix="/api/payments", tags=["Payments"])

class RecordPaymentRequest(BaseModel):
    amount: float
    mode: Literal['NEFT', 'RTGS', 'IMPS', 'UPI B2B', 'Cheque']
    utr: str
    recordedBy: str

@router.get("", response_model=List[PaymentEntry])
async def list_payments():
    return await get_all("payments")

@router.post("/{payment_id}/record")
async def record_payment(payment_id: str, req: RecordPaymentRequest):
    pay = await get_by_id("payments", payment_id)
    if not pay:
        raise HTTPException(status_code=404, detail="Payment record not found")

    next_paid = pay.get("amountPaid", 0) + req.amount
    invoice_total = pay.get("invoiceTotal", 0)
    next_balance = max(0, invoice_total - next_paid)
    next_status = "Confirmed" if next_balance == 0 else "Partially Paid"

    history = pay.get("history", [])
    history.append({
        "date": datetime.now().strftime("%Y-%m-%d"),
        "amount": req.amount,
        "mode": req.mode,
        "utr": req.utr,
        "recordedBy": req.recordedBy,
    })

    await update_one("payments", payment_id, {
        "amountPaid": next_paid,
        "balanceRemaining": next_balance,
        "mode": req.mode,
        "utrNumber": req.utr,
        "paidAt": datetime.now().strftime("%Y-%m-%d"),
        "status": next_status,
        "history": history,
    })

    return {"message": "Payment recorded", "paymentId": payment_id, "balanceRemaining": next_balance}

@router.put("/{payment_id}/confirm")
async def confirm_receipt(payment_id: str):
    pay = await get_by_id("payments", payment_id)
    if not pay:
        raise HTTPException(status_code=404, detail="Payment record not found")

    await update_one("payments", payment_id, {"confirmedByPayee": True})
    return {"message": "Payment confirmed by payee", "paymentId": payment_id}
