import React, { useState } from "react";
import { Send, X, Bot } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Default mode
  const [mode, setMode] = useState("rag_llm");

  const sendMessage = async () => {
    if (!question.trim() || loading) return;

    const userQuestion = question.trim();

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      // Get JWT token
      const token = sessionStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: userQuestion,
          mode: mode,
        }),
      });

      const data = await response.json();

      let answer = "Sorry, I couldn't process that question.";

      /*
       * =====================================================
       * RAG + LLM
       * =====================================================
       */

      if (mode === "rag_llm") {
        if (data?.response?.answer) {
          answer = data.response.answer;
        }
      }

      /*
       * =====================================================
       * RAG ONLY
       * =====================================================
       */

        if (mode === "rag") {
          // =====================================================
          // DATABASE TOOL RESPONSE
          // =====================================================

          if (data?.response?.type === "database_tool") {
            const toolData = data.response.data || {};

            const formatLabel = (key) => {
              return key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase());
            };

            const formattedData = Object.entries(toolData)
              .map(([key, value]) => {
                const label = formatLabel(key);

                if (
                  value === null ||
                  value === undefined ||
                  value === ""
                ) {
                  return `${label}: Not available`;
                }

                return `${label}:\n${value}`;
              })
              .join("\n\n");

            answer =
              formattedData ||
              "No relevant information was found.";
          }

          // =====================================================
          // VECTOR SEARCH RESPONSE
          // =====================================================

          else if (data?.response?.type === "rag") {
            const results = data.response.results || [];

            if (results.length === 0) {
              answer = "No relevant products found.";
            } else {
              answer = results
                .map(
                  (item, index) =>
                    `Result ${index + 1}\n` +
                    `Product ID: ${item.product_id}\n` +
                    `Similarity Distance: ${item.distance}\n\n` +
                    `${item.content}`
                )
                .join(
                  "\n\n--------------------\n\n"
                );
            }
          }

          // =====================================================
          // OTHER RESPONSE
          // =====================================================

          else if (data?.response?.answer) {
            answer = data.response.answer;
          }
        }

      /*
       * =====================================================
       * BACKEND ERROR
       * =====================================================
       */

      if (
        data?.response?.type === "llm_error" ||
        data?.response?.type === "error" ||
        data?.response?.type === "unauthorized" ||
        data?.response?.type === "clarification"
      ) {
        if (data?.response?.answer) {
          answer = data.response.answer;
        }
      }

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (error) {
      console.error("AI chatbot error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Unable to connect to the AI assistant.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* =====================================================
          FLOATING CHAT BUTTON
      ===================================================== */}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#0097c1] text-white shadow-lg transition hover:scale-105"
        >
          <Bot size={26} />
        </button>
      )}

      {/* =====================================================
          CHAT WINDOW
      ===================================================== */}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[650px] w-[420px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="bg-[#0097c1] px-5 py-4 text-white">

            <div className="flex items-center justify-between">

              {/* Logo + Title */}

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <Bot size={20} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Calinova AI
                  </h3>

                  <p className="text-xs text-white/80">
                    AI Assistant
                  </p>
                </div>

              </div>

              {/* Close */}

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-white/20"
              >
                <X size={20} />
              </button>

            </div>

            {/* =================================================
                MODE SWITCH
            ================================================= */}

            <div className="mt-4 flex rounded-lg bg-white/20 p-1">

              {/* RAG ONLY */}

              <button
                onClick={() => setMode("rag")}
                className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition ${
                  mode === "rag"
                    ? "bg-white text-[#0097c1]"
                    : "text-white hover:bg-white/10"
                }`}
              >
                RAG Only
              </button>

              {/* RAG + LLM */}

              <button
                onClick={() => setMode("rag_llm")}
                className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition ${
                  mode === "rag_llm"
                    ? "bg-white text-[#0097c1]"
                    : "text-white hover:bg-white/10"
                }`}
              >
                RAG + LLM
              </button>

            </div>

            {/* Current mode */}

            <p className="mt-2 text-center text-[11px] text-white/80">
              {mode === "rag"
                ? "Retrieval only"
                : "Retrieval + AI generation"}
            </p>

          </div>

          {/* =====================================================
              MESSAGES
          ===================================================== */}

          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">

            {/* Empty state */}

            {messages.length === 0 && (
              <div className="mt-16 text-center text-gray-500">

                <Bot
                  size={40}
                  className="mx-auto mb-3 text-[#0097c1]"
                />

                <p className="font-medium">
                  Welcome to Calinova AI
                </p>

                <p className="mt-1 text-sm">
                  Ask me about your Calinova data.
                </p>

                <p className="mt-3 text-xs text-gray-400">
                  Current mode:

                  <span className="font-medium text-[#0097c1]">
                    {mode === "rag"
                      ? " RAG Only"
                      : " RAG + LLM"}
                  </span>
                </p>

              </div>
            )}

            {/* Messages */}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    message.role === "user"
                      ? "rounded-br-sm bg-[#0097c1] text-white"
                      : "rounded-bl-sm bg-white text-gray-800 shadow-sm"
                  }`}
                >

                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>

                </div>

              </div>
            ))}

            {/* Loading */}

            {loading && (
              <div className="flex justify-start">

                <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">

                  {mode === "rag"
                    ? "Searching..."
                    : "Thinking..."}

                </div>

              </div>
            )}

          </div>

          {/* =====================================================
              INPUT
          ===================================================== */}

          <div className="border-t bg-white p-3">

            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">

              <input
                type="text"
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder={
                  mode === "rag"
                    ? "Ask using RAG..."
                    : "Ask Calinova AI..."
                }
                disabled={loading}
                className="flex-1 bg-transparent text-sm outline-none"
              />

              <button
                onClick={sendMessage}
                disabled={
                  !question.trim() || loading
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0097c1] text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={17} />
              </button>

            </div>

            {/* Mode description */}

            <p className="mt-2 text-center text-[10px] text-gray-400">
              {mode === "rag"
                ? "RAG retrieves relevant Calinova information."
                : "RAG retrieves information and the LLM generates the answer."}
            </p>

          </div>

        </div>
      )}
    </>
  );
};

export default AIChatbot;