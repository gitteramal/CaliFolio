from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)

from app.db.database import Base


class GuestProductAccess(Base):
    __tablename__ = "guest_product_access"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    guest_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    assigned_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # Prevent assigning the same product
    # to the same guest twice.
    __table_args__ = (
        UniqueConstraint(
            "guest_id",
            "product_id",
            name="uq_guest_product_access",
        ),
    )