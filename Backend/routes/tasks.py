from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from schemas import CreateTaskRequest, UpdateTaskRequest, TaskResponse, SubTaskResponse
from database import get_db
from auth import get_current_user
from models import Task, Module
from typing import List

router = APIRouter()

def check_owned_task(db : Session,
                     task_id : int,
                     user_id : int) -> Task:
    
    task = db.query(Task).join(Module).filter(
        Task.task_id == task_id,
        Module.user_id == user_id
    ).first()

    if task is None:
        raise HTTPException(status_code=404, detail=f"Task not found")
    
    return task


@router.post("/", response_model=TaskResponse)
async def create_task(task : CreateTaskRequest, 
                      current_user = Depends(get_current_user), 
                      db: Session = Depends(get_db)):
    
    # Module belongs to the user, and task belongs to the module
    module = db.query(Module).filter(Module.user_id == current_user,
                                     Module.module_id == task.module_id).first()

    if module is None:
        raise HTTPException(status_code=404, detail=f"Failed to create new task")
    
    new_task = Task(
        module_id = task.module_id,
        task_name = task.task_name,
        due_date = task.due_date,
        due_time = task.due_time,
        completed = False
    )

    db.add(new_task)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Module already has this task")
    
    db.refresh(new_task) #populates new_task.id with the value assigned by DB
    return new_task

@router.get("/", response_model=List[TaskResponse])
async def get_all_tasks(current_user = Depends(get_current_user), 
                        db : Session = Depends(get_db)):

    tasks = db.query(Task).join(Module).filter(
        Module.user_id == current_user).all()
        
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id : int, 
                   current_user = Depends(get_current_user),
                   db : Session = Depends(get_db)):
    
    task = check_owned_task(db, task_id, current_user)
    return task

@router.get("/{task_id}/subtasks", response_model=List[SubTaskResponse])
async def get_task_subtasks(task_id : int, 
                            current_user = Depends(get_current_user),
                            db : Session = Depends(get_db)):
    
    main_task = check_owned_task(db, task_id, current_user)
    return main_task.subtasks

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id : int, 
                      new_task : UpdateTaskRequest, 
                      current_user = Depends(get_current_user),
                      db : Session = Depends(get_db)):
    
    old_task = check_owned_task(db, task_id, current_user)
    
    # Only update fields changed
    if new_task.module_id is not None:
        # Checks if the new module is one the user owns
        module = db.query(Module).filter(
            Module.module_id == new_task.module_id,
            Module.user_id == current_user
        ).first()

        if module is None:
            raise HTTPException(status_code=404, detail=f"Failed to update task")
        
        old_task.module_id = new_task.module_id

    if new_task.task_name is not None:
        old_task.task_name = new_task.task_name

    if new_task.due_date is not None:
        old_task.due_date = new_task.due_date

    if new_task.due_time is not None:
        old_task.due_time = new_task.due_time
    
    if new_task.completed is not None:
        old_task.completed = new_task.completed

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Unique Constraint violation")
        
    return old_task

@router.delete("/{task_id}")
async def delete_task(task_id : int, 
                      current_user = Depends(get_current_user),
                      db : Session = Depends(get_db)):
    
    task = check_owned_task(db, task_id, current_user)
    
    task_name = task.task_name
    db.delete(task)
    db.commit()

    return {"message" : f"Task '{task_name}' deleted successfully"}