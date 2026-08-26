from app.db.database import SessionLocal
from app.models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

db = SessionLocal()

try:
    email = "guest2@gmail.com"
    password = "guest12345"

    existing = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing:
        print("Guest already exists.")
    else:
        guest = User(
            full_name="govn buyer",
            email=email,
            password_hash=pwd_context.hash(password),
            role="guest",
            is_active=True,
        )

        db.add(guest)
        db.commit()
        db.refresh(guest)

        print("Guest created successfully!")
        print("ID:", guest.id)
        print("Email:", guest.email)
        print("Role:", guest.role)

finally:
    db.close()