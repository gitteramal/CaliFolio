from getpass import getpass

from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


def main():
    db: Session = SessionLocal()

    try:
        full_name = input("Full Name: ").strip()
        email = input("Email: ").strip().lower()
        role = input("Role (admin/owner/viewer/guest): ").strip().lower()

        password = getpass("Password: ")
        confirm_password = getpass("Confirm Password: ")

        if password != confirm_password:
            print("❌ Passwords do not match.")
            return

        if role not in ["admin", "owner", "viewer", "guest"]:
            print("❌ Invalid role.")
            return

        existing_user = db.query(User).filter(User.email == email).first()

        if existing_user:
            print("❌ User already exists.")
            return

        user = User(
            full_name=full_name,
            email=email,
            password_hash=hash_password(password),
            role=role,
            is_active=True,
        )

        db.add(user)
        db.commit()

        print("✅ User created successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    main()