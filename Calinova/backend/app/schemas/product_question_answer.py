from datetime import datetime

from pydantic import BaseModel


# =========================================================
# CREATE ANSWER
# =========================================================

class ProductQuestionAnswerCreate(BaseModel):
    question_id: int
    answer: str


# =========================================================
# ANSWER RESPONSE
# =========================================================

class ProductQuestionAnswerResponse(BaseModel):
    id: int
    admin_id: int
    answer: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True