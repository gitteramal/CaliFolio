from sqlalchemy.orm import Session

from app.models.user import User

from app.ai.database_tools import (
    get_founder_count,
    get_guest_count,
    get_total_product_count,
    get_published_product_count,
    get_pending_product_count,
    get_all_products,
    get_all_users,
    get_all_guest_product_access,
    get_my_products,
    get_my_product_count,
    get_my_product_status,
    get_my_guest_products,
)


def execute_structured_query(
    intent: str,
    current_user: User,
    db: Session,
    product_id: int | None = None,
):

    # ========================================================
    # GLOBAL / ADMIN
    # ========================================================

    if intent == "founder_count":
        return get_founder_count(
            current_user=current_user,
            db=db,
        )

    if intent == "guest_count":
        return get_guest_count(
            current_user=current_user,
            db=db,
        )

    if intent == "total_product_count":
        return get_total_product_count(
            current_user=current_user,
            db=db,
        )

    if intent == "published_product_count":
        return get_published_product_count(
            current_user=current_user,
            db=db,
        )

    if intent == "pending_product_count":
        return get_pending_product_count(
            current_user=current_user,
            db=db,
        )

    if intent == "draft_product_count":

        products = get_all_products(
            current_user=current_user,
            db=db,
        )

        return sum(
            1
            for product in products
            if product.status == "draft"
        )

    if intent == "all_products":
        return get_all_products(
            current_user=current_user,
            db=db,
        )

    if intent == "all_users":
        return get_all_users(
            current_user=current_user,
            db=db,
        )

    if intent == "guest_product_access":
        return get_all_guest_product_access(
            current_user=current_user,
            db=db,
        )

    # ========================================================
    # MY PRODUCTS
    #
    # Admin   → all products
    # Founder → own products
    # Guest   → assigned products
    # ========================================================

    if intent == "my_products":

        if current_user.role == "admin":

            return get_all_products(
                current_user=current_user,
                db=db,
            )

        if current_user.role == "founder":

            return get_my_products(
                current_user=current_user,
                db=db,
            )

        if current_user.role == "guest":

            return get_my_guest_products(
                current_user=current_user,
                db=db,
            )

        raise PermissionError(
            "You do not have permission to access products."
        )

    # ========================================================
    # MY PRODUCT COUNT
    #
    # Admin   → count all products
    # Founder → count own products
    # Guest   → count assigned products
    # ========================================================

    if intent == "my_product_count":

        if current_user.role == "admin":

            products = get_all_products(
                current_user=current_user,
                db=db,
            )

            return len(products)

        if current_user.role == "founder":

            return get_my_product_count(
                current_user=current_user,
                db=db,
            )

        if current_user.role == "guest":

            products = get_my_guest_products(
                current_user=current_user,
                db=db,
            )

            return len(products)

        raise PermissionError(
            "You do not have permission to access "
            "your product count."
        )

    # ========================================================
    # MY PRODUCT STATUS COUNTS
    #
    # Admin   → all products
    # Founder → own products
    # Guest   → assigned products
    # ========================================================

    if intent in {
        "my_published_product_count",
        "my_draft_product_count",
        "my_pending_product_count",
    }:

        if current_user.role == "admin":

            products = get_all_products(
                current_user=current_user,
                db=db,
            )

        elif current_user.role == "founder":

            products = get_my_products(
                current_user=current_user,
                db=db,
            )

        elif current_user.role == "guest":

            products = get_my_guest_products(
                current_user=current_user,
                db=db,
            )

        else:

            raise PermissionError(
                "You do not have permission to access "
                "these products."
            )

        if intent == "my_published_product_count":

            status = "published"

        elif intent == "my_draft_product_count":

            status = "draft"

        else:

            status = "pending_review"

        return sum(
            1
            for product in products
            if product.status == status
        )

    # ========================================================
    # MY PRODUCT LISTS BY STATUS
    #
    # Admin   → all matching products
    # Founder → own matching products
    # Guest   → assigned matching products
    # ========================================================

    if intent in {
        "my_published_products",
        "my_draft_products",
        "my_pending_products",
    }:

        if current_user.role == "admin":

            products = get_all_products(
                current_user=current_user,
                db=db,
            )

        elif current_user.role == "founder":

            products = get_my_products(
                current_user=current_user,
                db=db,
            )

        elif current_user.role == "guest":

            products = get_my_guest_products(
                current_user=current_user,
                db=db,
            )

        else:

            raise PermissionError(
                "You do not have permission to access "
                "these products."
            )

        if intent == "my_published_products":

            status = "published"

        elif intent == "my_draft_products":

            status = "draft"

        else:

            status = "pending_review"

        return [
            {
                "id": product.id,
                "name": product.name,
                "version": product.version,
                "status": product.status,
                "stage": product.stage,
            }
            for product in products
            if product.status == status
        ]

    # ========================================================
    # MY PRODUCT STATUS
    #
    # Admin   → any product
    # Founder → own product only
    # Guest   → assigned product only
    # ========================================================

    if intent == "my_product_status":

        if current_user.role == "admin":

            products = get_all_products(
                current_user=current_user,
                db=db,
            )

            for product in products:
                if product.id == product_id:
                    return product

            raise PermissionError(
                "Product not found."
            )

        if current_user.role == "founder":

            return get_my_product_status(
                current_user=current_user,
                db=db,
                product_id=product_id,
            )

        if current_user.role == "guest":

            products = get_my_guest_products(
                current_user=current_user,
                db=db,
            )

            for product in products:
                if product.id == product_id:
                    return product

            raise PermissionError(
                "You do not have access to this product."
            )

        raise PermissionError(
            "You do not have permission to access "
            "this product."
        )

    # ========================================================
    # GUEST PRODUCTS
    # ========================================================

    if intent == "my_guest_products":

        if current_user.role != "guest":
            raise PermissionError(
                "Guest access required."
            )

        return get_my_guest_products(
            current_user=current_user,
            db=db,
        )

    # ========================================================
    # UNKNOWN STRUCTURED INTENT
    # ========================================================

    raise ValueError(
        f"Unsupported structured intent: {intent}"
    )