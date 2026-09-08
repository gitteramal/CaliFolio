from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.user import User
from app.models.product import Product
from app.models.guest_product_access import GuestProductAccess
from app.schemas.user import GuestStatusUpdate, UserCreate, UserResponse
from app.core.dependencies import get_current_admin, get_db
from app.core.security import hash_password


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    role = user_data.role.lower().strip()
    if role not in ["admin", "founder", "guest"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'admin', 'founder', or 'guest'.",
        )

    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email.lower().strip())
        .first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    new_user = User(
        full_name=user_data.full_name.strip(),
        email=user_data.email.lower().strip(),
        password_hash=hash_password(user_data.password),
        role=role,
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


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


@router.get("/guests")
def get_guest_directory(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    guests = (
        db.query(User)
        .filter(User.role == "guest")
        .order_by(User.full_name.asc())
        .all()
    )

    accesses = (
        db.query(GuestProductAccess.guest_id, Product.id, Product.name)
        .join(Product, Product.id == GuestProductAccess.product_id)
        .filter(GuestProductAccess.guest_id.in_([guest.id for guest in guests]))
        .order_by(Product.name.asc())
        .all()
        if guests
        else []
    )

    products_by_guest = {}
    for guest_id, product_id, product_name in accesses:
        products_by_guest.setdefault(guest_id, []).append(
            {"id": product_id, "name": product_name}
        )

    return [
        {
            "id": guest.id,
            "full_name": guest.full_name,
            "email": guest.email,
            "is_active": guest.is_active,
            "products": products_by_guest.get(guest.id, []),
        }
        for guest in guests
    ]


@router.patch("/guests/{guest_id}/status")
def update_guest_status(
    guest_id: int,
    status_update: GuestStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    guest = (
        db.query(User)
        .filter(User.id == guest_id, User.role == "guest")
        .first()
    )

    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found.")

    guest.is_active = status_update.is_active
    db.commit()
    db.refresh(guest)

    return {"id": guest.id, "is_active": guest.is_active}
