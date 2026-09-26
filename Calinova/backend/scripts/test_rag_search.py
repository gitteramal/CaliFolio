from app.db.database import SessionLocal
from app.ai.product_embeddings import search_similar_products
from app.models.user import User


def main():
    db = SessionLocal()

    try:
        # Change this to a real user ID
        user = db.query(User).filter(User.id == 1).first()

        if not user:
            print("User not found.")
            return

        question = "Which product is related to PDF editing?"

        results = search_similar_products(
            question=question,
            current_user=user,
            db=db,
            limit=3,
        )

        print(f"\nUser: {user.full_name}")
        print(f"Role: {user.role}")
        print(f"Question: {question}\n")

        for embedding, distance in results:
            print("=" * 60)
            print(f"Product ID: {embedding.product_id}")
            print(f"Distance: {distance:.4f}")
            print("\nContent:")
            print(embedding.content)

    finally:
        db.close()


if __name__ == "__main__":
    main()