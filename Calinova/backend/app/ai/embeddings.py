from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"

model = SentenceTransformer(MODEL_NAME)


def generate_embedding(text: str):
    """
    Convert text into a vector embedding.
    """

    embedding = model.encode(
        text,
        normalize_embeddings=True,
    )

    return embedding.tolist()