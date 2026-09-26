
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.dependencies import get_current_user, get_db
from app.ai.database_tools import get_product_for_ai
from app.ai.llm import select_tool
from app.ai.tool_executor import execute_tool
from app.ai.llm import generate_tool_answer

from app.ai.database_tools import (
    get_founder_count,
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


router = APIRouter(
    prefix="/ai-test",
    tags=["AI Test"],
)


# ============================================================
# ADMIN TESTS
# ============================================================

@router.get("/founder-count")
def founder_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        count = get_founder_count(
            current_user=current_user,
            db=db,
        )

        return {
            "success": True,
            "founder_count": count,
        }

    except PermissionError as e:
        return {
            "success": False,
            "error": str(e),
        }


@router.get("/total-product-count")
def total_product_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        count = get_total_product_count(
            current_user=current_user,
            db=db,
        )

        return {
            "success": True,
            "product_count": count,
        }

    except PermissionError as e:
        return {
            "success": False,
            "error": str(e),
        }


@router.get("/published-product-count")
def published_product_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        count = get_published_product_count(
            current_user=current_user,
            db=db,
        )

        return {
            "success": True,
            "published_product_count": count,
        }

    except PermissionError as e:
        return {
            "success": False,
            "error": str(e),
        }


@router.get("/pending-product-count")
def pending_product_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        count = get_pending_product_count(
            current_user=current_user,
            db=db,
        )

        return {
            "success": True,
            "pending_product_count": count,
        }

    except PermissionError as e:
        return {
            "success": False,
            "error": str(e),
        }


@router.get("/all-products")
def all_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        products = get_all_products(
            current_user=current_user,
            db=db,
        )

        return {
            "success": True,
            "products": [
                {
                    "id": product.id,
                    "name": product.name,
                    "status": product.status,
                    "founder_id": product.founder_id,
                }
                for product in products
            ],
        }

    except PermissionError as e:
        return {
            "success": False,
            "error": str(e),
        }


@router.get("/all-users")
def all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        users = get_all_users(
            current_user=current_user,
            db=db,
        )

        return {
            "success": True,
            "users": [
                {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "role": user.role,
                    "is_active": user.is_active,
                }
                for user in users
            ],
        }

    except PermissionError as e:
        return {
            "success": False,
            "error": str(e),
        }


@router.get("/all-guest-access")
def all_guest_access(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        records = get_all_guest_product_access(
            current_user=current_user,
            db=db,
        )

        return {
            "success": True,
            "assignments": [
                {
                    "id": record.id,
                    "guest_id": record.guest_id,
                    "product_id": record.product_id,
                    "assigned_at": record.assigned_at,
                }
                for record in records
            ],
        }

    except PermissionError as e:
        return {
            "success": False,
            "error": str(e),
        }


# ============================================================
# FOUNDER TESTS
# ============================================================

@router.get("/my-product-count")
def my_product_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        count = get_my_product_count(
            current_user=current_user,
            db=db,
        )

        return {
            "success": True,
            "product_count": count,
        }

    except PermissionError as e:
        return {
            "success": False,
            "error": str(e),
        }


@router.get("/my-products")
def my_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        products = get_my_products(
            current_user=current_user,
            db=db,
        )

        return {
            "success": True,
            "products": [
                {
                    "id": product.id,
                    "name": product.name,
                    "status": product.status,
                    "founder_id": product.founder_id,
                }
                for product in products
            ],
        }

    except PermissionError as e:
        return {
            "success": False,
            "error": str(e),
        }


@router.get("/my-product-status/{product_id}")
def my_product_status(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        result = get_my_product_status(
            current_user=current_user,
            product_id=product_id,
            db=db,
        )

        return {
            "success": True,
            "product": result,
        }

    except PermissionError as e:
        return {
            "success": False,
            "error": str(e),
        }


# ============================================================
# GUEST TESTS
# ============================================================

@router.get("/my-guest-products")
def my_guest_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        products = get_my_guest_products(
            current_user=current_user,
            db=db,
        )

        return {
            "success": True,
            "products": [
                {
                    "id": product.id,
                    "name": product.name,
                    "status": product.status,
                }
                for product in products
            ],
        }

    except PermissionError as e:
        return {
            "success": False,
            "error": str(e),
        }

@router.get("/product/{product_id}")
def ai_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        product = get_product_for_ai(
            current_user=current_user,
            product_id=product_id,
            db=db,
        )

        return {
            "success": True,
            "product": product,
        }

    except PermissionError as e:
        return {
            "success": False,
            "error": str(e),
        }

    except ValueError as e:
        return {
            "success": False,
            "error": str(e),
        }
        
# ============================================================
# LLM TOOL SELECTION TEST
# ============================================================

@router.get("/test-tool")
def test_tool():

    question = "What products are pending review?"

    result = select_tool(question)

    return {
        "question": question,
        "tool_selection": result,
    }
    
@router.get("/test-tool-execution")
def test_tool_execution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question = "What products are pending review?"

    # Step 1: Ask Gemini which tool should be used
    tool_selection = select_tool(question)

    # Step 2: Execute the selected tool
    result = execute_tool(
        tool_name=tool_selection["tool_name"],
        current_user=current_user,
        db=db,
        arguments=tool_selection.get("arguments", {}),
    )

    return {
        "question": question,
        "tool_selection": tool_selection,
        "tool_result": result,
    }
    
@router.get("/test-tool-answer")
def test_tool_answer(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question = "What products are pending review?"

    # Step 1: Gemini selects the tool
    tool_selection = select_tool(question)

    if not tool_selection:
        return {
            "success": False,
            "question": question,
            "message": "No tool was selected.",
        }

    # Step 2: Execute the authorized tool
    tool_result = execute_tool(
        tool_name=tool_selection["tool_name"],
        current_user=current_user,
        db=db,
        arguments=tool_selection.get("arguments", {}),
    )
    print("================================")
    print("TOOL RESULT:")
    print(tool_result)
    print("TOOL RESULT TYPE:", type(tool_result))
    print("================================")

    # Step 3: Gemini converts the tool result into a natural answer
    answer = generate_tool_answer(
        question=question,
        tool_result=tool_result,
    )

    return {
        "success": True,
        "question": question,
        "tool_selection": tool_selection,
        "answer": answer,
    }
    
@router.get("/test-generic-tool")
def test_generic_tool():
    question = "How many guests are there?"

    result = select_tool(question)

    return {
        "question": question,
        "tool_selection": result,
    }
@router.get("/test-generic-tool-answer")
def test_generic_tool_answer(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question = "how many founders are there?"

    # Step 1 — Gemini selects the generic tool
    tool_selection = select_tool(question)

    if not tool_selection:
        return {
            "success": False,
            "message": "No tool was selected.",
        }

    # Step 2 — Execute the authorized database tool
    tool_result = execute_tool(
        tool_name=tool_selection["tool_name"],
        current_user=current_user,
        db=db,
        arguments=tool_selection.get("arguments", {}),
    )

    # Step 3 — Gemini converts the result into a natural answer
    answer = generate_tool_answer(
        question=question,
        tool_result=tool_result,
    )

    return {
        "success": True,
        "question": question,
        "tool_selection": tool_selection,
        "tool_result": tool_result,
        "answer": answer,
    }