
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  ChevronDown,
  GraduationCap,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useCourses } from "../../context/CourseContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { LibraryDetailSkeleton, InlineError } from "../ui/Skeleton";
import { useProgress } from "../../context/ProgressContext";
import Tutor from "../tutor/Tutor";

export default function LibraryDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();

  const {
    courses,
    loadingCourses,
    courseError,
    getCourseSummary,
    summaryLoading,
    summaryError,
  } = useCourses();

  const {
    progress,
    progressLoading,
    progressError,
    fetchProgress,
  } = useProgress();

  const [summary, setSummary] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    if (!courseId || !user) return;

    let cancelled = false;

    const loadSummary = async () => {
      try {
        const result = await getCourseSummary(user, courseId);

        if (!cancelled) {
          setSummary(result);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load course summary:", error);
        }
      }
    };

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, [courseId, user, getCourseSummary]);

  useEffect(() => {
    if (!user || !courseId) return;
    void fetchProgress(user, courseId);
  }, [user, courseId, fetchProgress]);

  const course = courses.find((item) => item.id === courseId);

  const pageClass = darkMode
    ? "flex h-full min-h-0 flex-col overflow-hidden bg-zinc-950 text-white transition-colors duration-300"
    : "flex h-full min-h-0 flex-col overflow-hidden bg-(--learnai-bg) text-(--learnai-primary) transition-colors duration-300";

  const cardClass = darkMode
    ? "border-white/10 bg-white/[0.02]"
    : "border-(--learnai-primary-soft) bg-(--learnai-surface)";

  const mutedText = darkMode
    ? "text-zinc-400"
    : "text-zinc-500";

  if (loadingCourses) {
    return (
      <div className={pageClass}>
        <LibraryDetailSkeleton />
      </div>
    );
  }

  if (courseError) {
    return (
      <div className={pageClass}>
        <main className="mx-auto max-w-4xl px-6 py-10">
          <InlineError
            title="Library couldn't be loaded"
            message={courseError}
          />
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={pageClass}>
        <main className="mx-auto max-w-4xl px-6 py-10">
          <button
            type="button"
            onClick={() => navigate("/app")}
            className={`flex items-center gap-2 text-sm transition ${darkMode
              ? "text-zinc-400 hover:text-white"
              : "text-zinc-500 hover:text-black"
              }`}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="mt-10">
            <h1 className="text-xl font-semibold">
              Library not found
            </h1>
            <p className={`mt-2 text-sm ${mutedText}`}>
              This library may no longer exist or is unavailable.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const averageMastery =
    progress.length > 0
      ? Math.round(
        progress.reduce((total, item) => total + item.mastery, 0) /
        progress.length
      )
      : 0;

  const totalAttempts = progress.reduce(
    (total, item) => total + item.attempts,
    0
  );

  return (
    <div className={pageClass}>
      <main className="mx-auto flex min-h-0 w-full max-w-[1800px] flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-5">
        {/* WORKSPACE HEADER */}

        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${cardClass}`}
            >
              <BookOpen size={21} strokeWidth={1.7} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                {course.title}
              </h1>
              <p className={`mt-1 text-sm ${mutedText}`}>
                {course.documents?.length || 0} document
                {course.documents?.length === 1 ? "" : "s"} in this library
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/app")}
            className={`hidden shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition sm:flex ${darkMode
              ? "border-white/10 text-zinc-300 hover:bg-white/5"
              : "border-(--learnai-primary-soft) text-zinc-600 hover:bg-black/5"
              }`}
          >
            <ArrowLeft size={15} />
            Libraries
          </button>
        </header>

        {/* SPLIT WORKSPACE */}


        <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 items-stretch gap-5 overflow-hidden xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-6">

          {/* LEFT: COURSE MATERIAL */}


          <div
            className={`min-h-0 min-w-0 space-y-5 overflow-y-auto overscroll-contain pr-2 ${darkMode ? "scrollbar-dark" : "scrollbar-light"
              }`}
          >
            <section className={`rounded-2xl border p-5 ${cardClass}`}>
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${darkMode
                    ? "bg-white/10"
                    : "bg-(--learnai-primary-soft)"
                    }`}
                >
                  <FileText size={19} strokeWidth={1.7} />
                </div>

                <div className="min-w-0">
                  <h2 className="font-semibold">Course material</h2>
                  <p className={`mt-1 text-sm leading-6 ${mutedText}`}>
                    Review your summary and use the Tutor alongside your study material.
                  </p>
                </div>
              </div>
            </section>

            {/* AI SUMMARY */}

            <section className={`overflow-hidden rounded-2xl border ${cardClass}`}>
              <button
                type="button"
                aria-expanded={summaryOpen}
                onClick={() => setSummaryOpen((previous) => !previous)}
                className="flex w-full items-center gap-3 p-4 text-left sm:p-5"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${darkMode
                    ? "bg-white/10"
                    : "bg-[#F5F5F5]"
                    }`}
                >
                  <Sparkles size={18} strokeWidth={1.7} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold">AI Summary</h2>
                  <p className={`mt-1 text-xs ${mutedText}`}>
                    Key ideas from your study material
                  </p>
                </div>

                <ChevronDown
                  size={18}
                  className={`shrink-0 transition-transform ${summaryOpen ? "rotate-180" : ""
                    } ${mutedText}`}
                />
              </button>

              {summaryOpen && (
                <div
                  className={`border-t ${darkMode
                    ? "border-white/10"
                    : "border-(--learnai-primary-soft)"
                    }`}
                >
                  <div className={`max-h-[65vh] min-h-48 overflow-y-auto p-4 sm:p-5 ${darkMode ? "scrollbar-dark" : "scrollbar-light"}`}>
                    {summaryLoading && (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((item) => (
                          <div
                            key={item}
                            className={`h-4 animate-pulse rounded ${darkMode ? "bg-zinc-800" : "bg-zinc-200"
                              }`}
                            style={{ width: `${100 - item * 8}%` }}
                          />
                        ))}
                      </div>
                    )}

                    {!summaryLoading && summaryError && (
                      <InlineError message={summaryError} />
                    )}

                    {!summaryLoading && !summaryError && summary && (
                      <div
                        className={`text-sm leading-7 ${darkMode ? "text-zinc-300" : "text-zinc-700"
                          }`}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <h1
                                className={`mb-4 text-xl font-semibold ${darkMode ? "text-white" : "text-black"
                                  }`}
                              >
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2
                                className={`mb-3 mt-6 text-lg font-semibold ${darkMode ? "text-white" : "text-black"
                                  }`}
                              >
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3
                                className={`mb-2 mt-5 text-base font-semibold ${darkMode ? "text-zinc-100" : "text-zinc-900"
                                  }`}
                              >
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-4 last:mb-0">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="mb-4 list-disc space-y-2 pl-5">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="mb-4 list-decimal space-y-2 pl-5">
                                {children}
                              </ol>
                            ),
                            strong: ({ children }) => (
                              <strong
                                className={`font-semibold ${darkMode ? "text-white" : "text-black"
                                  }`}
                              >
                                {children}
                              </strong>
                            ),
                          }}
                        >
                          {summary}
                        </ReactMarkdown>
                      </div>
                    )}

                    {!summaryLoading && !summaryError && !summary && (
                      <p className={`text-sm leading-6 ${mutedText}`}>
                        No summary is available for this course yet.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* LEARNING JOURNEY SUMMARY */}

            <section className={`rounded-2xl border p-5 ${cardClass}`}>
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${darkMode ? "bg-white/10" : "bg-[#F5F5F5]"
                    }`}
                >
                  <GraduationCap size={19} strokeWidth={1.7} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">Learning Journey</h2>
                  <p className={`mt-1 text-sm leading-6 ${mutedText}`}>
                    Track mastery and review your progress across concepts.
                  </p>
                </div>
              </div>

              {progressLoading ? (
                <p className={`mt-5 text-sm ${mutedText}`}>
                  Loading progress...
                </p>
              ) : progressError ? (
                <div className="mt-4">
                  <InlineError message={progressError} />
                </div>
              ) : progress.length === 0 ? (
                <p className={`mt-4 text-sm ${mutedText}`}>
                  Your learning journey hasn't started yet. Practice a concept to begin tracking progress.
                </p>
              ) : (
                <>
                  <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                    <div className={`rounded-xl p-3 ${darkMode ? "bg-white/5" : "bg-black/[0.03]"
                      }`}>
                      <p className={`text-xs ${mutedText}`}>Mastery</p>
                      <p className="mt-2 text-xl font-semibold">
                        {averageMastery}%
                      </p>
                    </div>

                    <div className={`rounded-xl p-3 ${darkMode ? "bg-white/5" : "bg-black/[0.03]"
                      }`}>
                      <p className={`text-xs ${mutedText}`}>Concepts</p>
                      <p className="mt-2 text-xl font-semibold">
                        {progress.length}
                      </p>
                    </div>

                    <div className={`rounded-xl p-3 ${darkMode ? "bg-white/5" : "bg-black/[0.03]"
                      }`}>
                      <p className={`text-xs ${mutedText}`}>Attempts</p>
                      <p className="mt-2 text-xl font-semibold">
                        {totalAttempts}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {progress.slice(0, 4).map((item) => {
                      const mastery = Math.min(
                        100,
                        Math.max(0, item.mastery)
                      );

                      return (
                        <div
                          key={`${item.topic}-${item.concept}`}
                          className={`border-t pt-4 ${darkMode
                            ? "border-white/10"
                            : "border-(--learnai-primary-soft)"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className={`text-xs ${mutedText}`}>
                                {item.topic}
                              </p>
                              <p className="mt-1 text-sm font-medium">
                                {item.concept}
                              </p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold">
                              {mastery}%
                            </span>
                          </div>

                          <div
                            className={`mt-3 h-1.5 overflow-hidden rounded-full ${darkMode ? "bg-zinc-800" : "bg-zinc-200"
                              }`}
                          >
                            <div
                              className={`h-full rounded-full ${darkMode ? "bg-white" : "bg-black"
                                }`}
                              style={{ width: `${mastery}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => navigate(`/app/progress/${courseId}`)}
                className={`mt-5 flex items-center gap-2 text-sm font-medium transition ${darkMode
                  ? "text-zinc-300 hover:text-white"
                  : "text-zinc-700 hover:text-black"
                  }`}
              >
                View Learning Journey
                <ArrowRight size={15} />
              </button>
            </section>
          </div>

          {/* RIGHT: AI TUTOR WITH ASK / PRACTICE */}

          <section className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border ${cardClass} xl:h-full`}>
            <div
              className={`border-b p-4 sm:p-5 ${darkMode
                ? "border-white/10"
                : "border-(--learnai-primary-soft)"
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${darkMode ? "bg-white/10" : "bg-[#F5F5F5]"
                    }`}
                >
                  <Sparkles size={19} strokeWidth={1.7} />
                </div>

                <div className="min-w-0">
                  <h2 className="font-semibold">
                    AI Learning Assistant
                  </h2>
                  <p className={`mt-1 text-xs ${mutedText}`}>
                    Ask questions or practise concepts
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain ${darkMode ? "scrollbar-dark" : "scrollbar-light"
                }`}
            >
              <div className="p-3 sm:p-4">
                <Tutor />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
