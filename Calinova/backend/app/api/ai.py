from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Literal

from app.models.user import User
from app.core.dependencies import get_current_user, get_db

from app.ai.product_embeddings import search_similar_products

from app.ai.llm import (
    select_tool,
    generate_answer,
    generate_tool_answer,
)

from app.ai.tool_executor import execute_tool


router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class ChatRequest(BaseModel):
    question: str
    mode: Literal["rag", "rag_llm"] = "rag_llm"


# ============================================================
# AI CHAT
# ============================================================

@router.post("/chat")
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:

        print("================================")
        print("AI QUESTION:", request.question)
        print("AI ROLE:", current_user.role)
        print("================================")


        # =====================================================
        # STEP 1 — LET GEMINI SELECT A DATABASE TOOL
        # =====================================================

        tool_selection = select_tool(request.question)

        print("AI TOOL SELECTION:", tool_selection)


        # =====================================================
        # STEP 2 — DATABASE TOOL FLOW
        # =====================================================

        if tool_selection:

            tool_name = tool_selection["tool_name"]
            arguments = tool_selection.get("arguments", {})

            print("AI SOURCE: DATABASE TOOL")
            print("AI TOOL:", tool_name)
            print("AI ARGUMENTS:", arguments)


            # -------------------------------------------------
            # Execute authorized database tool
            # -------------------------------------------------

            tool_result = execute_tool(
                tool_name=tool_name,
                current_user=current_user,
                db=db,
                arguments=arguments,
            )


            print("================================")
            print("TOOL RESULT:", tool_result)
            print("================================")


            # -------------------------------------------------
            # RAG MODE
            # Return structured data without final LLM answer
            # -------------------------------------------------

            if request.mode == "rag":

                return {
                    "success": True,
                    "question": request.question,
                    "mode": "rag",
                    "role": current_user.role,
                    "response": {
                        "type": "database_tool",
                        "tool": tool_name,
                        "data": tool_result,
                    },
                }


            # -------------------------------------------------
            # RAG + LLM MODE
            # Convert tool result into natural language
            # -------------------------------------------------

            answer = generate_tool_answer(
                question=request.question,
                tool_result=tool_result,
            )


            return {
                "success": True,
                "question": request.question,
                "mode": "rag_llm",
                "role": current_user.role,
                "response": {
                    "type": "database_tool_llm",
                    "tool": tool_name,
                    "answer": answer,
                    "data": tool_result,
                },
            }


        # =====================================================
        # STEP 3 — NO DATABASE TOOL SELECTED
        # FALL BACK TO RAG
        # =====================================================

        print("AI SOURCE: RAG")


        results = search_similar_products(
            question=request.question,
            current_user=current_user,
            db=db,
            limit=3,
        )


        # =====================================================
        # STEP 4 — NO RAG RESULTS
        # =====================================================

        if not results:

            return {
                "success": True,
                "question": request.question,
                "mode": request.mode,
                "role": current_user.role,
                "response": {
                    "type": "rag",
                    "answer": (
                        "I couldn't find enough information "
                        "about that in Calinova."
                    ),
                    "sources": [],
                },
            }


        # =====================================================
        # STEP 5 — RAG MODE
        # Return retrieved information
        # =====================================================

        if request.mode == "rag":

            retrieved_products = []

            for embedding, distance in results:

                retrieved_products.append({
                    "product_id": embedding.product_id,
                    "distance": round(float(distance), 4),
                    "content": embedding.content,
                })


            return {
                "success": True,
                "question": request.question,
                "mode": "rag",
                "role": current_user.role,
                "response": {
                    "type": "rag",
                    "results": retrieved_products,
                },
            }


        # =====================================================
        # STEP 6 — BUILD RAG CONTEXT
        # =====================================================

        context_parts = []

        for embedding, distance in results:

            context_parts.append(
                f"""
Product ID: {embedding.product_id}

Product information:
{embedding.content}
"""
            )


        context = "\n\n---\n\n".join(context_parts)


        # =====================================================
        # STEP 7 — RAG + LLM
        # =====================================================

        answer = generate_answer(
            question=request.question,
            context=context,
        )


        # =====================================================
        # STEP 8 — RETURN RAG + LLM RESPONSE
        # =====================================================

        return {
            "success": True,
            "question": request.question,
            "mode": "rag_llm",
            "role": current_user.role,
            "response": {
                "type": "rag_llm",
                "answer": answer,
                "sources": [
                    {
                        "product_id": embedding.product_id,
                        "distance": round(float(distance), 4),
                    }
                    for embedding, distance in results
                ],
            },
        }


    # =========================================================
    # PERMISSION ERROR
    # =========================================================

    except PermissionError as e:

        return {
            "success": True,
            "question": request.question,
            "mode": request.mode,
            "role": current_user.role,
            "response": {
                "type": "unauthorized",
                "answer": str(e),
            },
        }


    # =========================================================
    # LLM / API ERROR
    # =========================================================

    except RuntimeError as e:

        return {
            "success": False,
            "question": request.question,
            "mode": request.mode,
            "role": current_user.role,
            "response": {
                "type": "llm_error",
                "answer": str(e),
            },
        }


    # =========================================================
    # GENERAL ERROR
    # =========================================================

    except Exception as e:

        print("AI CHAT ERROR:", e)

        return {
            "success": False,
            "question": request.question,
            "mode": request.mode,
            "role": current_user.role,
            "response": {
                "type": "error",
                "answer": (
                    "Something went wrong while processing "
                    "your request."
                ),
            },
        }