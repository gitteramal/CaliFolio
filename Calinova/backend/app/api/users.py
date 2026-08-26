from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.user import User


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/founders")
def get_founders(
    db: Session = Depends(get_db),
):
    founders = (
        db.query(User)
        .filter(
            User.role == "founder",
            User.is_active == True,
        )
        .order_by(User.full_name.asc())
        .all()
    )

    return [
        {
            "id": founder.id,
            "full_name": founder.full_name,
            "email": founder.email,
        }
        for founder in founders
    ]