import { useState } from "react";
import { CheckCircle2, FileQuestion } from "lucide-react";
import { toast } from "sonner";

import { useTheme } from "../../context/ThemeContext";
import { useTutor } from "../../context/TutorContext";
import { InlineError, Skeleton } from "../ui/Skeleton";
import { useCourses } from "../../context/CourseContext";

export default function TutorResponse() {
  const { darkMode } = useTheme();
  const { courses } = useCourses();
  const {
    tutorResponse,
    evaluation,
    evaluatingAnswer,
    evaluationError,
    evaluateAnswer,
  } = useTutor();

  const [studentAnswer, setStudentAnswer] = useState("");

  if (!tutorResponse) {
    return null;
  }

  const handleEvaluateAnswer = async () => {
    if (!studentAnswer.trim()) {
      toast.warning("Please enter your answer.");
      return;
    }

    const courseId = courses[0]?.id;

    if (!courseId) {
      toast.warning("Please upload a course first.");
      return;
    }

    try {
      await evaluateAnswer(
        studentAnswer.trim(),
        courseId
      );
    } catch (error) {
      console.error("Evaluation failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not evaluate your answer."
      );
    }
  };

  return (
    <div className="mt-8">
      <div className="mb-2 text-sm font-semibold text-zinc-500">
        {tutorResponse.topic}
      </div>

      <h3 className={darkMode ? "text-xl font-bold text-white" : "text-xl font-bold text-black"}>
        {tutorResponse.concept}
      </h3>

      <div className={darkMode ? "mt-4 whitespace-pre-line leading-7 text-zinc-300" : "mt-4 whitespace-pre-line leading-7 text-zinc-700"}>
        {tutorResponse.lesson}
      </div>

      <div
        className={
          darkMode
            ? "mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            : "mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
        }
      >
        <div className="flex items-center gap-2">
          <FileQuestion size={18} className={darkMode ? "text-white" : "text-black"} />
          <h4 className={darkMode ? "font-semibold text-white" : "font-semibold text-black"}>
            Quick Check
          </h4>
        </div>

        <p className={darkMode ? "mt-4 text-sm leading-6 text-zinc-300" : "mt-4 text-sm leading-6 text-zinc-700"}>
          {tutorResponse.quiz_question}
        </p>

        <textarea
          value={studentAnswer}
          onChange={(e) => setStudentAnswer(e.target.value)}
          placeholder="Type your answer..."
          rows={3}
          disabled={evaluatingAnswer}
          className={
            darkMode
              ? "mt-5 w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              : "mt-5 w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-zinc-400 focus:border-black focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-60"
          }
        />

        <button
          type="button"
          onClick={() => void handleEvaluateAnswer()}
          disabled={evaluatingAnswer || !studentAnswer.trim()}
          className={
            darkMode
              ? "mt-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              : "mt-3 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          }
        >
          {evaluatingAnswer ? "Checking..." : "Check Answer"}
        </button>

        {evaluatingAnswer && (
          <div className="mt-5 space-y-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        )}

        {evaluationError && !evaluatingAnswer && (
          <div className="mt-5">
            <InlineError message={evaluationError} />
          </div>
        )}

        {evaluation && !evaluatingAnswer && (
          <div className={darkMode ? "mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-4" : "mt-5 rounded-xl border border-zinc-200 bg-white p-4"}>
            <div className={darkMode ? "flex items-center gap-2 font-semibold text-white" : "flex items-center gap-2 font-semibold text-black"}>
              {evaluation.correct ? <CheckCircle2 size={17} /> : <FileQuestion size={17} />}
              {evaluation.correct ? "Correct" : "Keep learning"}
            </div>
            <p className={darkMode ? "mt-2 text-sm leading-6 text-zinc-300" : "mt-2 text-sm leading-6 text-zinc-700"}>
              {evaluation.feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
