from fastapi import APIRouter
from typing import List
from app.models.schemas import NotificationItem
from app.services.store import get_all, update_one, memory_store

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationItem])
async def list_notifications():
    return await get_all("notifications")

@router.put("/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    await update_one("notifications", notification_id, {"read": True})
    return {"message": "Notification marked read", "id": notification_id}

@router.put("/read-all")
async def mark_all_read():
    notifications = memory_store.get("notifications", [])
    for n in notifications:
        n["read"] = True
    return {"message": "All notifications marked read"}
