from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# =========================================================
# CREATE QUESTION
# =========================================================

class ProductQuestionCreate(BaseModel):
    product_id: int
    question: str


# =========================================================
# CREATE ANSWER
# =========================================================

class ProductQuestionAnswerCreate(BaseModel):
    answer: str


# =========================================================
# ANSWER RESPONSE
# =========================================================

class ProductQuestionAnswerResponse(BaseModel):
    id: int
    question_id: int
    admin_id: int
    answer: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =========================================================
# BASIC QUESTION RESPONSE
# =========================================================

class ProductQuestionResponse(BaseModel):
    id: int
    product_id: int
    guest_id: int
    question: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# =========================================================
# GUEST QUESTION RESPONSE
# Includes admin answer if available
# =========================================================

class GuestProductQuestionResponse(BaseModel):
    id: int
    product_id: int
    guest_id: int

    question: str
    status: str

    created_at: datetime
    updated_at: datetime

    answer: Optional[str] = None
    answer_id: Optional[int] = None
    admin_id: Optional[int] = None
    answer_created_at: Optional[datetime] = None
    answer_updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# =========================================================
# GUEST QUESTION RESPONSE WITH ANSWER
# =========================================================

class GuestProductQuestionResponse(BaseModel):
    id: int
    product_id: int
    guest_id: int

    question: str
    status: str

    created_at: datetime
    updated_at: datetime

    # Answer information
    answer: Optional[str] = None
    answer_id: Optional[int] = None
    admin_id: Optional[int] = None
    answer_created_at: Optional[datetime] = None
    answer_updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        
# =========================================================
# ADMIN QUESTION RESPONSE
# =========================================================

class AdminProductQuestionResponse(BaseModel):
    id: int
    product_id: int
    guest_id: int

    question: str
    status: str

    created_at: datetime
    updated_at: datetime

    answer: Optional[str] = None
    answer_id: Optional[int] = None
    admin_id: Optional[int] = None
    answer_created_at: Optional[datetime] = None
    answer_updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True