import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import { useTheme } from "../../context/ThemeContext";
import { useTutor } from "../../context/TutorContext";
import { toast } from "sonner";

import TutorResponse from "./TutorResponse";

export default function Tutor() {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { darkMode } = useTheme();

  const {
    question,
    setQuestion,
    askingTutor,
    askTutor,
  } = useTutor();

  const handleAskTutor = async () => {
    if (!question.trim()) {
      return;
    }

    if (!user) {
      toast.error("Please log in first.");
      return;
    }

    if (courses.length === 0) {
      toast.warning(
        "Please upload a course first."
      );
      return;
    }

    try {
      const courseId = courses[0].id;

      await askTutor(
        question,
        courseId
      );
    } catch (error) {
      console.error(
        "Tutor failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Tutor failed."
      );
    }
  };

  return (
    <div
      className={`mt-8 rounded-2xl border p-6 transition-colors duration-300 ${
        darkMode
          ? "border-white/10 bg-white/[0.02]"
          : "border-[var(--learnai-primary-soft)] bg-[var(--learnai-surface)] shadow-sm"
      }`}
    >
      {/* HEADER */}

      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            darkMode
              ? "bg-indigo-500/10"
              : "bg-[var(--learnai-primary-soft)]"
          }`}
        >
          <span className="text-xl">
            🤖
          </span>
        </div>

        <div>
          <h2
            className={`text-2xl font-bold ${
              darkMode
                ? "text-white"
                : "text-[var(--learnai-primary)]"
            }`}
          >
            LearnAI Tutor
          </h2>

          <p
            className={`mt-1 text-sm ${
              darkMode
                ? "text-zinc-400"
                : "text-[var(--learnai-primary)]/60"
            }`}
          >
            Ask me anything about your
            course material.
          </p>
        </div>

      </div>

      {/* ASK */}

      <div className="mt-5 flex gap-3">

        <input
          type="text"
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAskTutor();
            }
          }}
          placeholder="What do you want to learn?"
          className={`flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition ${
            darkMode
              ? "border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              : "border-[var(--learnai-primary-soft)] bg-[var(--learnai-bg)] text-[var(--learnai-primary)] placeholder:text-[var(--learnai-primary)]/40 focus:border-[var(--learnai-primary)] focus:ring-2 focus:ring-[var(--learnai-primary)]/10"
          }`}
        />

        <button
          type="button"
          onClick={handleAskTutor}
          disabled={askingTutor}
          className={`rounded-xl px-6 py-3 font-medium text-white transition ${
            darkMode
              ? "bg-indigo-600 hover:bg-indigo-500"
              : "bg-[var(--learnai-accent)] hover:opacity-90"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {askingTutor
            ? "Thinking..."
            : "Ask Tutor"}
        </button>

      </div>

      <TutorResponse />
    </div>
  );
}