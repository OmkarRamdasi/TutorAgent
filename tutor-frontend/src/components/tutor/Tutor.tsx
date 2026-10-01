import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import { useTheme } from "../../context/ThemeContext";
import { useTutor } from "../../context/TutorContext";
import { TutorSkeleton, InlineError } from "../ui/Skeleton";
import { useParams } from "react-router-dom";
import TutorResponse from "./TutorResponse";

export default function Tutor() {
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

    const selectedCourseId = courseId || courses[0]?.id;

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
      toast.error(error instanceof Error ? error.message : "Tutor failed.");
    }
  };

  if (askingTutor) {
    return <TutorSkeleton />;
  }

  return (
    <div
      className={`mt-8 rounded-2xl border p-6 transition-colors duration-300 ${darkMode
        ? "border-white/10 bg-white/[0.02]"
        : "border-(--learnai-primary-soft) bg-(--learnai-surface) shadow-sm"
        }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={
            darkMode
              ? "flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white"
              : "flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-black"
          }
        >
          <MessageCircle size={19} strokeWidth={1.7} />
        </div>

        <div>
          <h2 className={darkMode ? "text-2xl font-bold text-white" : "text-2xl font-bold text-black"}>
            LearnAI Tutor
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Ask me anything about your course material.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void handleAskTutor();
            }
          }}
          placeholder="What do you want to learn?"
          className={
            darkMode
              ? "flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white focus:ring-2 focus:ring-white/10"
              : "flex-1 rounded-xl border border-(--learnai-primary-soft) bg-(--learnai-bg) px-4 py-3 text-sm text-black outline-none placeholder:text-zinc-400 focus:border-black focus:ring-2 focus:ring-black/10"
          }
        />

        <button
          type="button"
          onClick={() => void handleAskTutor()}
          disabled={askingTutor}
          className={
            darkMode
              ? "rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              : "rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          }
        >
          Ask Tutor
        </button>
      </div>

      {tutorError && (
        <div className="mt-5">
          <InlineError message={tutorError} />
        </div>
      )}

      <TutorResponse />
    </div>
  );
}
