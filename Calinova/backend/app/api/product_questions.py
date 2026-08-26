from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_db,
    get_current_guest,
    get_current_admin,
)
from app.models.user import User
from app.models.product import Product
from app.models.product_question import ProductQuestion

from app.models.product_question_answer import ProductQuestionAnswer

from app.schemas.product_question import (
    ProductQuestionCreate,
    ProductQuestionResponse,
    ProductQuestionAnswerCreate,
    ProductQuestionAnswerResponse,
    AdminProductQuestionResponse,
    GuestProductQuestionResponse,
)


router = APIRouter(
    prefix="/product-questions",
    tags=["Product Questions"],
)


# =========================================================
# CREATE QUESTION
# =========================================================

@router.post(
    "",
    response_model=ProductQuestionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_question(
    question_data: ProductQuestionCreate,
    current_user: User = Depends(get_current_guest),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == question_data.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    new_question = ProductQuestion(
        product_id=question_data.product_id,
        guest_id=current_user.id,
        question=question_data.question,
        status="pending",
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    return new_question


# =========================================================
# GET MY QUESTIONS
# Guest sees their own questions and admin answers
# =========================================================

# =========================================================
# GET MY QUESTIONS
# Guest sees their questions + admin answers
# =========================================================

@router.get(
    "/my",
    response_model=list[GuestProductQuestionResponse],
)
def get_my_questions(
    current_user: User = Depends(get_current_guest),
    db: Session = Depends(get_db),
):
    questions = (
        db.query(ProductQuestion)
        .filter(
            ProductQuestion.guest_id == current_user.id
        )
        .order_by(ProductQuestion.created_at.desc())
        .all()
    )

    result = []

    for question in questions:

        answer = (
            db.query(ProductQuestionAnswer)
            .filter(
                ProductQuestionAnswer.question_id
                == question.id
            )
            .first()
        )

        result.append({
            "id": question.id,
            "product_id": question.product_id,
            "guest_id": question.guest_id,
            "question": question.question,
            "status": question.status,
            "created_at": question.created_at,
            "updated_at": question.updated_at,

            "answer": (
                answer.answer
                if answer
                else None
            ),

            "answer_id": (
                answer.id
                if answer
                else None
            ),

            "admin_id": (
                answer.admin_id
                if answer
                else None
            ),

            "answer_created_at": (
                answer.created_at
                if answer
                else None
            ),

            "answer_updated_at": (
                answer.updated_at
                if answer
                else None
            ),
        })

    return result


# =========================================================
# ANSWER QUESTION — ADMIN
# =========================================================

@router.post(
    "/{question_id}/answer",
    response_model=ProductQuestionAnswerResponse,
    status_code=status.HTTP_201_CREATED,
)
def answer_question(
    question_id: int,
    answer_data: ProductQuestionAnswerCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):

    # -----------------------------------------------------
    # FIND QUESTION
    # -----------------------------------------------------

    question = (
        db.query(ProductQuestion)
        .filter(ProductQuestion.id == question_id)
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found.",
        )

    # -----------------------------------------------------
    # CHECK IF ALREADY ANSWERED
    # -----------------------------------------------------

    existing_answer = (
        db.query(ProductQuestionAnswer)
        .filter(
            ProductQuestionAnswer.question_id
            == question_id
        )
        .first()
    )

    if existing_answer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This question has already been answered.",
        )

    # -----------------------------------------------------
    # CREATE ANSWER
    # -----------------------------------------------------

    answer = ProductQuestionAnswer(
        question_id=question_id,
        admin_id=current_user.id,
        answer=answer_data.answer,
    )

    db.add(answer)

    # -----------------------------------------------------
    # UPDATE QUESTION STATUS
    # -----------------------------------------------------

    question.status = "answered"

    db.commit()

    db.refresh(answer)

    return answer

# =========================================================
# ADMIN - GET ALL QUESTIONS WITH ANSWERS
# =========================================================

@router.get(
    "/admin",
    response_model=list[AdminProductQuestionResponse],
)
def get_admin_questions(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    questions = (
        db.query(ProductQuestion)
        .order_by(ProductQuestion.created_at.desc())
        .all()
    )

    result = []

    for question in questions:

        answer = (
            db.query(ProductQuestionAnswer)
            .filter(
                ProductQuestionAnswer.question_id == question.id
            )
            .first()
        )

        result.append({
            "id": question.id,
            "product_id": question.product_id,
            "guest_id": question.guest_id,
            "question": question.question,
            "status": question.status,
            "created_at": question.created_at,
            "updated_at": question.updated_at,

            # Answer information
            "answer": answer.answer if answer else None,
            "answer_id": answer.id if answer else None,
            "admin_id": answer.admin_id if answer else None,
            "answer_created_at": (
                answer.created_at if answer else None
            ),
            "answer_updated_at": (
                answer.updated_at if answer else None
            ),
        })

    return result