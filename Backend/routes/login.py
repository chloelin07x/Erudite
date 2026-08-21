from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from schemas import LoginRequest
from models import User
from database import get_db
from auth import verify_password, create_access_token, get_current_user

router = APIRouter()

@router.post("/")
async def login(request : LoginRequest, db : Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if user is None:
        raise HTTPException(status_code=401, detail=f"Invalid email or password")
    
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail=f"Invalid email or password")
    
    token = create_access_token(user.user_id)
    return {"access_token" : token, "token_type" : "bearer"}
    
@router.get("/me")
async def get_me(
    current_user: int = Depends(get_current_user)
):
    return {"userId": current_user}