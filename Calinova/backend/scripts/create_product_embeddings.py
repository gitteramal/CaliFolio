from app.db.database import SessionLocal
from app.models.product import Product
from app.ai.product_embeddings import save_product_embedding


def main():
    db = SessionLocal()

    try:
        products = db.query(Product).all()

        print(f"Found {len(products)} products.")

        for product in products:
            print(
                f"Creating embedding for product "
                f"{product.id}: {product.name}"
            )

            save_product_embedding(
                product=product,
                db=db,
            )

            print(
                f"✓ Embedding saved for product {product.id}"
            )

        print("\nAll product embeddings created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    main()