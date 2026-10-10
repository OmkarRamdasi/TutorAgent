import { useState } from "react";
import { MessageCircle, Brain } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import { useTheme } from "../../context/ThemeContext";
import { useTutor } from "../../context/TutorContext";
import { InlineError } from "../ui/Skeleton";
import { useParams } from "react-router-dom";
import TutorResponse from "./TutorResponse";
import Practice from "./Practice";

export default function Tutor() {
  const [mode, setMode] = useState<"ask" | "practice">("ask");
  const { user } = useAuth();
  const { courses } = useCourses();
  const { darkMode } = useTheme();
  const { courseId } = useParams();

  const {
    question,
    setQuestion,
    askingTutor,
    askTutor,
    tutorError,
  } = useTutor();

  const handleAskTutor = async () => {
    if (!question.trim()) {
      return;
    }

    if (!user) {
      toast.error("Please log in first.");
      return;
    }

    const selectedCourseId =
      courseId || courses[0]?.id;

    if (!selectedCourseId) {
      toast.warning("Please upload a course first.");
      return;
    }

    try {
      await askTutor(
        question.trim(),
        selectedCourseId
      );
    } catch (error) {
      console.error("Tutor failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Tutor failed."
      );
    }
  };

  return (
    <div
      className={`mt-8 rounded-2xl border p-6 transition-colors duration-300 ${darkMode
        ? "border-white/10 bg-white/[0.02]"
        : "border-(--learnai-primary-soft) bg-(--learnai-surface) shadow-sm"
        }`}
    >
      <div
        className={`mb-5 flex rounded-xl border p-1 ${darkMode
          ? "border-white/10 bg-zinc-900"
          : "border-(--learnai-primary-soft) bg-zinc-50"
          }`}
      >
        <button
          type="button"
          onClick={() => setMode("ask")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${mode === "ask"
            ? darkMode
              ? "bg-white text-black"
              : "bg-black text-white"
            : darkMode
              ? "text-zinc-400 hover:text-white"
              : "text-zinc-600 hover:text-black"
            }`}
        >
          <MessageCircle size={16} />
          Ask
        </button>

        <button
          type="button"
          onClick={() => setMode("practice")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${mode === "practice"
            ? darkMode
              ? "bg-white text-black"
              : "bg-black text-white"
            : darkMode
              ? "text-zinc-400 hover:text-white"
              : "text-zinc-600 hover:text-black"
            }`}
        >
          <Brain size={16} />
          Practice
        </button>
      </div>
      {mode === "ask" ? (
        <>
          {/* ASK INPUT */}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={question}
              disabled={askingTutor}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !askingTutor
                ) {
                  void handleAskTutor();
                }
              }}
              placeholder="What do you want to learn?"
              className={
                darkMode
                  ? "flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  : "flex-1 rounded-xl border border-(--learnai-primary-soft) bg-(--learnai-bg) px-4 py-3 text-sm text-black outline-none placeholder:text-zinc-400 focus:border-black focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-60"
              }
            />

            {/* ASK BUTTON */}

            <button
              type="button"
              onClick={() => void handleAskTutor()}
              disabled={askingTutor || !question.trim()}
              className={
                darkMode
                  ? "flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  : "flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              }
            >
              {askingTutor ? (
                <>
                  <span
                    className={
                      darkMode
                        ? "h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
                        : "h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    }
                  />

                  Thinking...
                </>
              ) : (
                "Ask Tutor"
              )}
            </button>
          </div>

          {/* ERROR */}

          {tutorError && (
            <div className="mt-5">
              <InlineError message={tutorError} />
            </div>
          )}

          {/* TUTOR RESPONSE */}

          <TutorResponse />
        </>
      ) : (
        <Practice embedded={true} />
      )}
    </div>
  );
}
