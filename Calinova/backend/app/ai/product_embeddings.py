from sqlalchemy.orm import Session
from app.models.product_embedding import ProductEmbedding

from app.models.product import Product
from app.ai.embeddings import generate_embedding

from app.models.guest_product_access import GuestProductAccess
from app.models.user import User


def build_product_content(
    product: Product,
    guest_safe: bool = False,
) -> str:
    """
    Build searchable text from a Calinova product.

    If guest_safe=True, only fields enabled in
    product.guest_visibility are included.
    """

    fields = {
        "name": ("Product Name", product.name),
        "version": ("Version", product.version),
        "one_liner": ("One Liner", product.one_liner),
        "stage": ("Stage", product.stage),
        "origin": ("Origin", product.origin),
        "description": ("Description", product.description),
        "problem": ("Problem", product.problem),
        "how_it_works": ("How It Works", product.how_it_works),
        "ideal_customer_profile": (
            "Ideal Customer Profile",
            product.ideal_customer_profile,
        ),
        "value_proposition": (
            "Value Proposition",
            product.value_proposition,
        ),
        "highlights": ("Highlights", product.highlights),
        "company": ("Company", product.company),
        "headquarters": ("Headquarters", product.headquarters),
        "founded": ("Founded", product.founded),
        "team_size": ("Team Size", product.team_size),
        "deployment": ("Deployment", product.deployment),
        "pricing": ("Pricing", product.pricing),
        "founders_team": (
            "Founders / Team",
            product.founders_team,
        ),
        "key_clients": (
            "Key Clients",
            product.key_clients,
        ),
        "roadmap": ("Roadmap", product.roadmap),
        "compliance": (
            "Compliance",
            product.compliance,
        ),
        "integrations": (
            "Integrations",
            product.integrations,
        ),
        "users": ("Users", product.users),
        "customers": ("Customers", product.customers),
        "traction": ("Traction", product.traction),
        "funds_raised": (
            "Funds Raised",
            product.funds_raised,
        ),
    }

    visibility = product.guest_visibility or {}

    sections = []

    for field_name, (label, value) in fields.items():

        # For guest-safe content, check guest_visibility
        if guest_safe:
            if not visibility.get(field_name, False):
                continue

        if value:
            sections.append(
                f"{label}: {value}"
            )

    return "\n".join(sections)


def create_product_embedding(product: Product):
    content = build_product_content(
        product,
        guest_safe=False
    )

    embedding = generate_embedding(content)

    return content, embedding

def save_product_embedding(product: Product, db: Session):
    content, embedding = create_product_embedding(product)

    existing = (
        db.query(ProductEmbedding)
        .filter(ProductEmbedding.product_id == product.id)
        .first()
    )

    if existing:
        existing.content = content
        existing.embedding = embedding

    else:
        product_embedding = ProductEmbedding(
            product_id=product.id,
            content=content,
            embedding=embedding,
        )

        db.add(product_embedding)

    db.commit()

    return {
        "product_id": product.id,
        "message": "Product embedding saved successfully.",
    }
    
def search_similar_products(
    question: str,
    current_user: User,
    db: Session,
    limit: int = 3,
):
    """
    Search product embeddings only within products
    the current user is authorized to access.
    """

    authorized_product_ids = get_authorized_product_ids(
        current_user=current_user,
        db=db,
    )

    if not authorized_product_ids:
        return []

    question_embedding = generate_embedding(question)

    results = (
        db.query(
            ProductEmbedding,
            ProductEmbedding.embedding.cosine_distance(
                question_embedding
            ).label("distance"),
        )
        .filter(
            ProductEmbedding.product_id.in_(
                authorized_product_ids
            )
        )
        .order_by(
            ProductEmbedding.embedding.cosine_distance(
                question_embedding
            )
        )
        .limit(limit)
        .all()
    )

    return results

def get_authorized_product_ids(
    current_user: User,
    db: Session,
):
    """
    Return product IDs that the current user is allowed
    to search through RAG.
    """

    if current_user.role == "admin":
        products = (
            db.query(Product.id)
            .all()
        )

        return [product_id for product_id, in products]

    if current_user.role == "founder":
        products = (
            db.query(Product.id)
            .filter(
                Product.founder_id == current_user.id
            )
            .all()
        )

        return [product_id for product_id, in products]

    if current_user.role == "guest":
        products = (
            db.query(Product.id)
            .join(
                GuestProductAccess,
                GuestProductAccess.product_id == Product.id,
            )
            .filter(
                GuestProductAccess.guest_id == current_user.id
            )
            .all()
        )

        return [product_id for product_id, in products]

    raise PermissionError(
        "You are not authorized to search products."
    )