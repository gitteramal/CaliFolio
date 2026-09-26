import re

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


# ============================================================
# QUESTION NORMALIZATION
# ============================================================

def normalize_question(question: str) -> str:
    """
    Normalize the user's question so that small differences
    in wording do not affect routing.
    """

    question = question.lower().strip()

    punctuation = "?!.,;:\"'"

    for character in punctuation:
        question = question.replace(character, "")

    question = " ".join(question.split())

    return question


# ============================================================
# PRODUCT ID EXTRACTION
# ============================================================

def extract_product_id(question: str):
    """
    Extract product ID from questions such as:

    - What is the status of product 15?
    - Show me product 20 status
    - What is the status of product ID 7?
    """

    question = normalize_question(question)

    patterns = [
        r"product\s+id\s+(\d+)",
        r"product\s+(\d+)",
    ]

    for pattern in patterns:

        match = re.search(pattern, question)

        if match:
            return int(match.group(1))

    return None


# ============================================================
# QUESTION TYPE HELPERS
# ============================================================

def is_count_question(question: str) -> bool:
    """
    Check whether the user is asking for a count.
    """

    count_words = [
        "how many",
        "number of",
        "count",
        "total",
    ]

    return any(word in question for word in count_words)


def is_personal_question(question: str) -> bool:
    """
    Detect questions referring to the current user's
    own products.

    Examples:

    - how many products do i have
    - my products
    - products i own
    - products assigned to me
    - products belonging to me
    """

    personal_phrases = [
        "my product",
        "my products",
        "i have",
        "i own",
        "mine",
        "assigned to me",
        "belonging to me",
        "belong to me",
        "available to me",
        "for me",
    ]

    return any(
        phrase in question
        for phrase in personal_phrases
    )


def is_published_question(question: str) -> bool:
    return "published" in question


def is_pending_question(question: str) -> bool:
    return (
        "pending" in question
        or "pending review" in question
        or "waiting for review" in question
        or "awaiting review" in question
    )


def is_draft_question(question: str) -> bool:
    return "draft" in question


# ============================================================
# INTENT DETECTION
# ============================================================

def detect_intent(question: str):
    """
    Identify what the user is asking for.

    The router considers:

    1. What information is being requested?
    2. Whether the question is personal/current-user scoped.
    3. Product status.
    4. Role authorization is handled later.
    """

    question = normalize_question(question)

    # ========================================================
    # BASIC FLAGS
    # ========================================================

    count_question = is_count_question(question)
    personal_question = is_personal_question(question)

    published_question = is_published_question(question)
    pending_question = is_pending_question(question)
    draft_question = is_draft_question(question)

    # ========================================================
    # FOUNDER / USER-SCOPED PRODUCT COUNTS
    #
    # IMPORTANT:
    # These MUST come BEFORE the global product-count rules.
    # ========================================================

    if (
        "product" in question
        and count_question
        and personal_question
    ):

        if published_question:
            return "my_published_product_count"

        if pending_question:
            return "my_pending_product_count"

        if draft_question:
            return "my_draft_product_count"

        return "my_product_count"

    # ========================================================
    # FOUNDER / USER-SCOPED PRODUCT LISTS
    # ========================================================

    if (
        "product" in question
        and personal_question
        and not count_question
    ):

        if published_question:
            return "my_published_products"

        if pending_question:
            return "my_pending_products"

        if draft_question:
            return "my_draft_products"

        return "my_products"

    # ========================================================
    # FOUNDER / USER-SCOPED PRODUCT STATUS
    # ========================================================

    if (
        "status" in question
        and "product" in question
    ):
        return "my_product_status"

    # ========================================================
    # FOUNDER COUNT
    # ========================================================

    if (
        "founder" in question
        and count_question
    ):
        return "founder_count"

    # ========================================================
    # GUEST COUNT
    # ========================================================

    if (
        "guest" in question
        and count_question
    ):
        return "guest_count"

    # ========================================================
    # GLOBAL PUBLISHED PRODUCT COUNT
    # ========================================================

    if (
        "product" in question
        and published_question
        and count_question
    ):
        return "published_product_count"

    # ========================================================
    # GLOBAL PENDING PRODUCT COUNT
    # ========================================================

    if (
        "product" in question
        and pending_question
        and count_question
    ):
        return "pending_product_count"

    # ========================================================
    # GLOBAL DRAFT PRODUCT COUNT
    # ========================================================

    if (
        "product" in question
        and draft_question
        and count_question
    ):
        return "draft_product_count"

    # ========================================================
    # GLOBAL TOTAL PRODUCT COUNT
    # ========================================================

    if (
        "product" in question
        and count_question
    ):
        return "total_product_count"

    # ========================================================
    # ADMIN PRODUCT LIST
    # ========================================================

    if (
        "all products" in question
        or "show products" in question
        or "list products" in question
        or "products in calinova" in question
    ):
        return "all_products"

    # ========================================================
    # ADMIN USER LIST
    # ========================================================

    if (
        "all users" in question
        or "show users" in question
        or "list users" in question
        or "users in calinova" in question
    ):
        return "all_users"

    # ========================================================
    # ADMIN GUEST ACCESS
    # ========================================================

    if (
        "guest access" in question
        or "guest product access" in question
        or "which guests have access" in question
    ):
        return "guest_product_access"

    # ========================================================
    # GUEST ACCESSIBLE PRODUCTS
    # ========================================================

    if (
        "products i can access" in question
        or "products can i access" in question
        or "accessible products" in question
        or "my accessible products" in question
        or "products available to me" in question
    ):
        return "my_guest_products"

    # ========================================================
    # UNKNOWN / UNSUPPORTED
    # ========================================================

    return None


# ============================================================
# QUESTION ROUTER
# ============================================================

def route_question(
    question: str,
    current_user: User,
    db: Session,
):
    """
    Route the user's question to the appropriate
    authorized database function.
    """

    intent = detect_intent(question)

    # ========================================================
    # UNKNOWN
    # ========================================================

    if intent is None:

        return {
            "type": "unsupported",
            "answer": (
                "I can only answer questions about information "
                "available to you in Calinova."
            ),
        }

    # ========================================================
    # ADMIN
    # ========================================================

    if current_user.role == "admin":

        # ----------------------------------------------------
        # Founder count
        # ----------------------------------------------------

        if intent == "founder_count":

            count = get_founder_count(
                current_user=current_user,
                db=db,
            )

            return {
                "type": "database",
                "intent": intent,
                "answer": (
                    f"There are {count} founders in Calinova."
                ),
            }

        # ----------------------------------------------------
        # Guest count
        # ----------------------------------------------------

        if intent == "guest_count":

            count = get_guest_count(
                current_user=current_user,
                db=db,
            )

            return {
                "type": "database",
                "intent": intent,
                "answer": (
                    f"There are {count} guests in Calinova."
                ),
            }

        # ----------------------------------------------------
        # Total product count
        # ----------------------------------------------------

        if intent == "total_product_count":

            count = get_total_product_count(
                current_user=current_user,
                db=db,
            )

            return {
                "type": "database",
                "intent": intent,
                "answer": (
                    f"There are {count} products in Calinova."
                ),
            }

        # ----------------------------------------------------
        # Published product count
        # ----------------------------------------------------

        if intent == "published_product_count":

            count = get_published_product_count(
                current_user=current_user,
                db=db,
            )

            return {
                "type": "database",
                "intent": intent,
                "answer": (
                    f"There are {count} published products "
                    "in Calinova."
                ),
            }

        # ----------------------------------------------------
        # Pending product count
        # ----------------------------------------------------

        if intent == "pending_product_count":

            count = get_pending_product_count(
                current_user=current_user,
                db=db,
            )

            return {
                "type": "database",
                "intent": intent,
                "answer": (
                    f"There are {count} products "
                    "waiting for review."
                ),
            }

        # ----------------------------------------------------
        # Draft product count
        # ----------------------------------------------------

        if intent == "draft_product_count":

            products = get_all_products(
                current_user=current_user,
                db=db,
            )

            count = sum(
                1
                for product in products
                if product.status == "draft"
            )

            return {
                "type": "database",
                "intent": intent,
                "answer": (
                    f"There are {count} draft products "
                    "in Calinova."
                ),
            }

        # ----------------------------------------------------
        # All products
        # ----------------------------------------------------

        if intent == "all_products":

            products = get_all_products(
                current_user=current_user,
                db=db,
            )

            return {
                "type": "database",
                "intent": intent,
                "data": [
                    {
                        "id": product.id,
                        "name": product.name,
                        "status": product.status,
                        "founder_id": product.founder_id,
                    }
                    for product in products
                ],
            }

        # ----------------------------------------------------
        # All users
        # ----------------------------------------------------

        if intent == "all_users":

            users = get_all_users(
                current_user=current_user,
                db=db,
            )

            return {
                "type": "database",
                "intent": intent,
                "data": [
                    {
                        "id": user.id,
                        "name": user.full_name,
                        "email": user.email,
                        "role": user.role,
                        "is_active": user.is_active,
                    }
                    for user in users
                ],
            }

        # ----------------------------------------------------
        # Guest access
        # ----------------------------------------------------

        if intent == "guest_product_access":

            records = get_all_guest_product_access(
                current_user=current_user,
                db=db,
            )

            return {
                "type": "database",
                "intent": intent,
                "data": [
                    {
                        "id": record.id,
                        "guest_id": record.guest_id,
                        "product_id": record.product_id,
                    }
                    for record in records
                ],
            }

        # ----------------------------------------------------
        # Admin cannot use founder-scoped intents
        # ----------------------------------------------------

        return {
            "type": "unauthorized",
            "answer": (
                "That question is outside the available "
                "Admin scope."
            ),
        }

    # ========================================================
    # FOUNDER
    # ========================================================

    if current_user.role == "founder":

        # ----------------------------------------------------
        # My product count
        # ----------------------------------------------------

        if intent == "my_product_count":

            count = get_my_product_count(
                current_user=current_user,
                db=db,
            )

            return {
                "type": "database",
                "intent": intent,
                "answer": (
                    f"You have {count} products in Calinova."
                ),
            }

        # ----------------------------------------------------
        # My published / draft / pending counts
        #
        # IMPORTANT:
        # get_my_products() already restricts results to
        # current_user.id.
        # Therefore these counts are founder-scoped.
        # ----------------------------------------------------

        if intent in {
            "my_published_product_count",
            "my_draft_product_count",
            "my_pending_product_count",
        }:

            products = get_my_products(
                current_user=current_user,
                db=db,
            )

            if intent == "my_published_product_count":

                status = "published"
                label = "published"

            elif intent == "my_draft_product_count":

                status = "draft"
                label = "draft"

            else:

                status = "pending_review"
                label = "pending-review"

            count = sum(
                1
                for product in products
                if product.status == status
            )

            return {
                "type": "database",
                "intent": intent,
                "answer": (
                    f"You have {count} {label} "
                    f"products."
                ),
            }

        # ----------------------------------------------------
        # My products
        # ----------------------------------------------------

        if intent == "my_products":

            products = get_my_products(
                current_user=current_user,
                db=db,
            )

            return {
                "type": "database",
                "intent": intent,
                "data": [
                    {
                        "id": product.id,
                        "name": product.name,
                        "status": product.status,
                    }
                    for product in products
                ],
            }

        # ----------------------------------------------------
        # My published / draft / pending products
        # ----------------------------------------------------

        if intent in {
            "my_published_products",
            "my_draft_products",
            "my_pending_products",
        }:

            products = get_my_products(
                current_user=current_user,
                db=db,
            )

            if intent == "my_published_products":

                status = "published"

            elif intent == "my_draft_products":

                status = "draft"

            else:

                status = "pending_review"

            filtered_products = [
                product
                for product in products
                if product.status == status
            ]

            return {
                "type": "database",
                "intent": intent,
                "data": [
                    {
                        "id": product.id,
                        "name": product.name,
                        "status": product.status,
                    }
                    for product in filtered_products
                ],
            }

        # ----------------------------------------------------
        # My product status
        # ----------------------------------------------------

        if intent == "my_product_status":

            product_id = extract_product_id(question)

            if product_id is None:

                return {
                    "type": "database",
                    "intent": intent,
                    "answer": (
                        "Please provide the product ID so I "
                        "can check its status."
                    ),
                }

            result = get_my_product_status(
                current_user=current_user,
                product_id=product_id,
                db=db,
            )

            return {
                "type": "database",
                "intent": intent,
                "data": result,
            }

        # ----------------------------------------------------
        # Founder cannot access global/admin information
        # ----------------------------------------------------

        return {
            "type": "unauthorized",
            "answer": (
                "You do not have permission to access "
                "that information."
            ),
        }

    # ========================================================
    # GUEST
    # ========================================================

    if current_user.role == "guest":

        # ----------------------------------------------------
        # Guest assigned products
        # ----------------------------------------------------

        if intent in {
            "my_guest_products",
            "my_products",
        }:

            products = get_my_guest_products(
                current_user=current_user,
                db=db,
            )

            return {
                "type": "database",
                "intent": intent,
                "data": [
                    {
                        "id": product.id,
                        "name": product.name,
                        "status": product.status,
                    }
                    for product in products
                ],
            }

        # ----------------------------------------------------
        # Guest product count
        # ----------------------------------------------------

        if intent == "my_product_count":

            products = get_my_guest_products(
                current_user=current_user,
                db=db,
            )

            count = len(products)

            return {
                "type": "database",
                "intent": intent,
                "answer": (
                    f"You have access to {count} "
                    f"products in Calinova."
                ),
            }

        # ----------------------------------------------------
        # Explicit guest-access question
        # ----------------------------------------------------

        if intent == "my_guest_products":

            products = get_my_guest_products(
                current_user=current_user,
                db=db,
            )

            return {
                "type": "database",
                "intent": intent,
                "data": [
                    {
                        "id": product.id,
                        "name": product.name,
                        "status": product.status,
                    }
                    for product in products
                ],
            }

        # ----------------------------------------------------
        # Guest cannot access global information
        # ----------------------------------------------------

        return {
            "type": "unauthorized",
            "answer": (
                "You do not have permission to access "
                "that information."
            ),
        }

    # ========================================================
    # UNKNOWN ROLE
    # ========================================================

    return {
        "type": "unauthorized",
        "answer": (
            "You do not have permission to access "
            "that information."
        ),
    }


# ============================================================
# STRUCTURED / RAG CLASSIFICATION
# ============================================================

def classify_question_source(question: str) -> str:
    """
    Decide whether a question should use structured
    database tools or semantic RAG search.
    """

    intent = detect_intent(question)

    structured_intents = {
        # Global/admin
        "founder_count",
        "guest_count",
        "total_product_count",
        "published_product_count",
        "pending_product_count",
        "draft_product_count",
        "all_products",
        "all_users",
        "guest_product_access",

        # Founder
        "my_products",
        "my_product_count",
        "my_published_products",
        "my_draft_products",
        "my_pending_products",
        "my_published_product_count",
        "my_draft_product_count",
        "my_pending_product_count",
        "my_product_status",

        # Guest
        "my_guest_products",
    }

    if intent in structured_intents:
        return intent

    return "rag"