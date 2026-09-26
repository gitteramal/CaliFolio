import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai import errors


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured."
    )


# =========================================================
# GEMINI CLIENT
# =========================================================

client = genai.Client(
    api_key=GEMINI_API_KEY
)


# =========================================================
# MODEL
# =========================================================

MODEL_NAME = "gemini-3.5-flash-lite"


# =========================================================
# GENERATE ANSWER
# =========================================================

def generate_answer(
    question: str,
    context: str,
) -> str:

    system_instruction = """
You are the Calinova AI Assistant.

Your job is to answer questions ONLY using the Calinova information
provided in the context.

Rules:

1. Do not invent information.
2. Do not use outside knowledge to answer the question.
3. If the context does not contain enough information, say:
   "I couldn't find enough information about that in Calinova."
4. Give concise and clear answers.
5. Never reveal information that is not present in the provided context.
6. When referring to a product, always use the product name instead of the Product ID.
7. Do not expose internal database IDs unless the user explicitly asks for a product ID.
"""

    prompt = f"""
Context from Calinova:

{context}

User question:

{question}

Answer the user's question using only the context above.
"""

    # =====================================================
    # GEMINI REQUEST
    # =====================================================

    for attempt in range(3):

        try:

            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.2,
                ),
            )

            return response.text

        # =================================================
        # 429 — QUOTA EXCEEDED
        # =================================================

        except errors.ClientError as e:

            if e.code == 429:

                raise RuntimeError(
                    "The Gemini API quota has been exceeded. "
                    "Please try again later or check your Gemini API quota."
                )

            raise

        # =================================================
        # 503 — TEMPORARY GEMINI SERVER ERROR
        # =================================================

        except errors.ServerError as e:

            if e.code == 503:

                if attempt < 2:

                    time.sleep(2)

                    continue

                raise RuntimeError(
                    "The Gemini AI service is temporarily unavailable. "
                    "Please try again later."
                )

            raise

    # =====================================================
    # FALLBACK
    # =================================================

    raise RuntimeError(
        "The AI service is temporarily unavailable."
    )


# =========================================================
# ASK GEMINI TO SELECT A CALINOVA TOOL
# =========================================================

# =========================================================
# ASK GEMINI TO SELECT A CALINOVA TOOL
# =========================================================

def select_tool(question: str):

    """
    Ask Gemini which Calinova tool should handle the question.

    The generic database tool is intentionally the primary
    structured-data tool. The backend is responsible for
    authorization and query validation.

    Returns:

        {
            "tool_name": "...",
            "arguments": {...}
        }

    or None if no tool is appropriate.
    """

    tool_declarations = [

        # =====================================================
        # GENERIC CALINOVA DATABASE TOOL
        # =====================================================

        types.FunctionDeclaration(
            name="query_calinova_data",
            description=(
                "Query authorized Calinova application data. "

                "Use this tool for factual questions about "
                "Calinova users and products. "

                "IMPORTANT: Do not use the users entity when the "
                "question is asking about information that belongs "
                "to a product. "

                "Use entity='users' only for questions about "
                "application users themselves, such as how many "
                "users, guests, founders, or admins exist, or "
                "which users have a particular role. "

                "Use entity='products' for questions about products. "

                "If the user asks about a specific product's "
                "founders, team, company, description, problem, "
                "pricing, roadmap, demo video, website, pitch deck, "
                "version, integrations, customers, traction, or "
                "other product details, ALWAYS use entity='products' "
                "with operation='information'. "

                "For example, 'Who are the founders of Xitester?' "
                "must query entity='products' with the product name "
                "Xitester and request the founders_team field. "

                "Do NOT interpret 'founders of Xitester' as a request "
                "for users with role='founder'. "

                "Use operation='count' when the user asks how many. "

                "Use operation='list' when the user asks which "
                "products or users exist. "

                "Use operation='information' when the user asks "
                "for specific information about a product. "

                "For questions such as 'How many products do I have?', "
                "use entity='products' and operation='count'. "
                "Do not use a separate total-product-count function. "
                "The backend determines which products the current "
                "user is authorized to see. "

                "For questions such as 'How many of my products "
                "are published?', use entity='products', "
                "operation='count', and filter status='published'. "

                "For questions such as 'What products are published?', "
                "use entity='products', operation='list', and "
                "filter status='published'."
            ),

            parameters=types.Schema(
                type="OBJECT",
                properties={

                    # -------------------------------------------------
                    # ENTITY
                    # -------------------------------------------------

                    "entity": types.Schema(
                        type="STRING",
                        description=(
                            "The type of Calinova data to query. "
                            "Allowed values: users or products."
                        ),
                    ),

                    # -------------------------------------------------
                    # OPERATION
                    # -------------------------------------------------

                    "operation": types.Schema(
                        type="STRING",
                        description=(
                            "The operation to perform. "
                            "Allowed values: count, list, information."
                        ),
                    ),

                    # -------------------------------------------------
                    # FILTERS
                    # -------------------------------------------------

                    "filters": types.Schema(
                        type="OBJECT",
                        description=(
                            "Filters for the query. "

                            "For users, examples include "
                            "role='guest', role='founder', "
                            "or role='admin'. "

                            "For products, examples include "
                            "status='published', "
                            "status='pending_review', "
                            "status='draft', "
                            "or product_name='PDF Editor'."
                        ),
                    ),

                    # -------------------------------------------------
                    # FIELDS
                    # -------------------------------------------------

                    "fields": types.Schema(
                        type="ARRAY",
                        items=types.Schema(
                            type="STRING"
                        ),
                        description=(
                            "Specific product fields requested by "
                            "the user. "

                            "Examples include: "
                            "founders_team, "
                            "description, "
                            "problem, "
                            "how_it_works, "
                            "pricing, "
                            "website_url, "
                            "demo_video_url, "
                            "pitch_deck_url, "
                            "roadmap, "
                            "company, "
                            "version, "
                            "integrations, "
                            "customers, "
                            "traction."
                        ),
                    ),
                },

                required=[
                    "entity",
                    "operation",
                ],
            ),
        ),
    ]

    # =========================================================
    # CREATE GEMINI TOOL
    # =========================================================

    tool = types.Tool(
        function_declarations=tool_declarations
    )

    # =========================================================
    # ASK GEMINI TO SELECT THE TOOL
    # =========================================================

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=question,
        config=types.GenerateContentConfig(
            tools=[tool],
            automatic_function_calling=types.AutomaticFunctionCallingConfig(
                disable=True
            ),
            tool_config=types.ToolConfig(
                function_calling_config=types.FunctionCallingConfig(
                    mode="AUTO"
                )
            ),
        ),
    )

    # =========================================================
    # CHECK WHETHER GEMINI REQUESTED A FUNCTION
    # =========================================================

    if not response.candidates:
        return None

    parts = response.candidates[0].content.parts

    for part in parts:

        if part.function_call:

            return {
                "tool_name": part.function_call.name,
                "arguments": dict(
                    part.function_call.args or {}
                ),
            }

    return None


# =========================================================
# GENERATE ANSWER FROM TOOL RESULT
# =========================================================

def generate_tool_answer(
    question: str,
    tool_result,
) -> str:

    system_instruction = """
You are the Calinova AI Assistant.

Answer the user's question using ONLY the data returned by the
authorized Calinova tool.

Rules:

1. Do not invent information.
2. Do not use outside knowledge.
3. Treat the tool result as the only source of truth.
4. Answer naturally and clearly.
5. When listing products, always use their product names.
6. Do not expose internal database IDs unless the user explicitly asks for them.
7. Do not mention similarity scores, embeddings, vector search, or internal tools.
8. If the tool result is empty, say that you could not find the requested information.
"""

    prompt = f"""
User question:

{question}

Authorized Calinova data:

{tool_result}

Using only the authorized Calinova data above, answer the user's question.
"""

    # =====================================================
    # GEMINI REQUEST
    # =====================================================

    for attempt in range(3):

        try:

            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.2,
                ),
            )

            return response.text

        # =================================================
        # 429 — QUOTA EXCEEDED
        # =================================================

        except errors.ClientError as e:

            if e.code == 429:

                raise RuntimeError(
                    "The Gemini API quota has been exceeded. "
                    "Please try again later or check your Gemini API quota."
                )

            raise

        # =================================================
        # 503 — TEMPORARY GEMINI SERVER ERROR
        # =================================================

        except errors.ServerError as e:

            if e.code == 503:

                if attempt < 2:

                    time.sleep(2)

                    continue

                raise RuntimeError(
                    "The Gemini AI service is temporarily unavailable. "
                    "Please try again later."
                )

            raise

    # =====================================================
    # FALLBACK
    # =================================================

    raise RuntimeError(
        "The AI service is temporarily unavailable."
    )