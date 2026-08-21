from sqlalchemy import Column, Integer, Float, String, Boolean, Date, Time
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    user_id        = Column(Integer, primary_key=True)
    username       = Column(String(50), nullable=False, unique=True, index=True)
    email          = Column(String, nullable=False, unique=True, index=True)
    password_hash  = Column(String, nullable=False)
    hours_per_day  = Column(Float, nullable=False)
    date_created   = Column(Date, nullable=False)

    modules = relationship("Module", backref="user", cascade="all, delete-orphan")

class Module(Base):
    __tablename__ = "modules"

    module_id   = Column(Integer, primary_key=True)
    user_id     = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    module_name = Column(String(255), nullable=False)

    tasks = relationship("Task", backref="module", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("user_id", "module_name"),
    )

class Task(Base):
    __tablename__ = "tasks"

    task_id    = Column(Integer, primary_key=True)
    module_id  = Column(Integer, ForeignKey("modules.module_id"), nullable=False)
    task_name  = Column(String(255), nullable=False)
    due_date   = Column(Date, nullable=False)
    due_time   = Column(Time, nullable=False)
    completed  = Column(Boolean, nullable=False, default=False)

    subtasks = relationship("SubTask", backref="task", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("task_name", "module_id"),
    )

class SubTask(Base):
    __tablename__ = "subtasks"

    subtask_id      = Column(Integer, primary_key=True)
    task_id         = Column(Integer, ForeignKey("tasks.task_id"), nullable=False)
    priority        = Column(Integer, nullable=False, index=True)
    description     = Column(String, nullable=False)
    estimated_hours = Column(Float, nullable=False)
    completed       = Column(Boolean, nullable=False, default=False)
    manually_moved  = Column(Boolean, nullable=False, default=False)

    scheduledtasks = relationship("ScheduledSlot", backref="subtask", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("description", "task_id"),
    )

class ScheduledSlot(Base):
    __tablename__="scheduledslots"

    scheduled_task_id = Column(Integer, primary_key=True)
    subtask_id       = Column(Integer, ForeignKey("subtasks.subtask_id"), nullable=False)
    scheduled_date   = Column(Date, nullable=False)
    allocated_hours  = Column(Float, nullable=False)