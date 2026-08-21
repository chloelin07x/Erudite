from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
from auth import get_current_user
from models import Module
from schemas import CreateModuleRequest, UpdateModuleRequest, ModuleResponse, TaskResponse
from typing import List

router = APIRouter()

def check_owned_module(db : Session,
                      module_id : int,
                      user_id : int) -> Module:
    
    # Check that the current_user owns the module
    module = db.query(Module).filter(Module.user_id == user_id,
                                     Module.module_id == module_id).first()
    
    if module is None:
        raise HTTPException(status_code=404, detail=f"Module not found")
    
    return module

@router.post("/", response_model=ModuleResponse)
async def create_module(module : CreateModuleRequest, 
                        current_user = Depends(get_current_user), 
                        db : Session = Depends(get_db)):

    new_module = Module (
        user_id     = current_user,
        module_name = module.module_name
    )

    db.add(new_module)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Module already exists")

    db.refresh(new_module)
    return new_module

@router.get("/", response_model=List[ModuleResponse])
async def get_all_modules(current_user = Depends(get_current_user), 
                          db : Session = Depends(get_db)):
    
    return db.query(Module).filter(Module.user_id == current_user).all()

@router.get("/{module_id}", response_model=ModuleResponse)
async def get_module(module_id : int,
                     current_user = Depends(get_current_user),
                     db : Session = Depends(get_db)):
    
    return check_owned_module(db, module_id, current_user)

@router.get("/{module_id}/tasks", response_model=List[TaskResponse])
async def get_module_tasks(module_id : int, 
                           current_user : int = Depends(get_current_user),
                           db : Session = Depends(get_db)):
    
    # Check that the current_user owns the module
    module = check_owned_module(db, module_id, current_user)
    
    return module.tasks

@router.put("/{module_id}", response_model=ModuleResponse)
async def update_module(module_id : int, 
                        new_module : UpdateModuleRequest, 
                        current_user = Depends(get_current_user), 
                        db : Session = Depends(get_db)):
    
    old_module = check_owned_module(db, module_id, current_user)
    
    if new_module.module_name is not None:
        old_module.module_name = new_module.module_name
    
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Unique Constraint violation")
    
    return old_module

@router.delete("/{module_id}")
async def delete_module(module_id : int, 
                        current_user = Depends(get_current_user), 
                        db : Session=Depends(get_db)):
    
    module = check_owned_module(db, module_id, current_user)
    
    module_name = module.module_name
    db.delete(module)
    db.commit()

    return {"message" : f"Module '{module_name}' deleted successfully"}