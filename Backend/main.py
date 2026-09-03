from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models

from routes.tasks import router as tasks_router
from routes.modules import router as modules_router
from routes.users import router as users_router
from routes.subtasks import router as subtasks_router
from routes.login import router as login_router
from routes.dashboard import router as dashboard_router
from routes.scheduler import router as scheduler_router


Base.metadata.create_all(bind=engine) # Creates database tables
app = FastAPI()

origins = [
  "http://localhost:5173",
  "https://erudite-yo49.onrender.com",
  "https://erudite-gamma.vercel.app"]

app.add_middleware(CORSMiddleware,
                   allow_origins=origins,
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"])

app.include_router(
    tasks_router,
    prefix="/tasks",
    tags=["Tasks"]
)

app.include_router(
    modules_router,
    prefix="/modules",
    tags=["Modules"]
)

app.include_router(
    users_router,
    prefix="/user",
    tags=["User"]
)

app.include_router(
    subtasks_router,
    prefix="/subtasks",
    tags=["Subtasks"]
)

app.include_router(
    login_router,
    prefix="/login",
    tags=["Login"]
)

app.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

app.include_router(
    scheduler_router,
    prefix="/schedule",
    tags=["Schedule"]
)

@app.get("/")
def root():
    return {"message": "Study Planner API Running"}
