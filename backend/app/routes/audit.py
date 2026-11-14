import time
from datetime import datetime
from fastapi import APIRouter
from typing import List
from app.models.schemas import AuditEntry
from app.services.store import get_all, insert_one

router = APIRouter(prefix="/api/audit", tags=["Audit Trail"])

@router.get("", response_model=List[AuditEntry])
async def list_audit_trail():
    return await get_all("audit_trail")

@router.post("", response_model=AuditEntry)
async def append_audit_entry(entry: AuditEntry):
    entry_dict = entry.model_dump()
    if not entry_dict.get("id"):
        entry_dict["id"] = f"aud-{int(time.time())}"
    if not entry_dict.get("timestamp"):
        entry_dict["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    await insert_one("audit_trail", entry_dict)
    return entry_dict
