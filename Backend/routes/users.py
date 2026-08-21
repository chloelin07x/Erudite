from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
from models import User
from schemas import CreateUserRequest, UpdateUserRequest, UserResponse
from auth import hash_password, get_current_user
from datetime import date

router = APIRouter()

@router.post("/", response_model=UserResponse)
async def create_user(user : CreateUserRequest, db : Session = Depends(get_db)):
    new_user = User(
        username = user.username,
        email = user.email,
        password_hash = hash_password(user.password),
        hours_per_day = user.hours_per_day,
        date_created = date.today()
    )

    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Username or email already registered")

    db.refresh(new_user)
    return new_user

@router.get("/", response_model=UserResponse)
async def get_user_details(current_user = Depends(get_current_user), 
                           db : Session = Depends(get_db)):
    
    user = db.query(User).filter(User.user_id == current_user).first()
    if user is None:
        raise HTTPException(status_code=404, detail=f"User with user_id {current_user} not found")
    
    return user
    
@router.put("/", response_model=UserResponse)
async def update_user_details(new_user : UpdateUserRequest, 
                              current_user = Depends(get_current_user),
                              db : Session = Depends(get_db)):
    
    old_user = db.query(User).filter(User.user_id == current_user).first()
    if old_user is None:
        raise HTTPException(status_code=404, detail=f"User with user_id {current_user} not found")
    
    if new_user.username is not None:
        old_user.username = new_user.username
    
    if new_user.email is not None:
        old_user.email = new_user.email

    if new_user.password is not None:
        old_user.password_hash = hash_password(new_user.password)

    if new_user.hours_per_day is not None:
        old_user.hours_per_day = new_user.hours_per_day

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Unique Constraint violation")

    return old_user

@router.delete("/")
async def delete_user(current_user = Depends(get_current_user), 
                      db : Session = Depends(get_db)):
    
    user = db.query(User).filter(User.user_id == current_user).first()
    if user is None:
        raise HTTPException(status_code=404, detail=f"User with user_id {current_user} not found")
    
    username = user.username
    db.delete(user)
    db.commit()

    return {"message" : f"User {username} deleted successfully"}