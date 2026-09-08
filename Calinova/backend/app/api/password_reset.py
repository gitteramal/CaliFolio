import os
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import (
    generate_password_reset_token,
    hash_reset_token,
)
from app.models.user import User
from app.models.password_reset_token import PasswordResetToken
from app.schemas.password_reset import ForgotPasswordRequest


router = APIRouter(
    prefix="/auth",
    tags=["Password Reset"],
)


# =========================================================
# SEND PASSWORD RESET EMAIL
# =========================================================

def send_password_reset_email(
    email: str,
    reset_token: str,
):
    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )

    reset_url = (
        f"{frontend_url}/reset-password"
        f"?token={reset_token}"
    )

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(
        os.getenv("SMTP_PORT", "587")
    )
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from_email = os.getenv("SMTP_FROM_EMAIL")

    if not all([
        smtp_host,
        smtp_username,
        smtp_password,
        smtp_from_email,
    ]):
        raise RuntimeError(
            "SMTP configuration is incomplete."
        )

    message = EmailMessage()

    message["Subject"] = "Reset your CaliFolio password"
    message["From"] = smtp_from_email
    message["To"] = email

    message.set_content(
        f"""
Hello,

We received a request to reset your CaliFolio password.

Use the link below to create a new password:

{reset_url}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
CaliFolio
"""
    )

    with smtplib.SMTP(
        smtp_host,
        smtp_port,
        timeout=15,
    ) as server:

        server.starttls()

        server.login(
            smtp_username,
            smtp_password,
        )

        server.send_message(message)


# =========================================================
# FORGOT PASSWORD
# =========================================================

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # ALWAYS RETURN THE SAME RESPONSE
    # This prevents account/email enumeration.
    # -----------------------------------------------------

    generic_response = {
        "message": (
            "If an account exists for this email, "
            "a password reset link has been sent."
        )
    }

    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not user:
        return generic_response

    # -----------------------------------------------------
    # REMOVE OLD UNUSED RESET TOKENS
    # -----------------------------------------------------

    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False,
    ).delete(
        synchronize_session=False
    )

    # -----------------------------------------------------
    # GENERATE SECURE TOKEN
    # -----------------------------------------------------

    reset_token = generate_password_reset_token()

    token_hash = hash_reset_token(
        reset_token
    )

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=15)
    )

    reset_record = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        used=False,
    )

    db.add(reset_record)
    db.commit()

    # -----------------------------------------------------
    # SEND EMAIL
    # -----------------------------------------------------

    try:
        send_password_reset_email(
            user.email,
            reset_token,
        )

    except Exception:
        # Don't expose SMTP details to the client.
        db.delete(reset_record)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to send password reset email.",
        )

    return generic_response