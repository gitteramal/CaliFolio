from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    Text,
    DateTime,
    ForeignKey,
)

from pgvector.sqlalchemy import Vector

from app.db.database import Base


class ProductEmbedding(Base):
    __tablename__ = "product_embeddings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    content = Column(
        Text,
        nullable=False,
    )

    embedding = Column(
        Vector(384),
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    
    guest_content = Column(
    Text,
    nullable=False,
)

guest_embedding = Column(
    Vector(384),
    nullable=False,
)