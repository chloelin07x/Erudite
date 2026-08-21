from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
from datetime import date, time
from typing import List, Optional

class CreateUserRequest(BaseModel):
    username : str = Field(min_length=5, max_length=50)
    email : EmailStr 
    password : str = Field(min_length=8)
    hours_per_day : float = Field(ge=0, le=24)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value):
        if len(value) < 5:
            raise ValueError("Username must be at least 5 characters long")
        elif len(value) > 50:
            raise ValueError("Username cannot exceed 50 characters")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if len(value) < 5:
            raise ValueError("Password must be at least 8 characters long")
        return value

    @field_validator("hours_per_day")
    @classmethod
    def validate_hours(cls, value):
        if value > 24:
            raise ValueError("Cannot exceed 24 hours each day")
        return value

class UpdateUserRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
                              
    username : Optional[str] = Field(None, min_length=5, max_length=50)
    email : Optional[EmailStr] = None
    password : Optional[str] = Field(None, min_length=8)
    hours_per_day : Optional[float] = Field(None, gt=0, le=24)

class UserResponse(BaseModel):
    user_id : int
    username : str
    email : EmailStr
    hours_per_day : float 
    date_created : date

    class Config:
        from_attributes = True # Allows pydantic to read SQLAlchemy objects

class CreateModuleRequest(BaseModel):
    module_name : str = Field(min_length=1, max_length=255)

    @field_validator("module_name")
    @classmethod
    def validate_module_name(cls, value):
        if len(value) < 1:
            raise ValueError("Module name must be at least 1 character long")
        elif len(value) > 255:
            raise ValueError("Module name cannot exceed 255 characters")
        return value

class UpdateModuleRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    module_name : Optional[str] = Field(None, min_length=1, max_length=255)

class ModuleResponse(BaseModel):
    module_id : int
    module_name : str

    class Config:
        from_attributes = True

class CreateTaskRequest(BaseModel):
    module_id : int
    task_name : str = Field(min_length=1, max_length=255)
    due_date : date
    due_time : time

    @field_validator("task_name")
    @classmethod
    def validate_task_name(cls, value):
        if len(value) < 1:
            raise ValueError("Task name must be at least 1 character long")
        elif len(value) > 255:
            raise ValueError("Task name cannot exceed 255 characters")
        return value

class UpdateTaskRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    module_id : Optional[int] = None
    task_name : Optional[str] = Field(None, min_length=1, max_length=255)
    due_date : Optional[date] = None
    due_time : Optional[time] = None
    completed : Optional[bool] = None

class TaskResponse(BaseModel):
    task_id : int
    module_id : int
    task_name : str
    due_date : date
    due_time : time
    completed : bool

    class Config:
        from_attributes = True

class CreateSubTaskRequest(BaseModel):
    task_id : int
    priority : int = Field(ge=1, le=10)
    description : str = Field(min_length=1, max_length=255)
    estimated_hours : float = Field(1.0, gt=0)
    completed : bool = False
    manually_moved : bool = False

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value):
        if value < 1:
            raise ValueError("Priority must be at least 1")
        elif value > 10:
            raise ValueError("Priority cannot exceed 10")
        return value

    @field_validator("description")
    @classmethod
    def validate_description(cls, value):
        if len(value) < 1:
            raise ValueError("Description must be at least 1 character long")
        elif len(value) > 255:
            raise ValueError("Description cannot exceed 255 characters")
        return value

    @field_validator("estimated_hours")
    @classmethod
    def validate_estimated_hours(cls, value):
        if value < 0:
            raise ValueError("Estimated hours must be greater than 0")
        return value

class UpdateSubTaskRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    task_id : Optional[int] = None
    priority : Optional[int] = Field(None, ge=1, le=10)
    description : Optional[str] = Field(None, min_length=1, max_length=255)
    estimated_hours : Optional[float] = Field(None, gt=0)
    completed : Optional[bool] = None
    manually_moved : Optional[bool] = None

class SubTaskResponse(BaseModel):
    subtask_id : int
    task_id : int
    priority : int
    description : str
    completed : bool
    estimated_hours : float
    manually_moved : bool

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email : EmailStr
    password : str

class ScheduledSlotRequest(BaseModel):
    scheduled_task_id : int
    subtask_id : int
    task_name : str
    subtask_desc : str
    assigned_date : date
    assigned_hours : float

    # So user knows priority and due date
    priority : int
    due_date : date

class CreateScheduledSlotRequest(BaseModel):
    subtask_id : int
    scheduled_date : date
    allocated_hours : float = Field(gt=0)

class UpdateScheduledSlotRequest(BaseModel):
    assigned_date : Optional[date] = Field(None)
    assigned_hours : Optional[float] = Field(None)

class ScheduledResponse(BaseModel):
    schedule : List[ScheduledSlotRequest]

class ScheduledSlotResponse(BaseModel):
    scheduled_task_id : int
    subtask_id : int
    scheduled_date : date
    allocated_hours : float

    class Config:
        from_attributes = True

