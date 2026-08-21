from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from auth import get_current_user

from schemas import TaskResponse, SubTaskResponse
from typing import List
from models import Module, Task, SubTask
from datetime import datetime, timedelta

router = APIRouter()

class DashboardResponse(BaseModel):
    all_incomplete_tasks : List[TaskResponse]
    all_tasks_due_today : List[TaskResponse]
    all_tasks_due_this_week : List[TaskResponse]

    all_incomplete_subtasks : List[SubTaskResponse]

    total_tasks : int
    complete_tasks : int
    incomplete_tasks : int
    tasks_due_today : int
    tasks_due_this_week : int

    total_subtasks : int
    completed_subtasks : int
    incomplete_subtasks : int
    
    class Config:
        from_attributes = True

@router.get("/", response_model=DashboardResponse)
async def get_dashboard(current_user : int = Depends(get_current_user), 
                        db : Session = Depends(get_db)):
    
    today    = datetime.now().date()     # today
    week_end = today + timedelta(days=7) # date in a week (7 days)

    base_tasks       = db.query(Task).join(Module).filter(Module.user_id == current_user)
    all_tasks        = base_tasks.all()
    incomplete_tasks = base_tasks.filter(Task.completed == False).all()
    tasks_due_today  = base_tasks.filter(Task.due_date == today).all()
    tasks_due_week   = base_tasks.filter(Task.due_date >= today, 
                                         Task.due_date <= week_end).all()

    base_subtasks       = db.query(SubTask).join(Task).join(Module).filter(Module.user_id == current_user)
    all_subtasks        = base_subtasks.all()
    incomplete_subtasks = base_subtasks.filter(SubTask.completed == False).all()

    return DashboardResponse(
        all_incomplete_tasks    = incomplete_tasks,
        all_tasks_due_today     = tasks_due_today,
        all_tasks_due_this_week = tasks_due_week,

        all_incomplete_subtasks = incomplete_subtasks,

        total_tasks         = len(all_tasks),
        complete_tasks      = len(all_tasks) - len(incomplete_tasks),
        incomplete_tasks    = len(incomplete_tasks),
        tasks_due_today     = len(tasks_due_today),
        tasks_due_this_week = len(tasks_due_week),

        total_subtasks      = len(all_subtasks),
        completed_subtasks  = len(all_subtasks) - len(incomplete_subtasks),
        incomplete_subtasks = len(incomplete_subtasks)
    )