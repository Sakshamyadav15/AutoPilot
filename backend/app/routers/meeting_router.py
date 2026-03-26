from fastapi import APIRouter, Depends, status
from app.schemas.meeting import (
    CreateMeetingRequest,
    AddParticipantsRequest,
    MeetingResponse,
    UpdateMeetingRequest,
)
from app.schemas.meeting_data import UploadMeetingDataRequest, MeetingDataResponse
from app.services.meeting_service import (
    create_meeting,
    add_participants,
    update_meeting,
    delete_meeting,
    get_meeting,
    get_user_meetings,
)
from app.services.meeting_data_service import upload_meeting_data
from app.core.security import get_current_user
from app.core.database import get_db

router = APIRouter(prefix="/meetings", tags=["Meetings"])


@router.post("/create", status_code=201)
async def create_meeting_route(
    request: CreateMeetingRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await create_meeting(request, owner_id=current_user["id"], db=db)


@router.post("/add-participants")
async def add_participants_route(
    request: AddParticipantsRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await add_participants(request, owner_id=current_user["id"], db=db)


@router.patch("/{meeting_id}")
async def update_meeting_route(
    meeting_id: str,
    request: UpdateMeetingRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await update_meeting(meeting_id, request, user_id=current_user["id"], db=db)


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meeting_route(
    meeting_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    await delete_meeting(meeting_id, user_id=current_user["id"], db=db)
    # 204 No Content
    return None


@router.get("/")
async def get_user_meetings_route(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await get_user_meetings(user_id=current_user["id"], db=db)


@router.get("/{meeting_id}")
async def get_meeting_route(
    meeting_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await get_meeting(meeting_id, user_id=current_user["id"], db=db)


@router.post("/upload", status_code=201)
async def upload_meeting_data_route(
    request: UploadMeetingDataRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await upload_meeting_data(request, db=db)
