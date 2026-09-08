from app.db.database import engine
from sqlalchemy import inspect, text


def run():
    inspector = inspect(engine)
    existing_cols = [col["name"] for col in inspector.get_columns("products")]
    print("Existing columns:", existing_cols)

    with engine.connect() as conn:
        if "is_edited" not in existing_cols:
            conn.execute(
                text("ALTER TABLE products ADD COLUMN is_edited BOOLEAN NOT NULL DEFAULT FALSE")
            )
            print("Added: is_edited BOOLEAN NOT NULL DEFAULT FALSE")
        else:
            print("is_edited already exists - skipped")

        if "pending_edits" not in existing_cols:
            conn.execute(
                text("ALTER TABLE products ADD COLUMN pending_edits JSONB")
            )
            print("Added: pending_edits JSONB")
        else:
            print("pending_edits already exists - skipped")

        conn.commit()
        print("Migration complete.")


run()

