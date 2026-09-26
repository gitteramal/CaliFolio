from sqlalchemy.orm import Session

from app.models.user import User
from app.models.product import Product
from app.models.guest_product_access import GuestProductAccess


# ============================================================
# ADMIN DATABASE FUNCTIONS
# ============================================================

def get_founder_count(
    current_user: User,
    db: Session,
) -> int:

    if current_user.role != "admin":
        raise PermissionError(
            "You are not authorized to view the founder count."
        )

    return (
        db.query(User)
        .filter(User.role == "founder")
        .count()
    )


def get_guest_count(
    current_user: User,
    db: Session,
) -> int:

    if current_user.role != "admin":
        raise PermissionError(
            "You are not authorized to view the guest count."
        )

    return (
        db.query(User)
        .filter(User.role == "guest")
        .count()
    )


def get_total_product_count(
    current_user: User,
    db: Session,
) -> int:
    """
    Return the total number of products.

    Admin only.
    """

    if current_user.role != "admin":
        raise PermissionError(
            "You are not authorized to view the total product count."
        )

    return db.query(Product).count()


def get_published_product_count(
    current_user: User,
    db: Session,
) -> int:
    """
    Return the total number of published products.

    Admin only.
    """

    if current_user.role != "admin":
        raise PermissionError(
            "You are not authorized to view the published product count."
        )

    return (
        db.query(Product)
        .filter(Product.status == "published")
        .count()
    )


def get_pending_product_count(
    current_user: User,
    db: Session,
) -> int:
    """
    Return the total number of products currently
    waiting for admin review.

    Admin only.
    """

    if current_user.role != "admin":
        raise PermissionError(
            "You are not authorized to view the pending product count."
        )

    return (
        db.query(Product)
        .filter(Product.status == "pending_review")
        .count()
    )


def get_all_products(
    current_user: User,
    db: Session,
):
    """
    Return all products in the system.

    Admin only.
    """

    if current_user.role != "admin":
        raise PermissionError(
            "Admin access required."
        )

    return db.query(Product).all()

def get_published_products(
    current_user: User,
    db: Session,
):
    """
    Return all published products.

    Admin only.
    """

    if current_user.role != "admin":
        raise PermissionError(
            "You are not authorized to view published products."
        )

    return (
        db.query(Product)
        .filter(Product.status == "published")
        .all()
    )


def get_pending_products(
    current_user: User,
    db: Session,
):
    """
    Return all products currently waiting for admin review.

    Admin only.
    """

    if current_user.role != "admin":
        raise PermissionError(
            "You are not authorized to view pending products."
        )

    return (
        db.query(Product)
        .filter(Product.status == "pending_review")
        .all()
    )


def get_draft_products(
    current_user: User,
    db: Session,
):
    """
    Return all draft products.

    Admin only.
    """

    if current_user.role != "admin":
        raise PermissionError(
            "You are not authorized to view draft products."
        )

    return (
        db.query(Product)
        .filter(Product.status == "draft")
        .all()
    )


def get_all_users(
    current_user: User,
    db: Session,
):
    """
    Return all users in the system.

    Admin only.
    """

    if current_user.role != "admin":
        raise PermissionError(
            "Admin access required."
        )

    return db.query(User).all()


def get_all_guest_product_access(
    current_user: User,
    db: Session,
):
    """
    Return all guest-to-product assignments.

    Admin only.
    """

    if current_user.role != "admin":
        raise PermissionError(
            "Admin access required."
        )

    return (
        db.query(GuestProductAccess)
        .all()
    )


# ============================================================
# FOUNDER DATABASE FUNCTIONS
# ============================================================

def get_my_products(
    current_user: User,
    db: Session,
):
    """
    Return products belonging to the currently
    logged-in founder.

    Founder only.
    """

    if current_user.role != "founder":
        raise PermissionError(
            "Founder access required."
        )

    return (
        db.query(Product)
        .filter(
            Product.founder_id == current_user.id
        )
        .all()
    )


def get_my_product_count(
    current_user: User,
    db: Session,
) -> int:
    """
    Return the number of products belonging to
    the currently logged-in founder.

    Founder only.
    """

    if current_user.role != "founder":
        raise PermissionError(
            "Founder access required."
        )

    return (
        db.query(Product)
        .filter(
            Product.founder_id == current_user.id
        )
        .count()
    )


def get_my_product_status(
    current_user: User,
    product_id: int,
    db: Session,
):
    """
    Return the status and review information for a
    product belonging to the currently logged-in founder.

    Founder only.
    """

    if current_user.role != "founder":
        raise PermissionError(
            "Founder access required."
        )

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.founder_id == current_user.id,
        )
        .first()
    )

    if product is None:
        raise PermissionError(
            "You are not authorized to access this product."
        )

    return {
        "product_id": product.id,
        "name": product.name,
        "status": product.status,
        "review_note": product.review_note,
    }


# ============================================================
# GUEST DATABASE FUNCTIONS
# ============================================================

def get_my_guest_products(
    current_user: User,
    db: Session,
):
    """
    Return only products explicitly assigned to the
    currently logged-in guest.

    Guest only.
    """

    if current_user.role != "guest":
        raise PermissionError(
            "Guest access required."
        )

    return (
        db.query(Product)
        .join(
            GuestProductAccess,
            GuestProductAccess.product_id == Product.id,
        )
        .filter(
            GuestProductAccess.guest_id == current_user.id
        )
        .all()
    )

def get_product_for_ai(
    current_user: User,
    product_id: int,
    db: Session,
):
    """
    Retrieve product information for the AI assistant.

    Access rules:
    - Admin: can access all product fields.
    - Founder: can access only their own products.
    - Guest: can access only assigned products and only
      fields allowed by guest_visibility.
    """

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if product is None:
        raise ValueError(
            "Product not found."
        )

    # ========================================================
    # ADMIN
    # ========================================================

    if current_user.role == "admin":
        return {
            column.name: getattr(product, column.name)
            for column in Product.__table__.columns
        }

    # ========================================================
    # FOUNDER
    # ========================================================

    if current_user.role == "founder":

        if product.founder_id != current_user.id:
            raise PermissionError(
                "You are not authorized to access this product."
            )

        return {
            column.name: getattr(product, column.name)
            for column in Product.__table__.columns
        }

    # ========================================================
    # GUEST
    # ========================================================

    if current_user.role == "guest":

        access = (
            db.query(GuestProductAccess)
            .filter(
                GuestProductAccess.guest_id == current_user.id,
                GuestProductAccess.product_id == product.id,
            )
            .first()
        )

        if access is None:
            raise PermissionError(
                "You are not authorized to access this product."
            )

        visibility = product.guest_visibility or {}

        result = {}

        for column in Product.__table__.columns:

            field_name = column.name

            # ID is needed internally to identify the product
            if field_name == "id":
                result[field_name] = product.id
                continue

            # Only return fields explicitly allowed
            if visibility.get(field_name, False):
                result[field_name] = getattr(
                    product,
                    field_name,
                )

        return result

    # ========================================================
    # UNKNOWN ROLE
    # ========================================================

    raise PermissionError(
        "You are not authorized to access products."
    )
    
# ============================================================
# GENERIC AI DATA QUERY
# ============================================================

def query_califolio_data(
    current_user,
    db,
    entity: str,
    operation: str,
    filters: dict | None = None,
    fields: list[str] | None = None,
):
    """
    Generic database query used by the Calinova AI assistant.

    The LLM can describe what information it needs,
    but the backend controls what can actually be queried.
    """

    filters = filters or {}
    fields = fields or []

    # --------------------------------------------------------
    # USERS
    # --------------------------------------------------------

    if entity == "users":

        if current_user.role != "admin":
            raise PermissionError(
                "You are not authorized to access user information."
            )

        query = db.query(User)

        # Filter by role
        if "role" in filters:
            query = query.filter(
                User.role == filters["role"]
            )

        # Count users
        if operation == "count":
            return {
                "count": query.count()
            }

        # List users
        if operation == "list":

            users = query.all()

            return [
                {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "role": user.role,
                    "is_active": user.is_active,
                }
                for user in users
            ]

        raise ValueError(
            f"Unsupported users operation: {operation}"
        )


    # --------------------------------------------------------
    # PRODUCTS
    # --------------------------------------------------------

    if entity == "products":

        query = db.query(Product)

        # --------------------------------------------
        # Authorization
        # --------------------------------------------

        if current_user.role == "admin":

            pass

        elif current_user.role == "founder":

            query = query.filter(
                Product.founder_id == current_user.id
            )

        elif current_user.role == "guest":

            query = (
                query
                .join(
                    GuestProductAccess,
                    GuestProductAccess.product_id == Product.id
                )
                .filter(
                    GuestProductAccess.guest_id == current_user.id
                )
            )

        else:
            raise PermissionError(
                "You are not authorized to access products."
            )


        # --------------------------------------------
        # Product filters
        # --------------------------------------------

        if "status" in filters:

            query = query.filter(
                Product.status == filters["status"]
            )


        if "product_name" in filters:

            query = query.filter(
                Product.name.ilike(
                    f"%{filters['product_name']}%"
                )
            )


        # --------------------------------------------
        # Count
        # --------------------------------------------

        if operation == "count":

            return {
                "count": query.count()
            }


        # --------------------------------------------
        # List
        # --------------------------------------------

        if operation == "list":

            products = query.all()

            return [
                {
                    "id": product.id,
                    "name": product.name,
                    "version": product.version,
                    "status": product.status,
                }
                for product in products
            ]


        # --------------------------------------------
        # Product information
        # --------------------------------------------

        if operation == "information":

            product = query.first()

            if not product:
                return {
                    "message": "Product not found."
                }


            allowed_fields = {
                "name",
                "version",
                "one_liner",
                "stage",
                "origin",
                "description",
                "problem",
                "how_it_works",
                "ideal_customer_profile",
                "value_proposition",
                "highlights",
                "company",
                "headquarters",
                "founded",
                "team_size",
                "deployment",
                "pricing",
                "founders_team",
                "key_clients",
                "roadmap",
                "compliance",
                "integrations",
                "users",
                "customers",
                "traction",
                "funds_raised",
                "demo_video_url",
                "pitch_deck_url",
                "website_url",
                "thumbnail_url",
            }


            requested_fields = [
                field
                for field in fields
                if field in allowed_fields
            ]

            # If no specific fields were requested,
            # return the main product information.
            if not requested_fields:
                requested_fields = [
                    "name",
                    "version",
                    "one_liner",
                    "stage",
                    "origin",
                    "description",
                    "problem",
                    "how_it_works",
                    "ideal_customer_profile",
                    "value_proposition",
                    "highlights",
                    "company",
                    "headquarters",
                    "founded",
                    "team_size",
                    "deployment",
                    "pricing",
                    "founders_team",
                    "key_clients",
                    "roadmap",
                    "compliance",
                    "integrations",
                    "users",
                    "customers",
                    "traction",
                    "funds_raised",
                ]


            result = {}

            for field in requested_fields:

                result[field] = getattr(
                    product,
                    field,
                    None,
                )


            return result


        raise ValueError(
            f"Unsupported products operation: {operation}"
        )


    # --------------------------------------------------------
    # UNKNOWN ENTITY
    # --------------------------------------------------------

    raise ValueError(
        f"Unsupported Calinova entity: {entity}"
    )