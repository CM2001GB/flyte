from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timezone
from app.database import get_connection
from app.models import (
    CreateReportRequest, UpdateReportRequest,
    ReportResponse, MessageResponse,
)

router = APIRouter(prefix="/reports", tags=["reports"])


def row_to_dict(row):
    """Convert a sqlite3.Row to a plain dict."""
    return dict(row) if row else None


@router.post("", response_model=ReportResponse, status_code=201)
def create_report(payload: CreateReportRequest):
    conn = get_connection()
    try:
        now = datetime.now(timezone.utc).isoformat()

        conn.execute(
            """INSERT INTO reports
               (flight_id, flyer_id, location, date,
                start_time, end_time, drone_model, flight_notes,
                status, created_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (
                payload.flightId,
                payload.flyerId,
                payload.location,
                payload.date,
                payload.startTime,
                payload.endTime,
                payload.droneModel,
                payload.flightNotes,
                payload.status or "pending",
                now,
                now,
            ),
        )
        conn.commit()

        row = conn.execute(
            "SELECT * FROM reports WHERE flight_id = ?", (payload.flightId,)
        ).fetchone()

        print(f"[ReportService] Created report for flight {payload.flightId}")
        return row_to_dict(row)
    finally:
        conn.close()


@router.get("", response_model=list[ReportResponse])
def list_reports(flyerId: str = Query(..., description="Flyer ID to filter by")):
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM reports WHERE flyer_id = ? ORDER BY created_at DESC",
            (flyerId,),
        ).fetchall()
        return [row_to_dict(r) for r in rows]
    finally:
        conn.close()


@router.get("/{flight_id}", response_model=ReportResponse)
def get_report(flight_id: str):
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM reports WHERE flight_id = ?", (flight_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")
        return row_to_dict(row)
    finally:
        conn.close()


@router.put("/{flight_id}", response_model=ReportResponse)
def update_report(flight_id: str, payload: UpdateReportRequest):
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM reports WHERE flight_id = ?", (flight_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")

        existing = row_to_dict(row)
        flight_notes = payload.flightNotes if payload.flightNotes is not None else existing["flight_notes"]
        status = payload.status if payload.status is not None else existing["status"]
        now = datetime.now(timezone.utc).isoformat()

        conn.execute(
            "UPDATE reports SET flight_notes = ?, status = ?, updated_at = ? WHERE flight_id = ?",
            (flight_notes, status, now, flight_id),
        )
        conn.commit()

        updated = conn.execute(
            "SELECT * FROM reports WHERE flight_id = ?", (flight_id,)
        ).fetchone()

        print(f"[ReportService] Updated report for flight {flight_id}")
        return row_to_dict(updated)
    finally:
        conn.close()


@router.delete("/{flight_id}", response_model=MessageResponse)
def delete_report(flight_id: str):
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM reports WHERE flight_id = ?", (flight_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")

        conn.execute("DELETE FROM reports WHERE flight_id = ?", (flight_id,))
        conn.commit()

        print(f"[ReportService] Deleted report for flight {flight_id}")
        return MessageResponse(message="Report deleted")
    finally:
        conn.close()