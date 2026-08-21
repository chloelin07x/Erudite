from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from schemas import ScheduledSlotRequest, ScheduledResponse, UpdateScheduledSlotRequest, ScheduledSlotResponse, CreateScheduledSlotRequest
from database import get_db
from auth import get_current_user
from models import User, Module, Task, SubTask, ScheduledSlot
from datetime import date, timedelta

router = APIRouter()

@router.post("/", response_model=ScheduledResponse)
def schedule_tasks(user_id : int = Depends(get_current_user),
                   db : Session = Depends(get_db)):

    user = db.query(User).filter(User.user_id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail=f"Cannot generate schedule")

    all_subtasks = db.query(SubTask).join(Task).join(Module).filter(
        Module.user_id == user_id,
        SubTask.completed == False,
        SubTask.manually_moved == False).order_by(Task.due_date.asc(),
                                          Task.due_time.asc(),
                                          SubTask.priority.asc()).all()

    today = date.today()
    hours_capacity = round(user.hours_per_day, 2)

    day = 0
    schedule = []

    for subtask in all_subtasks:
        hours = round(subtask.estimated_hours, 2)

        db.query(ScheduledSlot).filter(
            ScheduledSlot.subtask_id == subtask.subtask_id).delete()

        while hours >= hours_capacity:
            hours -= hours_capacity

            db_slot = ScheduledSlot(
                subtask_id      = subtask.subtask_id,
                scheduled_date  = today + timedelta(days=day),
                allocated_hours = round(hours_capacity, 2)
            )
            db.add(db_slot)
            db.flush()  # assigns db_slot.scheduled_task_id without committing yet

            schema_slot = ScheduledSlotRequest(
                scheduled_task_id = db_slot.scheduled_task_id,
                subtask_id        = subtask.subtask_id,
                task_name         = subtask.task.task_name,
                subtask_desc      = subtask.description,
                assigned_date     = db_slot.scheduled_date,
                assigned_hours    = db_slot.allocated_hours,
                priority          = subtask.priority,
                due_date          = subtask.task.due_date
            )
            schedule.append(schema_slot)

            day += 1
            hours_capacity = round(user.hours_per_day, 2)

        if hours <= 0:
            continue

        if hours > 0 and hours < hours_capacity:
            db_slot = ScheduledSlot(
                subtask_id      = subtask.subtask_id,
                scheduled_date  = today + timedelta(days=day),
                allocated_hours = round(hours, 2)
            )
            db.add(db_slot)
            db.flush()

            schema_slot = ScheduledSlotRequest(
                scheduled_task_id = db_slot.scheduled_task_id,
                subtask_id        = subtask.subtask_id,
                task_name         = subtask.task.task_name,
                subtask_desc      = subtask.description,
                assigned_date     = db_slot.scheduled_date,
                assigned_hours    = db_slot.allocated_hours,
                priority          = subtask.priority,
                due_date          = subtask.task.due_date
            )
            schedule.append(schema_slot)

            hours_capacity -= round(hours, 2)

    db.commit()
    return {"schedule": schedule}


@router.get("/", response_model=ScheduledResponse)
async def get_schedule(current_user : int = Depends(get_current_user),
                       db : Session = Depends(get_db)):

    slots = db.query(ScheduledSlot).join(SubTask).join(Task).join(Module).filter(
        Module.user_id == current_user).all()

    schedule = [
        ScheduledSlotRequest(
            scheduled_task_id = slot.scheduled_task_id,
            subtask_id        = slot.subtask_id,
            task_name         = slot.subtask.task.task_name,
            subtask_desc      = slot.subtask.description,
            assigned_date     = slot.scheduled_date,
            assigned_hours    = round(slot.allocated_hours, 2),
            priority          = slot.subtask.priority,
            due_date          = slot.subtask.task.due_date
        )
        for slot in slots
    ]

    return {"schedule": schedule}


@router.post("/manual", response_model=ScheduledSlotResponse)
async def create_manual_slot(new_slot : CreateScheduledSlotRequest,
                             current_user : int = Depends(get_current_user),
                             db : Session = Depends(get_db)):

    # Confirm the subtask actually belongs to this user
    subtask = db.query(SubTask).join(Task).join(Module).filter(
        SubTask.subtask_id == new_slot.subtask_id,
        Module.user_id == current_user).first()

    if subtask is None:
        raise HTTPException(status_code=404, detail="Subtask not found")

    db_slot = ScheduledSlot(
        subtask_id      = new_slot.subtask_id,
        scheduled_date  = new_slot.scheduled_date,
        allocated_hours = new_slot.allocated_hours
    )
    db.add(db_slot)

    # A manually created slot should also be excluded from the next auto-run
    subtask.manually_moved = True

    db.commit()
    db.refresh(db_slot)

    return db_slot


@router.put("/{scheduled_task_id}", response_model=ScheduledSlotResponse)
async def update_scheduled_subtask(scheduled_task_id : int,
                                   new_scheduled_task : UpdateScheduledSlotRequest,
                                   current_user : int = Depends(get_current_user),
                                   db : Session = Depends(get_db)):

    slot = db.query(ScheduledSlot).join(SubTask).join(Task).join(Module).filter(
        ScheduledSlot.scheduled_task_id == scheduled_task_id,
        Module.user_id == current_user).first()

    if slot is None:
        raise HTTPException(status_code=404, detail="Error trying to update schedule")

    if new_scheduled_task.assigned_date is not None:
        slot.scheduled_date = new_scheduled_task.assigned_date

    if new_scheduled_task.assigned_hours is not None:
        slot.allocated_hours = new_scheduled_task.assigned_hours

    slot.subtask.manually_moved = True

    db.commit()
    db.refresh(slot)

    return slot


@router.delete("/")
async def delete_all_slots(current_user : int = Depends(get_current_user),
                           db : Session = Depends(get_db)):

    subtask_ids = db.query(SubTask.subtask_id).join(Task).join(Module).filter(
        Module.user_id == current_user).subquery()

    db.query(ScheduledSlot).filter(
        ScheduledSlot.subtask_id.in_(subtask_ids)).delete(synchronize_session=False)
    db.commit()

    return {"message" : f"Schedule for User {current_user} deleted successfully"}


@router.delete("/{scheduled_task_id}")
async def delete_scheduled_slot(scheduled_task_id : int,
                                current_user : int = Depends(get_current_user),
                                db : Session = Depends(get_db)):

    slot = db.query(ScheduledSlot).join(SubTask).join(Task).join(Module).filter(
        ScheduledSlot.scheduled_task_id == scheduled_task_id,
        Module.user_id == current_user).first()

    if slot is None:
        raise HTTPException(status_code=404, detail="Error trying to update schedule")

    db.delete(slot)
    db.commit()

    return {"message" : "Scheduled subtask successfully deleted"}