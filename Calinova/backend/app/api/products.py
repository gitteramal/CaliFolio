from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.product import Product
from app.models.user import User
from app.models.guest_product_access import GuestProductAccess

from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    FounderAssignment,
    FounderProductUpdate,
    RequestChanges,
)

from app.core.dependencies import (
    get_current_founder,
    get_current_admin,
    get_current_guest,
)


router = APIRouter(
    prefix="/products",
    tags=["Products"],
)


# =========================================================
# DATABASE
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# ========================= ADMIN =========================
# =========================================================


# =========================================================
# CREATE PRODUCT DRAFT
# POST /products/admin/
# =========================================================

@router.post(
    "/admin/",
    response_model=ProductResponse,
)
def create_product(
    product_data: ProductCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = Product(
        name=product_data.name,
        version=product_data.version,
        one_liner=product_data.one_liner,
        stage=product_data.stage,
        origin=product_data.origin,

        status="draft",

        founder_id=None,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


# =========================================================
# GET DRAFT PRODUCTS
# GET /products/admin/drafts
# =========================================================

@router.get(
    "/admin/drafts",
    response_model=list[ProductResponse],
)
def get_admin_draft_products(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return (
        db.query(Product)
        .filter(Product.status == "draft")
        .order_by(Product.created_at.desc())
        .all()
    )


# =========================================================
# GET PRODUCTS PENDING REVIEW
# GET /products/admin/pending-review
# =========================================================

@router.get(
    "/admin/pending-review",
    response_model=list[ProductResponse],
)
def get_admin_pending_review_products(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return (
        db.query(Product)
        .filter(Product.status == "pending_review")
        .order_by(Product.created_at.desc())
        .all()
    )


# =========================================================
# GET ALL PUBLISHED PRODUCTS
# GET /products/admin/published
# =========================================================

@router.get(
    "/admin/published",
    response_model=list[ProductResponse],
)
def get_admin_published_products(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return (
        db.query(Product)
        .filter(Product.status == "published")
        .order_by(Product.created_at.desc())
        .all()
    )


# =========================================================
# GET PUBLISHED PRODUCT
# GET /products/admin/published/{product_id}
# =========================================================

@router.get(
    "/admin/published/{product_id}",
    response_model=ProductResponse,
)
def get_admin_published_product(
    product_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.status == "published",
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Published product not found.",
        )

    return product


# =========================================================
# GET PRODUCT FOR ADMIN REVIEW
# GET /products/admin/{product_id}/review
# =========================================================

@router.get(
    "/admin/{product_id}/review",
    response_model=ProductResponse,
)
def get_product_for_admin_review(
    product_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )

    return product


# =========================================================
# APPROVE PRODUCT
# PATCH /products/admin/{product_id}/approve
# =========================================================

@router.patch(
    "/admin/{product_id}/approve",
    response_model=ProductResponse,
)
def approve_product(
    product_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )

    if product.status != "pending_review":
        raise HTTPException(
            status_code=400,
            detail="Only products pending review can be approved.",
        )

    product.status = "published"
    product.review_note = None

    db.commit()
    db.refresh(product)

    return product


# =========================================================
# REQUEST CHANGES
# PATCH /products/admin/{product_id}/request-changes
# =========================================================

@router.patch(
    "/admin/{product_id}/request-changes",
    response_model=ProductResponse,
)
def request_product_changes(
    product_id: int,
    request_data: RequestChanges,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )

    if product.status != "pending_review":
        raise HTTPException(
            status_code=400,
            detail=(
                "Only products pending review can "
                "have changes requested."
            ),
        )

    product.review_note = request_data.review_note

    # Send product back to founder
    product.status = "draft"

    db.commit()
    db.refresh(product)

    return product


# =========================================================
# ASSIGN FOUNDER
# PATCH /products/admin/{product_id}/assign-founder
# =========================================================

@router.patch(
    "/admin/{product_id}/assign-founder",
    response_model=ProductResponse,
)
def assign_founder(
    product_id: int,
    assignment: FounderAssignment,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )

    founder = (
        db.query(User)
        .filter(
            User.id == assignment.founder_id,
            User.role == "founder",
        )
        .first()
    )

    if not founder:
        raise HTTPException(
            status_code=404,
            detail="Founder not found.",
        )

    product.founder_id = founder.id
    product.status = "draft"

    db.commit()
    db.refresh(product)

    return product


# =========================================================
# GET ALL GUESTS
# GET /products/admin/guests
# =========================================================

@router.get(
    "/admin/guests",
)
def get_guests(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    guests = (
        db.query(User)
        .filter(
            User.role == "guest",
            User.is_active == True,
        )
        .order_by(User.full_name.asc())
        .all()
    )

    return [
        {
            "id": guest.id,
            "full_name": guest.full_name,
            "email": guest.email,
        }
        for guest in guests
    ]


# =========================================================
# ASSIGN PUBLISHED PRODUCT TO GUEST
# POST /products/admin/{product_id}/assign-guest/{guest_id}
# =========================================================

@router.post(
    "/admin/{product_id}/assign-guest/{guest_id}",
    response_model=ProductResponse,
)
def assign_product_to_guest(
    product_id: int,
    guest_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )

    if product.status != "published":
        raise HTTPException(
            status_code=400,
            detail="Only published products can be assigned to guests.",
        )

    guest = (
        db.query(User)
        .filter(
            User.id == guest_id,
            User.role == "guest",
            User.is_active == True,
        )
        .first()
    )

    if not guest:
        raise HTTPException(
            status_code=404,
            detail="Guest not found.",
        )

    existing_access = (
        db.query(GuestProductAccess)
        .filter(
            GuestProductAccess.guest_id == guest_id,
            GuestProductAccess.product_id == product_id,
        )
        .first()
    )

    if existing_access:
        raise HTTPException(
            status_code=400,
            detail="This product is already assigned to this guest.",
        )

    access = GuestProductAccess(
        guest_id=guest_id,
        product_id=product_id,
    )

    db.add(access)
    db.commit()
    db.refresh(product)

    return product


# =========================================================
# GET GUESTS ASSIGNED TO A PRODUCT
# GET /products/admin/{product_id}/guests
# =========================================================

@router.get(
    "/admin/{product_id}/guests",
)
def get_product_guests(
    product_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # Make sure product exists
    # -----------------------------------------------------

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )

    # -----------------------------------------------------
    # Get guests assigned to this product
    # -----------------------------------------------------

    guests = (
        db.query(User)
        .join(
            GuestProductAccess,
            GuestProductAccess.guest_id == User.id,
        )
        .filter(
            GuestProductAccess.product_id == product_id,
            User.role == "guest",
            User.is_active == True,
        )
        .order_by(User.full_name.asc())
        .all()
    )

    return [
        {
            "id": guest.id,
            "full_name": guest.full_name,
            "email": guest.email,
        }
        for guest in guests
    ]
    
    # =========================================================
# REMOVE PRODUCT FROM GUEST
# DELETE /products/admin/{product_id}/assign-guest/{guest_id}
# =========================================================

@router.delete(
    "/admin/{product_id}/assign-guest/{guest_id}",
)
def remove_product_from_guest(
    product_id: int,
    guest_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # Make sure product exists
    # -----------------------------------------------------

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )

    # -----------------------------------------------------
    # Find guest access record
    # -----------------------------------------------------

    access = (
        db.query(GuestProductAccess)
        .filter(
            GuestProductAccess.product_id == product_id,
            GuestProductAccess.guest_id == guest_id,
        )
        .first()
    )

    if not access:
        raise HTTPException(
            status_code=404,
            detail="This product is not assigned to this guest.",
        )

    # -----------------------------------------------------
    # Remove access
    # -----------------------------------------------------

    db.delete(access)
    db.commit()

    return {
        "message": "Product access removed from guest.",
        "product_id": product_id,
        "guest_id": guest_id,
    }

# =========================================================
# ======================== FOUNDER ========================
# =========================================================


# =========================================================
# GET MY PRODUCTS
# GET /products/founder/my-products
# =========================================================

@router.get(
    "/founder/my-products",
    response_model=list[ProductResponse],
)
def get_my_products(
    current_founder: User = Depends(get_current_founder),
    db: Session = Depends(get_db),
):
    return (
        db.query(Product)
        .filter(
            Product.founder_id == current_founder.id
        )
        .order_by(Product.created_at.desc())
        .all()
    )


# =========================================================
# GET SINGLE FOUNDER PRODUCT
# GET /products/founder/{product_id}
# =========================================================

@router.get(
    "/founder/{product_id}",
    response_model=ProductResponse,
)
def get_founder_product(
    product_id: int,
    current_founder: User = Depends(get_current_founder),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.founder_id == current_founder.id,
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found or you do not have access to it.",
        )

    return product


# =========================================================
# UPDATE FOUNDER PRODUCT DETAILS
# PATCH /products/founder/{product_id}/details
# =========================================================

@router.patch(
    "/founder/{product_id}/details",
    response_model=ProductResponse,
)
def update_founder_details(
    product_id: int,
    product_data: FounderProductUpdate,
    current_founder: User = Depends(get_current_founder),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.founder_id == current_founder.id,
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found or you do not have access to it.",
        )

    if product.status != "draft":
        raise HTTPException(
            status_code=400,
            detail="Only draft products can be edited.",
        )

    # Product details
    product.description = product_data.description
    product.problem = product_data.problem
    product.how_it_works = product_data.how_it_works
    product.ideal_customer_profile = product_data.ideal_customer_profile
    product.value_proposition = product_data.value_proposition
    product.highlights = product_data.highlights

    # Company
    product.company = product_data.company
    product.headquarters = product_data.headquarters
    product.founded = product_data.founded
    product.team_size = product_data.team_size
    product.deployment = product_data.deployment
    product.pricing = product_data.pricing

    # Founders / business
    product.founders_team = product_data.founders_team
    product.key_clients = product_data.key_clients
    product.roadmap = product_data.roadmap
    product.compliance = product_data.compliance
    product.integrations = product_data.integrations

    # Metrics
    product.users = product_data.users
    product.customers = product_data.customers
    product.traction = product_data.traction
    product.funds_raised = product_data.funds_raised

    # Media
    product.demo_video_url = product_data.demo_video_url
    product.pitch_deck_url = product_data.pitch_deck_url
    product.website_url = product_data.website_url
    product.thumbnail_url = product_data.thumbnail_url

    db.commit()
    db.refresh(product)

    return product


# =========================================================
# SUBMIT FOR REVIEW
# PATCH /products/founder/{product_id}/submit-review
# =========================================================

@router.patch(
    "/founder/{product_id}/submit-review",
    response_model=ProductResponse,
)
def submit_for_review(
    product_id: int,
    current_founder: User = Depends(get_current_founder),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.founder_id == current_founder.id,
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found or you do not have access to it.",
        )

    if product.status != "draft":
        raise HTTPException(
            status_code=400,
            detail="Only draft products can be submitted for review.",
        )

    product.review_note = None
    product.status = "pending_review"

    db.commit()
    db.refresh(product)

    return product


# =========================================================
# ========================== GUEST ========================
# =========================================================


# =========================================================
# GET PRODUCTS ASSIGNED TO CURRENT GUEST
# GET /products/guest/published
# =========================================================

@router.get(
    "/guest/published",
    response_model=list[ProductResponse],
)
def get_guest_published_products(
    current_guest: User = Depends(get_current_guest),
    db: Session = Depends(get_db),
):
    products = (
        db.query(Product)
        .join(
            GuestProductAccess,
            GuestProductAccess.product_id == Product.id,
        )
        .filter(
            Product.status == "published",
            GuestProductAccess.guest_id == current_guest.id,
        )
        .order_by(Product.created_at.desc())
        .all()
    )

    return products


# =========================================================
# GET SINGLE GUEST PRODUCT
# GET /products/guest/published/{product_id}
# =========================================================

@router.get(
    "/guest/published/{product_id}",
    response_model=ProductResponse,
)
def get_guest_published_product(
    product_id: int,
    current_guest: User = Depends(get_current_guest),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .join(
            GuestProductAccess,
            GuestProductAccess.product_id == Product.id,
        )
        .filter(
            Product.id == product_id,
            Product.status == "published",
            GuestProductAccess.guest_id == current_guest.id,
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Published product not found or you do not have access to it.",
        )

    return product