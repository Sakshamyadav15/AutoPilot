from fastapi import APIRouter, Depends, status, HTTPException
from app.services.notification_service import (
    get_notifications,
    mark_notification_read,
    mark_all_notifications_read,
    delete_notification,
)
from app.core.security import get_current_user
from app.core.database import get_db

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/{user_id}")
async def get_user_notifications(
    user_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    # Users can only view their own notifications (admins can view any)
    if current_user["role"] != "admin" and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return await get_notifications(user_id, db=db)


@router.post("/{notification_id}/read")
async def mark_notification_read_route(
    notification_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await mark_notification_read(notification_id, user_id=current_user["id"], db=db)


@router.post("/mark-all-read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_notifications_read_route(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    await mark_all_notifications_read(user_id=current_user["id"], db=db)
    return None


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification_route(
    notification_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    await delete_notification(notification_id, user_id=current_user["id"], db=db)
    return None
