from pydantic import BaseModel
from typing import Optional

# ---------- Request models ----------

class CreateReportRequest(BaseModel):
    flightId: str
    flyerId: str
    location: str
    date: str
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    droneModel: Optional[str] = None
    flightNotes: Optional[str] = None
    status: Optional[str] = "pending"

class UpdateReportRequest(BaseModel):
    flightNotes: Optional[str] = None
    status: Optional[str] = None

# ---------- Response models ----------

class ReportResponse(BaseModel):
    flight_id: str
    flyer_id: str
    location: str
    date: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    drone_model: Optional[str] = None
    flight_notes: Optional[str] = None
    status: Optional[str] = None
    created_at: str
    updated_at: str

class MessageResponse(BaseModel):
    message: str