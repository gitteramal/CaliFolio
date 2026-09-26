from sqlalchemy.orm import Session

from app.models.user import User

from app.ai.database_tools import (
    get_total_product_count,
    get_published_product_count,
    get_pending_product_count,
    get_draft_products,
    get_published_products,
    get_pending_products,
    get_all_products,
    query_califolio_data,
)


# ============================================================
# SERIALIZE TOOL RESULT
# ============================================================

def serialize_tool_result(result):
    """
    Convert SQLAlchemy objects into simple Python data
    that can safely be passed to the LLM.
    """

    if isinstance(result, list):
        serialized = []

        for item in result:
            if hasattr(item, "name"):
                serialized.append({
                    "name": item.name,
                    "status": getattr(item, "status", None),
                })
            else:
                serialized.append(str(item))

        return serialized

    return result


# ============================================================
# EXECUTE GEMINI-SELECTED TOOL
# ============================================================

def execute_tool(
    tool_name: str,
    current_user: User,
    db: Session,
    arguments: dict | None = None,
):
    """
    Execute a tool selected by Gemini.

    Gemini only selects the tool name.
    The backend supplies the authenticated user
    and database session.
    """

    arguments = arguments or {}

    tools = {
        "get_total_product_count": get_total_product_count,
        "get_published_product_count": get_published_product_count,
        "get_pending_product_count": get_pending_product_count,
        "get_draft_products": get_draft_products,
        "get_published_products": get_published_products,
        "get_pending_products": get_pending_products,
        "get_all_products": get_all_products,
        "query_calinova_data": query_califolio_data,
    }

    tool = tools.get(tool_name)

    if tool is None:
        raise ValueError(
            f"Unknown AI tool: {tool_name}"
        )

    # Execute the authorized database tool
    result = tool(
        current_user=current_user,
        db=db,
        **arguments,
    )

    # Convert SQLAlchemy objects into LLM-readable data
    return serialize_tool_result(result)