from app.ai.database_tools import (
    get_total_product_count,
    get_published_product_count,
    get_pending_product_count,
    get_draft_products,
    get_published_products,
    get_pending_products,
    get_all_products,
)


# ============================================================
# GEMINI TOOL DEFINITIONS
# ============================================================

AI_TOOLS = [
    {
        "name": "get_total_product_count",
        "description": (
            "Get the total number of products in Calinova. "
            "Use this when the user asks how many products exist "
            "or asks for the total product count."
        ),
        "function": get_total_product_count,
    },

    {
        "name": "get_published_product_count",
        "description": (
            "Get the number of products whose status is published. "
            "Use this when the user asks how many published products "
            "there are."
        ),
        "function": get_published_product_count,
    },

    {
        "name": "get_pending_product_count",
        "description": (
            "Get the number of products whose status is pending_review. "
            "Use this when the user asks how many products are pending "
            "review."
        ),
        "function": get_pending_product_count,
    },

    {
        "name": "get_draft_products",
        "description": (
            "Get all products whose status is draft. "
            "Use this when the user asks which products are drafts "
            "or asks to list draft products."
        ),
        "function": get_draft_products,
    },

    {
        "name": "get_published_products",
        "description": (
            "Get all products whose status is published. "
            "Use this when the user asks which products are published "
            "or asks to list published products."
        ),
        "function": get_published_products,
    },

    {
        "name": "get_pending_products",
        "description": (
            "Get all products whose status is pending_review. "
            "Use this when the user asks which products are pending "
            "review or asks to list products waiting for review."
        ),
        "function": get_pending_products,
    },

    {
        "name": "get_all_products",
        "description": (
            "Get all products in Calinova. "
            "Use this when the user asks to list or show all products."
        ),
        "function": get_all_products,
    },
]