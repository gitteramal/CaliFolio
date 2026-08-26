from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    JSON,
    Text,
)

from app.db.database import Base


class Product(Base):
    __tablename__ = "products"

    # =====================================================
    # BASIC PRODUCT INFORMATION
    # =====================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
    )

    version = Column(
        String,
        nullable=True,
    )

    one_liner = Column(
        String,
        nullable=True,
    )

    stage = Column(
        String(50),
        nullable=False,
        default="ideation",
    )

    origin = Column(
        String(50),
        nullable=False,
        default="in_house",
    )

    # =====================================================
    # PRODUCT DETAILS - FOUNDER
    # =====================================================

    description = Column(
        String,
        nullable=True,
    )

    problem = Column(
        String,
        nullable=True,
    )

    how_it_works = Column(
        String,
        nullable=True,
    )

    ideal_customer_profile = Column(
        String,
        nullable=True,
    )

    value_proposition = Column(
        String,
        nullable=True,
    )

    highlights = Column(
        String,
        nullable=True,
    )

    # =====================================================
    # COMPANY INFORMATION
    # =====================================================

    company = Column(
        String,
        nullable=True,
    )

    headquarters = Column(
        String,
        nullable=True,
    )

    founded = Column(
        String,
        nullable=True,
    )

    team_size = Column(
        String,
        nullable=True,
    )

    deployment = Column(
        String,
        nullable=True,
    )

    pricing = Column(
        String,
        nullable=True,
    )

    # =====================================================
    # FOUNDERS & BUSINESS
    # =====================================================

    founders_team = Column(
        String,
        nullable=True,
    )

    key_clients = Column(
        String,
        nullable=True,
    )

    roadmap = Column(
        String,
        nullable=True,
    )

    compliance = Column(
        String,
        nullable=True,
    )

    integrations = Column(
        String,
        nullable=True,
    )

    # =====================================================
    # PRODUCT METRICS
    # =====================================================

    users = Column(
        String,
        nullable=True,
    )

    customers = Column(
        String,
        nullable=True,
    )

    traction = Column(
        String,
        nullable=True,
    )

    funds_raised = Column(
        String,
        nullable=True,
    )

    # =====================================================
    # MEDIA & LINKS
    # =====================================================

    demo_video_url = Column(
        String,
        nullable=True,
    )

    pitch_deck_url = Column(
        String,
        nullable=True,
    )

    website_url = Column(
        String,
        nullable=True,
    )

    thumbnail_url = Column(
        String,
        nullable=True,
    )

    # =====================================================
    # GUEST VISIBILITY
    # =====================================================

    guest_visibility = Column(
        JSON,
        nullable=False,
        default=lambda: {
            "name": True,
            "version": True,
            "one_liner": True,
            "stage": True,
            "origin": True,
            "description": True,
            "problem": True,
            "how_it_works": True,
            "ideal_customer_profile": True,
            "value_proposition": True,
            "highlights": True,
            "company": True,
            "headquarters": True,
            "founded": True,
            "team_size": True,
            "deployment": True,
            "pricing": True,
            "founders_team": True,
            "key_clients": True,
            "roadmap": True,
            "compliance": True,
            "integrations": True,
            "users": True,
            "customers": True,
            "traction": True,
            "funds_raised": True,
            "demo_video_url": True,
            "pitch_deck_url": True,
            "website_url": True,
            "thumbnail_url": True,
        },
    )

    # =====================================================
    # WORKFLOW
    # =====================================================

    status = Column(
        String,
        nullable=False,
        default="draft",
    )

    founder_id = Column(
        Integer,
        nullable=True,
    )
    
    review_note = Column(
    Text,
    nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )