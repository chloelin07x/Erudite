from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models import SubTask, Task, Module
from schemas import CreateSubTaskRequest, UpdateSubTaskRequest, SubTaskResponse
from database import get_db
from auth import get_current_user
from typing import List

router = APIRouter()

def check_owned_subtask(db : Session,
                        subtask_id : int,
                        user_id : int) -> SubTask:
    
    subtask = db.query(SubTask).join(Task).join(Module).filter(
        SubTask.subtask_id == subtask_id,
        Module.user_id == user_id).first()
    
    if subtask is None:
        raise HTTPException(status_code=404, detail=f"Subtask not found")
    
    return subtask

@router.post("/", response_model=SubTaskResponse)
async def create_subtask(subtask : CreateSubTaskRequest,
                        current_user = Depends(get_current_user),
                        db : Session = Depends(get_db)):
    
    # Check the task belongs to the user,
    task = db.query(Task).join(Module).filter(
        Task.task_id == subtask.task_id,
        Module.user_id == current_user).first()

    if task is None:
        raise HTTPException(status_code=404, detail=f"Failed to create new subtask")
    
    new_subtask = SubTask(
        task_id        = subtask.task_id,
        priority       = subtask.priority,
        description    = subtask.description,
        completed      = subtask.completed,
        estimated_hours = subtask.estimated_hours,
        manually_moved  = subtask.manually_moved
    )

    db.add(new_subtask)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Task already has this subtask")

    return new_subtask

@router.get("/{subtask_id}", response_model=SubTaskResponse)
async def get_subtask(subtask_id : int, 
                      current_user = Depends(get_current_user),
                      db : Session = Depends(get_db)):
    
    subtask = check_owned_subtask(db, subtask_id, current_user)
    return subtask

@router.get("/", response_model=List[SubTaskResponse])
async def get_all_subtask(current_user = Depends(get_current_user),
                        db : Session = Depends(get_db)):
    
    subtasks = db.query(SubTask).join(Task).join(Module).filter(Module.user_id == current_user).all()
    return subtasks

@router.put("/{subtask_id}", response_model=SubTaskResponse)
async def update_subtask(subtask_id : int, 
                         new_subtask : UpdateSubTaskRequest, 
                         current_user = Depends(get_current_user),
                         db : Session = Depends(get_db)):
    
    old_subtask = check_owned_subtask(db, subtask_id, current_user)

    if new_subtask.task_id is not None:
        # Check that the reassigned task belongs to the user also
        task = db.query(Task).join(Module).filter(
            Task.task_id == new_subtask.task_id,
            Module.user_id == current_user).first()
        
        if task is None:
            raise HTTPException(status_code=404, detail=f"Failed to update subtask details")
        
        old_subtask.task_id = new_subtask.task_id

    if new_subtask.priority is not None:
        old_subtask.priority = new_subtask.priority

    if new_subtask.description is not None:
        old_subtask.description = new_subtask.description

    if new_subtask.completed is not None:
        old_subtask.completed = new_subtask.completed

    if new_subtask.estimated_hours is not None:
        old_subtask.estimated_hours = new_subtask.estimated_hours

    if new_subtask.manually_moved is not None:
        old_subtask.manually_moved = new_subtask.manually_moved

    db.commit()
    db.refresh(old_subtask)

    return old_subtask

@router.delete("/{subtask_id}")
async def delete_subtask(subtask_id : int, 
                         current_user = Depends(get_current_user),
                         db : Session = Depends(get_db)):
    
    subtask = check_owned_subtask(db, subtask_id, current_user)
    
    desc = subtask.description
    db.delete(subtask)
    db.commit()

    return {"message" : f"Subtask '{desc}' successfully deleted"}

@router.patch("/{subtask_id}/auto-schedule")
async def set_to_auto_schedule(subtask_id: int, 
                               current_user=Depends(get_current_user), 
                               db: Session = Depends(get_db)):
    
    subtask = check_owned_subtask(db, subtask_id, current_user)
    subtask.manually_moved = False
    db.commit()

    return {"message": "Subtask returned to auto-scheduling"}
