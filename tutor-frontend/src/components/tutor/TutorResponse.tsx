import { useState } from "react";
import { toast } from "sonner";

import { useTheme } from "../../context/ThemeContext";
import { useTutor } from "../../context/TutorContext";

export default function TutorResponse() {
  const { darkMode } = useTheme();

  const {
    tutorResponse,
    evaluation,
    evaluatingAnswer,
    evaluateAnswer,
  } = useTutor();

  const [studentAnswer, setStudentAnswer] =
    useState("");

  if (!tutorResponse) {
    return null;
  }

  const handleEvaluateAnswer = async () => {
    if (!studentAnswer.trim()) {
      toast.warning("Please enter your answer.");
      return;
    }

    try {
      await evaluateAnswer(studentAnswer.trim());
    } catch (error) {
      console.error(
        "Evaluation failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not evaluate your answer."
      );
    }
  };

  return (
    <div className="mt-8">

      {/* TOPIC */}

      <div
        className={
          darkMode
            ? "mb-2 text-sm font-medium text-indigo-400"
            : "mb-2 text-sm font-semibold text-[var(--learnai-accent)]"
        }
      >
        {tutorResponse.topic}
      </div>

      {/* CONCEPT */}

      <h3
        className={`text-xl font-bold ${
          darkMode
            ? "text-white"
            : "text-[var(--learnai-primary)]"
        }`}
      >
        {tutorResponse.concept}
      </h3>

      {/* LESSON */}

      <div
        className={`mt-4 whitespace-pre-line leading-7 ${
          darkMode
            ? "text-zinc-300"
            : "text-[var(--learnai-primary)]/80"
        }`}
      >
        {tutorResponse.lesson}
      </div>

      {/* QUICK CHECK */}

      <div
        className={`mt-8 rounded-2xl border p-5 ${
          darkMode
            ? "border-white/10 bg-white/[0.04]"
            : "border-[var(--learnai-primary-soft)] bg-[var(--learnai-primary-soft)]"
        }`}
      >

        <div className="flex items-center gap-2">

          <span className="text-lg">
            📝
          </span>

          <h4
            className={`font-semibold ${
              darkMode
                ? "text-white"
                : "text-[var(--learnai-primary)]"
            }`}
          >
            Quick Check
          </h4>

        </div>

        {/* QUESTION */}

        <p
          className={`mt-4 text-sm leading-6 ${
            darkMode
              ? "text-zinc-300"
              : "text-[var(--learnai-primary)]/80"
          }`}
        >
          {tutorResponse.quiz_question}
        </p>

        {/* ANSWER */}

        <textarea
          value={studentAnswer}
          onChange={(e) =>
            setStudentAnswer(e.target.value)
          }
          placeholder="Type your answer..."
          rows={3}
          disabled={evaluatingAnswer}
          className={`mt-5 w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition ${
            darkMode
              ? "border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              : "border-[var(--learnai-primary-soft)] bg-[var(--learnai-bg)] text-[var(--learnai-primary)] placeholder:text-[var(--learnai-primary)]/40 focus:border-[var(--learnai-primary)] focus:ring-2 focus:ring-[var(--learnai-primary)]/10"
          } ${
            evaluatingAnswer
              ? "cursor-not-allowed opacity-60"
              : ""
          }`}
        />

        {/* CHECK ANSWER */}

        <button
          type="button"
          onClick={handleEvaluateAnswer}
          disabled={
            evaluatingAnswer ||
            !studentAnswer.trim()
          }
          className={`mt-3 rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
            darkMode
              ? "bg-indigo-600 hover:bg-indigo-500"
              : "bg-[var(--learnai-accent)] hover:opacity-90"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {evaluatingAnswer
            ? "Checking..."
            : "Check Answer"}
        </button>

        {/* FEEDBACK */}

        {evaluation && (
          <div
            className={`mt-5 rounded-xl border p-4 ${
              evaluation.correct
                ? darkMode
                  ? "border-emerald-500/20 bg-emerald-500/10"
                  : "border-[var(--learnai-primary-soft)] bg-[var(--learnai-surface)]"
                : darkMode
                  ? "border-amber-500/20 bg-amber-500/10"
                  : "border-[var(--learnai-accent-soft)] bg-[var(--learnai-surface)]"
            }`}
          >

            <div
              className={`font-semibold ${
                evaluation.correct
                  ? darkMode
                    ? "text-emerald-400"
                    : "text-[var(--learnai-primary)]"
                  : darkMode
                    ? "text-amber-400"
                    : "text-[var(--learnai-accent)]"
              }`}
            >
              {evaluation.correct
                ? "✅ Correct!"
                : "💡 Keep learning"}
            </div>

            <p
              className={`mt-2 text-sm leading-6 ${
                darkMode
                  ? "text-zinc-300"
                  : "text-[var(--learnai-primary)]/80"
              }`}
            >
              {evaluation.feedback}
            </p>

          </div>
        )}

      </div>
    </div>
  );
}