import { CheckCircle2, FileQuestion, Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { toast } from "sonner";

import { useCourses } from "../../context/CourseContext";
import { useTheme } from "../../context/ThemeContext";
import { useTutor } from "../../context/TutorContext";
import { InlineError, Skeleton } from "../ui/Skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useParams } from "react-router-dom";

export default function TutorResponse() {
  const { darkMode } = useTheme();
  const { courses } = useCourses();
  const { courseId } = useParams();
  const {
    tutorResponse,
    evaluation,
    evaluatingAnswer,
    evaluationError,
    evaluateAnswer,
    quickCheckAnswer,
    setQuickCheckAnswer,
  } = useTutor();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 2000);
      toast.success("Code copied to clipboard.");
    } catch {
      toast.error("Could not copy code.");
    }
  };

  if (!tutorResponse) {
    return null;
  }

  const handleEvaluateAnswer = async () => {
    if (!quickCheckAnswer.trim()) {
      toast.warning("Please enter your answer.");
      return;
    }

    const selectedCourseId = courseId || courses[0]?.id;
    if (!selectedCourseId) {
      toast.warning("Please upload a course first.");
      return;
    }

    if (!courseId) {
      toast.warning("Please upload a course first.");
      return;
    }

    try {
      await evaluateAnswer(
        quickCheckAnswer.trim(),
        selectedCourseId
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
  const formattedLesson = tutorResponse.lesson
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n");
  return (
    <div className="mt-8">
      <div className="mt-8">
        <div
          className={`mb-2 text-xs font-semibold uppercase tracking-[0.16em] ${darkMode ? "text-violet-400" : "text-violet-600"
            }`}
        >
          {tutorResponse.topic}
        </div>

        <h3
          className={`text-2xl font-bold tracking-tight ${darkMode ? "text-white" : "text-black"
            }`}
        >
          {tutorResponse.concept}
        </h3>

        <div
          className={`mt-5 rounded-2xl border p-5 sm:p-6 ${darkMode
            ? "border-white/10 bg-white/[0.02] text-zinc-300"
            : "border-zinc-200 bg-white text-zinc-700"
            }`}
        >
          <div
            className={`text-sm leading-7 sm:text-base sm:leading-8
    [&>*:first-child]:mt-0
    [&>*:last-child]:mb-0
    [&_h1]:mb-3 [&_h1]:mt-7 [&_h1]:text-2xl [&_h1]:font-bold
    [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-xl [&_h2]:font-semibold
    [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold
    [&_p]:mb-4
    [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6
    [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6
    [&_li]:pl-1
    [&_strong]:font-semibold
    [&_hr]:my-6 [&_hr]:border-zinc-200
    [&_a]:underline [&_a]:underline-offset-4
    [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-violet-400 [&_blockquote]:pl-4
    [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:p-4
    [&_code]:font-mono [&_code]:text-[0.9em]
    [&_pre_code]:text-sm
    [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse
    [&_th]:border [&_th]:p-2 [&_th]:text-left
    [&_td]:border [&_td]:p-2
    ${darkMode
                ? "[&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_strong]:text-white [&_a]:text-violet-400 [&_pre]:border-white/10 [&_pre]:bg-zinc-950 [&_hr]:border-white/10 [&_th]:border-white/10 [&_td]:border-white/10"
                : "[&_h1]:text-black [&_h2]:text-black [&_h3]:text-black [&_strong]:text-black [&_a]:text-violet-600 [&_pre]:border-zinc-200 [&_pre]:bg-zinc-50 [&_th]:border-zinc-200 [&_td]:border-zinc-200"
              }`}
          >

            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              skipHtml
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const code = String(children).replace(/\n$/, "");

                  if (!match) {
                    return (
                      <code
                        className={`${className || ""} rounded bg-zinc-500/10 px-1.5 py-0.5`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  return (
                    <div className="relative my-4 overflow-hidden rounded-xl">
                      <div
                        className={`flex items-center justify-between px-4 py-2 text-xs ${darkMode
                          ? "bg-zinc-900 text-zinc-300"
                          : "bg-zinc-200 text-zinc-700"
                          }`}
                      >
                        <span>{match[1]}</span>
                        <button
                          type="button"
                          onClick={() => void handleCopyCode(code)}
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition hover:bg-zinc-500/20"
                          aria-label="Copy code"
                        >
                          {copiedCode === code ? (
                            <>
                              <Check size={14} />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              Copy code
                            </>
                          )}
                        </button>
                      </div>

                      <SyntaxHighlighter
                        language={match[1]}
                        style={darkMode ? oneDark : oneLight}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: 0,
                          padding: "1rem",
                          fontSize: "0.875rem",
                          overflowX: "auto",
                        }}
                      >
                        {code}
                      </SyntaxHighlighter>
                    </div>
                  );
                },
              }}
            >
              {formattedLesson}
            </ReactMarkdown>

          </div>
        </div>
      </div>

      <div
        className={
          darkMode
            ? "mt-8 rounded-2xl border border-white/10 bg-white/4 p-5"
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
          value={quickCheckAnswer}
          onChange={(e) => setQuickCheckAnswer(e.target.value)}
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
          disabled={evaluatingAnswer || !quickCheckAnswer.trim()}
          className={
            darkMode
              ? "mt-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              : "mt-3 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          }
        >
          {evaluatingAnswer ? "Checking..." : "Check Answer"}
        </button>

        {evaluatingAnswer && (
          <div className="mt-5 space-y-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/2">
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
          <div className={darkMode ? "mt-5 rounded-xl border border-white/10 bg-white/4 p-4" : "mt-5 rounded-xl border border-zinc-200 bg-white p-4"}>
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
