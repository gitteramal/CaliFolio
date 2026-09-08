from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, field_validator


# =========================================================
# GUEST VISIBILITY
# =========================================================

class GuestVisibility(BaseModel):
    name: bool = True
    version: bool = True
    one_liner: bool = True
    stage: bool = True
    origin: bool = True


# =========================================================
# PRODUCT UPDATE - ADMIN
# =========================================================

class ProductUpdate(BaseModel):
    name: str
    version: str | None = None
    one_liner: str
    stage: str
    origin: str
    guest_visibility: GuestVisibility


# =========================================================
# PRODUCT CREATE - ADMIN
# =========================================================

class ProductCreate(BaseModel):
    name: str
    version: str | None = None
    one_liner: str | None = None
    stage: str | None = None
    origin: str | None = None


# =========================================================
# FOUNDER ASSIGNMENT
# =========================================================

class FounderAssignment(BaseModel):
    founder_id: int


# =========================================================
# FOUNDER PRODUCT UPDATE
# =========================================================

class FounderProductUpdate(BaseModel):

    # -------------------------
    # Product details
    # -------------------------

    description: str | None = None
    problem: str | None = None
    how_it_works: str | None = None
    ideal_customer_profile: str | None = None
    value_proposition: str | None = None
    highlights: str | None = None

    # -------------------------
    # Company
    # -------------------------

    company: str | None = None
    headquarters: str | None = None
    founded: str | None = None
    team_size: str | None = None
    deployment: str | None = None
    pricing: str | None = None

    # -------------------------
    # Founder / Business
    # -------------------------

    founders_team: str | None = None
    key_clients: str | None = None
    roadmap: str | None = None
    compliance: str | None = None
    integrations: str | None = None

    # -------------------------
    # Metrics
    # -------------------------

    users: str | None = None
    customers: str | None = None
    traction: str | None = None
    funds_raised: str | None = None

    # -------------------------
    # Media & Links
    # -------------------------

    demo_video_url: str | None = None
    pitch_deck_url: str | None = None
    website_url: str | None = None
    thumbnail_url: str | None = None

    # -------------------------
    # URL SECURITY VALIDATION
    # -------------------------

    @field_validator(
        "demo_video_url",
        "pitch_deck_url",
        "website_url",
        "thumbnail_url",
    )
    @classmethod
    def validate_url(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        # Allow empty fields
        if not value:
            return None

        parsed = urlparse(value)

        # Only allow HTTP and HTTPS
        if parsed.scheme.lower() not in {"http", "https"}:
            raise ValueError(
                "URL must use http:// or https://"
            )

        # URL must contain a hostname
        if not parsed.netloc:
            raise ValueError("Invalid URL")

        return value


# =========================================================
# REQUEST CHANGES - ADMIN
# =========================================================

class RequestChanges(BaseModel):
    review_note: str


# =========================================================
# PRODUCT RESPONSE
# =========================================================

class ProductResponse(BaseModel):

    # -------------------------
    # Basic
    # -------------------------

    id: int
    name: str
    version: str | None
    one_liner: str | None
    stage: str | None
    origin: str | None

    # -------------------------
    # Product details
    # -------------------------

    description: str | None
    problem: str | None
    how_it_works: str | None
    ideal_customer_profile: str | None
    value_proposition: str | None
    highlights: str | None

    # -------------------------
    # Company
    # -------------------------

    company: str | None
    headquarters: str | None
    founded: str | None
    team_size: str | None
    deployment: str | None
    pricing: str | None

    # -------------------------
    # Founder / Business
    # -------------------------

    founders_team: str | None
    key_clients: str | None
    roadmap: str | None
    compliance: str | None
    integrations: str | None

    # -------------------------
    # Metrics
    # -------------------------

    users: str | None
    customers: str | None
    traction: str | None
    funds_raised: str | None

    # -------------------------
    # Media & Links
    # -------------------------

    demo_video_url: str | None
    pitch_deck_url: str | None
    website_url: str | None
    thumbnail_url: str | None

    # -------------------------
    # Workflow
    # -------------------------

    status: str
    founder_id: int | None
    review_note: str | None
    is_edited: bool
    pending_edits: dict | None

    # -------------------------
    # Pydantic v2
    # -------------------------

    model_config = ConfigDict(from_attributes=True)