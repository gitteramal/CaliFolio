from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


db = SessionLocal()

try:
    founder = User(
        full_name="jos paul",
        email="founder@jos.com",
        password_hash=hash_password("founder1234"),
        role="founder",
    )

    db.add(founder)
    db.commit()
    db.refresh(founder)

    print("Founder created successfully!")
    print("ID:", founder.id)
    print("Email:", founder.email)
    print("Role:", founder.role)

finally:
    db.close()