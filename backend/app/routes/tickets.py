import time
from datetime import datetime
from fastapi import APIRouter
from typing import List, Literal
from pydantic import BaseModel
from app.models.schemas import SupportTicket
from app.services.store import get_all, insert_one

router = APIRouter(prefix="/api/tickets", tags=["Platform Support"])

class CreateTicketRequest(BaseModel):
    subject: str
    category: Literal['Transaction Workflow', 'GST & Compliance', 'Account & RBAC', 'API & MongoDB Integration']
    body: str
    sender: str

@router.get("", response_model=List[SupportTicket])
async def list_tickets():
    return await get_all("tickets")

@router.post("", response_model=SupportTicket)
async def create_ticket(req: CreateTicketRequest):
    tickets = await get_all("tickets")
    new_ticket = {
        "id": f"tkt-{int(time.time())}",
        "ticketNumber": f"TP-SUP-{1043 + len(tickets)}",
        "subject": req.subject,
        "category": req.category,
        "priority": "Normal",
        "status": "Open",
        "createdAt": datetime.now().strftime("%Y-%m-%d"),
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
        "messages": [
            {
                "sender": req.sender,
                "time": "Just now",
                "body": req.body,
            }
        ],
    }
    await insert_one("tickets", new_ticket)
    return new_ticket
