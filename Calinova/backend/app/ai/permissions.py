from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.product import Product
from app.models.guest_product_access import GuestProductAccess


def can_access_product(
    current_user: User,
    product: Product,
    db: Session,
) -> bool:
    """
    Check whether the current user is allowed
    to access a product through the AI assistant.
    """

    # -------------------------------------------------
    # ADMIN
    # -------------------------------------------------
    if current_user.role == "admin":
        return True

    # -------------------------------------------------
    # FOUNDER
    # -------------------------------------------------
    if current_user.role == "founder":

        # Founder can access their own product
        if product.founder_id == current_user.id:
            return True

        # Founder can access published products
        # that are available publicly.
        if product.status == "published":
            return True

        return False

    # -------------------------------------------------
    # GUEST
    # -------------------------------------------------
    if current_user.role == "guest":

        access = (
            db.query(GuestProductAccess)
            .filter(
                GuestProductAccess.guest_id == current_user.id,
                GuestProductAccess.product_id == product.id,
            )
            .first()
        )

        return access is not None

    return False