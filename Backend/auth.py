from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from database import get_db
from models import User

from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

# Hashing passwords
pwd_context = CryptContext(
    schemes = ['bcrypt'],
    deprecated = 'auto'
)

def hash_password(password : str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )

# JWT Access Tokens
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')

def create_access_token(userId : int):
    expire = datetime.now() + timedelta(hours=24)

    payload = {
        "sub": str(userId),
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

# Protect Routes
security = HTTPBearer() # Object that looks at the Authorization header 
                        # Authorisation header looks like: Authorization: Bearer ey293hsn023...

def get_current_user(credentials = Depends(security),
                     db : Session = Depends(get_db)):
    
    # The object 'credentials' now has .scheme (which is the Bearer string)
    # Or the .credentials (actual token string itself)
    token = credentials.credentials
    
    try:
        # Decodes the token using secret key and algorithm
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
    
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Returns the value of the key "sub" (i.e. the userId)
    user = db.query(User).filter(User.user_id == int(payload["sub"])).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User no longer exists")
    
    return int(payload["sub"])