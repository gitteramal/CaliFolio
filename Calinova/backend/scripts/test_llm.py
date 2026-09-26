from app.ai.llm import generate_answer


def main():
    question = "What is Calinova?"

    context = """
Calinova is a product showcase and review platform.
It has three user roles: Admin, Founder, and Guest.
"""

    answer = generate_answer(
        question=question,
        context=context,
    )

    print("\nQuestion:")
    print(question)

    print("\nAnswer:")
    print(answer)


if __name__ == "__main__":
    main()