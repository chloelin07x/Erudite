from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

# Create connection to PostgreSQL
engine = create_engine(
    DATABASE_URL,
    echo=False)

# Create sessions for interacting with the database
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for all models
Base = declarative_base()

def get_db():
    db = SessionLocal() # opens connection
    try:
        yield db        # give it to route
    finally:
        db.close()      # close after route finishes