import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  User,
  Clock,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";
const BRAND = "#0097c1";

export default function ProductQuestionsPage() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState({});
  const [answerLoading, setAnswerLoading] = useState(null);

  // =========================================================
  // LOAD QUESTIONS
  // =========================================================

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    setLoading(true);
    setError("");

    try {
      const token =
        sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "You are not authenticated."
        );
      }

      const res = await fetch(
        `${API_URL}/product-questions/admin`,
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
        (question) =>
          Number(question.product_id) ===
          Number(productId)
      );

      setQuestions(productQuestions);
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
  // ANSWER INPUT
  // =========================================================

  function handleAnswerChange(
    questionId,
    value
  ) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  // =========================================================
  // SUBMIT ANSWER
  // =========================================================

  async function submitAnswer(questionId) {
    const answer =
      answers[questionId]?.trim();

    if (!answer) {
      return;
    }

    setAnswerLoading(questionId);

    try {
      const token =
        sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "You are not authenticated."
        );
      }

      const res = await fetch(
        `${API_URL}/product-questions/${questionId}/answer`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answer,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail ||
            "Unable to submit answer."
        );
      }

      // Clear answer box
      setAnswers((prev) => {
        const updated = {
          ...prev,
        };

        delete updated[questionId];

        return updated;
      });

      // Reload questions so answered status
      // and answer are immediately reflected
      await loadQuestions();
      window.dispatchEvent(
        new Event("admin-question-notifications-updated")
      );
    } catch (err) {
      console.error(
        "Failed to submit answer:",
        err
      );

      alert(
        err.message ||
          "Unable to submit answer."
      );
    } finally {
      setAnswerLoading(null);
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="p-7">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-7">

        <button
          type="button"
          onClick={() =>
            navigate("/admin/software")
          }
          className="
            mb-5
            inline-flex
            items-center
            gap-2
            text-sm
            text-[#687780]
            transition
            hover:text-[#006F8D]
          "
        >
          <ArrowLeft size={16} />

          Back to showcase
        </button>

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
            "
            style={{
              backgroundColor:
                "rgba(0,151,193,0.08)",
            }}
          >
            <MessageSquare
              size={21}
              style={{
                color: BRAND,
              }}
            />
          </div>

          <div>

            <h1 className="text-2xl font-bold text-[#111B26]">
              Product Q&A
            </h1>

            <p className="mt-1 text-sm text-[#687780]">
              Questions asked by guests about
              this product.
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="
          mb-5
          rounded-xl
          border
          border-red-200
          bg-red-50
          px-4
          py-3
          text-sm
          text-red-700
        ">
          {error}
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="
          rounded-xl
          border
          border-[#DCE3E6]
          bg-white
          p-10
          text-center
        ">
          <p className="text-sm text-[#687780]">
            Loading questions...
          </p>
        </div>
      )}

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading &&
        !error &&
        questions.length === 0 && (
          <div className="
            rounded-xl
            border
            border-[#DCE3E6]
            bg-white
            p-12
            text-center
          ">

            <div className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-[#F1F8FA]
            ">
              <MessageSquare
                size={21}
                style={{
                  color: BRAND,
                }}
              />
            </div>

            <h3 className="
              mt-4
              text-sm
              font-semibold
              text-[#111B26]
            ">
              No questions yet
            </h3>

            <p className="
              mt-1
              text-sm
              text-[#87939A]
            ">
              Guests have not asked any questions
              about this product.
            </p>

          </div>
        )}

      {/* =====================================================
          QUESTIONS
      ===================================================== */}

      {!loading &&
        !error &&
        questions.length > 0 && (

          <div className="space-y-5">

            {questions.map((item) => (

              <div
                key={item.id}
                className="
                  rounded-2xl
                  border
                  border-[#DCE3E6]
                  bg-white
                  shadow-[0_2px_8px_rgba(15,23,42,0.04)]
                "
              >

                {/* ===========================================
                    QUESTION HEADER
                =========================================== */}

                <div className="
                  border-b
                  border-[#E9EEF0]
                  px-6
                  py-5
                ">

                  <div className="
                    flex
                    items-start
                    justify-between
                    gap-5
                  ">

                    <div className="min-w-0">

                      <div className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                      ">

                        <div className="
                          flex
                          items-center
                          gap-1.5
                          text-xs
                          text-[#687780]
                        ">
                          <User size={14} />

                          {item.guest_name ||
                            item.guest?.full_name ||
                            "Guest"}
                        </div>

                        {item.guest_email && (
                          <span className="
                            text-xs
                            text-[#9AA6AD]
                          ">
                            {item.guest_email}
                          </span>
                        )}

                      </div>

                      <h2 className="
                        mt-4
                        text-[16px]
                        font-medium
                        leading-7
                        text-[#111B26]
                      ">
                        {item.question}
                      </h2>

                    </div>

                    {/* STATUS */}

                    <span
                      className={`
                        shrink-0
                        rounded-full
                        px-3
                        py-1
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.08em]
                        ${
                          item.status ===
                          "answered"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }
                      `}
                    >
                      {item.status}
                    </span>

                  </div>

                  {/* DATE */}

                  {item.created_at && (
                    <div className="
                      mt-4
                      flex
                      items-center
                      gap-1.5
                      text-[11px]
                      text-[#9AA6AD]
                    ">
                      <Clock size={13} />

                      {new Date(
                        item.created_at
                      ).toLocaleString()}
                    </div>
                  )}

                </div>

                {/* ===========================================
                    ANSWER
                =========================================== */}

                <div className="px-6 py-5">

                  {item.status ===
                    "answered" &&
                  item.answer ? (

                    <div className="
                      rounded-xl
                      border
                      border-green-100
                      bg-green-50/50
                      p-4
                    ">

                      <p className="
                        mb-2
                        font-mono
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.15em]
                        text-green-700
                      ">
                        Admin Answer
                      </p>

                      <p className="
                        text-sm
                        leading-6
                        text-[#33434D]
                      ">
                        {item.answer}
                      </p>

                    </div>

                  ) : (

                    <div>

                      <label className="
                        mb-2
                        block
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-[#687780]
                      ">
                        Your answer
                      </label>

                      <textarea
                        value={
                          answers[item.id] ||
                          ""
                        }
                        onChange={(e) =>
                          handleAnswerChange(
                            item.id,
                            e.target.value
                          )
                        }
                        placeholder="Write your answer to the guest..."
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
                          text-[#172431]
                          outline-none
                          transition
                          focus:border-[#0097c1]
                          focus:ring-2
                          focus:ring-[#0097c1]/10
                        "
                      />

                      <div className="
                        mt-3
                        flex
                        justify-end
                      ">

                        <button
                          type="button"
                          disabled={
                            answerLoading ===
                              item.id ||
                            !answers[
                              item.id
                            ]?.trim()
                          }
                          onClick={() =>
                            submitAnswer(
                              item.id
                            )
                          }
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-[#101820]
                            px-4
                            py-2.5
                            text-xs
                            font-medium
                            text-white
                            transition
                            hover:bg-[#17232D]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >

                          <Send size={14} />

                          {answerLoading ===
                          item.id
                            ? "Sending..."
                            : "Answer Guest"}

                        </button>

                      </div>

                    </div>

                  )}

                </div>

              </div>

            ))}

          </div>
        )}

    </div>
  );
}
