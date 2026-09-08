from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.products import router as products_router
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api import product_questions
from app.api import password_reset
from app.models.product_question import ProductQuestion
from app.models.product_question_answer import ProductQuestionAnswer

from app.db.database import Base, engine

from app.models.user import User
from app.models.product import Product
from app.models.password_reset_token import PasswordResetToken



# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Califolio API"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:4173",
        "https://lemon-dune-08e2b8e10.6.azurestaticapps.net",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROUTES
# =========================================================

# Authentication
app.include_router(auth_router)

# Products
app.include_router(products_router)

# Users
app.include_router(users_router)

app.include_router(product_questions.router)

app.include_router(password_reset.router)

# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Califolio API is running"
    }