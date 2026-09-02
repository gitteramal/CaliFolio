import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const SEEN_ANSWER_IDS_KEY = "calinova_seen_answer_ids";

function markAnswersAsSeen(answerIds) {
  try {
    const seenAnswerIds = JSON.parse(
      localStorage.getItem(SEEN_ANSWER_IDS_KEY) || "[]"
    );
    const updatedAnswerIds = [...new Set([...seenAnswerIds, ...answerIds])];
    localStorage.setItem(SEEN_ANSWER_IDS_KEY, JSON.stringify(updatedAnswerIds));
    window.dispatchEvent(new Event("guest-question-notifications-updated"));
  } catch (err) {
    console.error("Failed to mark answers as seen:", err);
  }
}

export default function GuestProductQAPage() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    loadQuestions();
  }, []);

  // =========================================================
  // LOAD QUESTIONS
  // =========================================================

  async function loadQuestions() {
    try {
      setLoading(true);
      setError("");

      const token =
        sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "You are not authenticated."
        );
      }

      const res = await fetch(
        `${API_URL}/product-questions/my`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail ||
            "Unable to load questions."
        );
      }

      // Only questions for this product
      const productQuestions = data.filter(
        (item) =>
          Number(item.product_id) ===
          Number(productId)
      );

      setQuestions(productQuestions);

      // Opening this page means the guest has seen all current answers
      // for this product, so their notification badges can be cleared.
      markAnswersAsSeen(
        productQuestions
          .filter((item) => item.status === "answered" && item.answer_id)
          .map((item) => item.answer_id)
      );

    } catch (err) {
      console.error(
        "Failed to load questions:",
        err
      );

      setError(
        err.message ||
          "Unable to load questions."
      );

    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // ASK QUESTION
  // =========================================================

  async function submitQuestion(e) {
    e.preventDefault();

    const trimmedQuestion =
      question.trim();

    if (!trimmedQuestion) {
      setSubmitError(
        "Please enter a question."
      );
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const token =
        sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "You are not authenticated."
        );
      }

      const res = await fetch(
        `${API_URL}/product-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: Number(productId),
            question: trimmedQuestion,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail ||
            "Unable to submit question."
        );
      }

      // Clear input
      setQuestion("");

      // Reload questions
      await loadQuestions();

    } catch (err) {
      console.error(
        "Failed to submit question:",
        err
      );

      setSubmitError(
        err.message ||
          "Unable to submit question."
      );

    } finally {
      setSubmitting(false);
    }
  }

  // =========================================================
  // BACK
  // =========================================================

  function goBack() {
    navigate("/guest/showcase");
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full max-w-4xl">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-8">

        <button
          type="button"
          onClick={goBack}
          className="
            mb-5
            inline-flex
            items-center
            gap-2
            text-sm
            text-[#687780]
            transition-colors
            hover:text-[#006F8D]
          "
        >
          <ArrowLeft
            size={16}
            strokeWidth={1.8}
          />

          Back to showcase
        </button>


        <div className="flex items-center gap-2 text-[#82909A]">

          <MessageCircle
            size={15}
            strokeWidth={1.8}
          />

          <span
            className="
              font-mono
              text-[10px]
              tracking-[0.22em]
              uppercase
            "
          >
            Product Q&A
          </span>

        </div>


        <h1
          className="
            mt-3
            text-3xl
            font-semibold
            tracking-[-0.025em]
            text-[#111B26]
          "
        >
          Questions & Answers
        </h1>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-[#687780]
          "
        >
          Ask questions about this product and
          see responses from the admin team.
        </p>

      </div>


      {/* =====================================================
          ASK QUESTION
      ====================================================== */}

      <div
        className="
          mb-7
          rounded-2xl
          border
          border-[#DCE3E6]
          bg-white
          p-5
          shadow-[0_2px_8px_rgba(15,23,42,0.04)]
        "
      >

        <div className="mb-4 flex items-center gap-2">

          <MessageCircle
            size={17}
            className="text-[#0097C1]"
          />

          <h2
            className="
              text-sm
              font-semibold
              text-[#111B26]
            "
          >
            Ask a question
          </h2>

        </div>


        <form onSubmit={submitQuestion}>

          <textarea
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            placeholder="Ask something about this product..."
            rows={4}
            className="
              w-full
              resize-none
              rounded-xl
              border
              border-[#DCE3E6]
              bg-[#FAFCFC]
              px-4
              py-3
              text-sm
              text-[#111B26]
              placeholder:text-[#9AA6AD]
              outline-none
              transition
              focus:border-[#0097C1]
              focus:ring-2
              focus:ring-[#0097C1]/10
            "
          />


          {submitError && (
            <p className="mt-2 text-xs text-red-600">
              {submitError}
            </p>
          )}


          <div className="mt-4 flex justify-end">

            <button
              type="submit"
              disabled={submitting}
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-[#0097C1]
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-[#007FA3]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              <Send
                size={14}
                strokeWidth={1.8}
              />

              {submitting
                ? "Sending..."
                : "Ask question"}

            </button>

          </div>

        </form>

      </div>


      {/* =====================================================
          QUESTIONS
      ====================================================== */}

      <div>

        <div className="mb-4 flex items-center justify-between">

          <h2
            className="
              text-lg
              font-semibold
              text-[#111B26]
            "
          >
            Your questions
          </h2>

          <span
            className="
              font-mono
              text-[10px]
              uppercase
              tracking-[0.16em]
              text-[#8A969E]
            "
          >
            {questions.length}{" "}
            {questions.length === 1
              ? "QUESTION"
              : "QUESTIONS"}
          </span>

        </div>


        {loading && (
          <div className="py-10 text-center">

            <p className="text-sm text-[#687780]">
              Loading questions...
            </p>

          </div>
        )}


        {!loading && error && (
          <div
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
            "
          >
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}


        {!loading &&
          !error &&
          questions.length === 0 && (

            <div
              className="
                rounded-2xl
                border
                border-dashed
                border-[#D4DDE0]
                bg-[#F8FAFA]
                px-6
                py-12
                text-center
              "
            >

              <MessageCircle
                size={24}
                className="
                  mx-auto
                  text-[#9AA6AD]
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  font-medium
                  text-[#111B26]
                "
              >
                No questions yet
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  text-[#87939A]
                "
              >
                Ask the first question about
                this product.
              </p>

            </div>
          )}


        {!loading &&
          !error &&
          questions.length > 0 && (

            <div className="space-y-4">

              {questions.map((item) => (

                <div
                  key={item.id}
                  className="
                    rounded-2xl
                    border
                    border-[#DCE3E6]
                    bg-white
                    p-5
                  "
                >

                  {/* Question */}

                  <div className="flex items-start gap-3">

                    <div
                      className="
                        mt-0.5
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[#0097C1]/10
                      "
                    >
                      <MessageCircle
                        size={15}
                        className="text-[#0097C1]"
                      />
                    </div>


                    <div className="min-w-0 flex-1">

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >

                        <p
                          className="
                            text-sm
                            font-medium
                            leading-6
                            text-[#111B26]
                          "
                        >
                          {item.question}
                        </p>


                        {item.status ===
                        "answered" ? (

                          <span
                            className="
                              inline-flex
                              shrink-0
                              items-center
                              gap-1
                              rounded-full
                              bg-green-50
                              px-2.5
                              py-1
                              text-[10px]
                              font-medium
                              text-green-700
                            "
                          >
                            <CheckCircle2
                              size={11}
                            />

                            Answered
                          </span>

                        ) : (

                          <span
                            className="
                              inline-flex
                              shrink-0
                              items-center
                              gap-1
                              rounded-full
                              bg-amber-50
                              px-2.5
                              py-1
                              text-[10px]
                              font-medium
                              text-amber-700
                            "
                          >
                            <Clock
                              size={11}
                            />

                            Awaiting answer
                          </span>

                        )}

                      </div>


                      {/* Answer */}

                      {item.answer ? (

                        <div
                          className="
                            mt-4
                            rounded-xl
                            border
                            border-[#E3E9EB]
                            bg-[#F7FAFA]
                            px-4
                            py-4
                          "
                        >

                          <p
                            className="
                              mb-1.5
                              font-mono
                              text-[9px]
                              uppercase
                              tracking-[0.16em]
                              text-[#0097C1]
                            "
                          >
                            Admin answer
                          </p>

                          <p
                            className="
                              text-sm
                              leading-6
                              text-[#46555E]
                            "
                          >
                            {item.answer}
                          </p>

                        </div>

                      ) : (

                        <p
                          className="
                            mt-3
                            text-xs
                            text-[#8A969E]
                          "
                        >
                          An admin will respond to
                          your question.
                        </p>

                      )}

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

      </div>

    </div>
  );
}
