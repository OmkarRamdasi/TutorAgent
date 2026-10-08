import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  GraduationCap,
  MessageCircle,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useCourses } from "../../context/CourseContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { LibraryDetailSkeleton, InlineError } from "../ui/Skeleton";
import { useProgress } from "../../context/ProgressContext";
export default function LibraryDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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
  const { darkMode } = useTheme();
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(true);

  useEffect(() => {
    if (!courseId || !user) {
      return;
    }

    const loadSummary = async () => {
      try {
        const result = await getCourseSummary(
          user,
          courseId
        );

        setSummary(result);
      } catch (error) {
        console.error("Failed to load course summary:", error);
      }
    };

    void loadSummary();
  }, [courseId, user, getCourseSummary]);

  const course = courses.find(
    (item) => item.id === courseId
  );

  useEffect(() => {
    if (!user || !courseId) {
      return;
    }

    void fetchProgress(user, courseId);
  }, [user, courseId, fetchProgress]);


  console.log("COURSE PROGRESS:", progress);
  if (loadingCourses) {
    return (
      <div className={darkMode ? "min-h-screen bg-zinc-950 text-white" : "min-h-screen bg-(--learnai-bg) text-black"}>
        <LibraryDetailSkeleton />
      </div>
    );
  }

  if (courseError) {
    return (
      <div className={darkMode ? "min-h-screen bg-zinc-950 px-6 py-12 text-white" : "min-h-screen bg-(--learnai-bg) px-6 py-12 text-black"}>
        <div className="mx-auto max-w-4xl">
          <InlineError
            title="Library couldn't be loaded"
            message={courseError}
          />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div
        className={
          darkMode
            ? "min-h-screen bg-zinc-950 text-white"
            : "min-h-screen bg-(--learnai-bg) text-black"
        }
      >
        <main className="mx-auto max-w-5xl px-6 py-12">
          <button
            type="button"
            onClick={() => navigate("/app")}
            className={
              darkMode
                ? "flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                : "flex items-center gap-2 text-sm text-zinc-500 transition hover:text-black"
            }
          >
            <ArrowLeft size={16} />
            Back to Libraries
          </button>

          <div className="mt-12">
            <h1 className="text-xl font-semibold">
              Library not found
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              This library may no longer exist or is unavailable.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-zinc-950 text-white"
          : "min-h-screen bg-(--learnai-bg) text-black"
      }
    >
      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* BACK */}

        <button
          type="button"
          onClick={() => navigate("/app")}
          className={
            darkMode
              ? "mb-8 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
              : "mb-8 flex items-center gap-2 text-sm text-zinc-500 transition hover:text-black"
          }
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Your Libraries
        </button>

        {/* LIBRARY HEADER */}

        <div className="mb-10">
          <div className="flex items-start gap-4">
            <div
              className={
                darkMode
                  ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white"
                  : "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--learnai-primary-soft) text-black"
              }
            >
              <BookOpen size={22} strokeWidth={1.7} />
            </div>

            <div className="min-w-0">
              <h1
                className={
                  darkMode
                    ? "text-2xl font-semibold tracking-tight text-white sm:text-3xl"
                    : "text-2xl font-semibold tracking-tight text-black sm:text-3xl"
                }
              >
                {course.title}
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                {course.documents?.length || 0} document
                {course.documents?.length === 1 ? "" : "s"} in
                this library
              </p>
            </div>
          </div>
        </div>

        {/* AI SUMMARY */}

        <section
          className={
            darkMode
              ? "mt-5 rounded-2xl border border-white/10 bg-white/[0.02]"
              : "mt-5 rounded-2xl border border-(--learnai-primary-soft) bg-white"
          }
        >
          {/* SUMMARY HEADER */}

          <button
            type="button"
            onClick={() => setSummaryOpen((prev) => !prev)}
            className="flex w-full items-center gap-4 p-6 text-left"
          >
            <div
              className={
                darkMode
                  ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white"
                  : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5] text-black"
              }
            >
              <Sparkles size={18} strokeWidth={1.7} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                02
              </p>

              <h2
                className={
                  darkMode
                    ? "mt-1 text-base font-semibold text-white"
                    : "mt-1 text-base font-semibold text-black"
                }
              >
                AI Summary
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Get a clear overview of your study material.
              </p>
            </div>

            <ChevronDown
              size={18}
              strokeWidth={1.7}
              className={
                darkMode
                  ? `shrink-0 text-zinc-400 transition-transform duration-200 ${summaryOpen ? "rotate-180" : ""
                  }`
                  : `shrink-0 text-zinc-500 transition-transform duration-200 ${summaryOpen ? "rotate-180" : ""
                  }`
              }
            />
          </button>

          {/* SUMMARY CONTENT */}

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${summaryOpen ? "max-h-[660px] opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <div className="border-t border-(--learnai-primary-soft) dark:border-white/10">
              <div
                className={
                  darkMode
                    ? "scrollbar-dark h-[600px] overflow-y-auto px-6 py-6"
                    : "scrollbar-light h-[600px] overflow-y-auto px-6 py-6"
                }
              >
                {summaryLoading && (
                  <div className="space-y-4">
                    <div className="h-5 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-4 w-4/6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                )}

                {summaryError && (
                  <p className="text-sm text-zinc-500">
                    {summaryError}
                  </p>
                )}

                {!summaryLoading && !summaryError && summary && (
                  <div
                    className={
                      darkMode
                        ? "text-[15px] leading-7 text-zinc-300"
                        : "text-[15px] leading-7 text-zinc-700"
                    }
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1
                            className={
                              darkMode
                                ? "mb-5 text-2xl font-semibold text-white"
                                : "mb-5 text-2xl font-semibold text-black"
                            }
                          >
                            {children}
                          </h1>
                        ),

                        h2: ({ children }) => (
                          <h2
                            className={
                              darkMode
                                ? "mb-4 mt-8 text-xl font-semibold text-white"
                                : "mb-4 mt-8 text-xl font-semibold text-black"
                            }
                          >
                            {children}
                          </h2>
                        ),

                        h3: ({ children }) => (
                          <h3
                            className={
                              darkMode
                                ? "mb-3 mt-6 text-lg font-semibold text-zinc-100"
                                : "mb-3 mt-6 text-lg font-semibold text-zinc-900"
                            }
                          >
                            {children}
                          </h3>
                        ),

                        p: ({ children }) => (
                          <p className="mb-4">
                            {children}
                          </p>
                        ),

                        ul: ({ children }) => (
                          <ul className="mb-5 list-disc space-y-2 pl-6">
                            {children}
                          </ul>
                        ),

                        ol: ({ children }) => (
                          <ol className="mb-5 list-decimal space-y-2 pl-6">
                            {children}
                          </ol>
                        ),

                        strong: ({ children }) => (
                          <strong
                            className={
                              darkMode
                                ? "font-semibold text-white"
                                : "font-semibold text-black"
                            }
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
              </div>
            </div>
          </div>
        </section>


        {/* AI TUTOR */}

        <section
          className={
            darkMode
              ? "mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              : "mt-5 rounded-2xl border border-(--learnai-primary-soft) bg-white p-6"
          }
        >
          <div className="flex items-start gap-4">
            <div
              className={
                darkMode
                  ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white"
                  : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5] text-black"
              }
            >
              <MessageCircle size={18} strokeWidth={1.7} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                03
              </p>

              <h2
                className={
                  darkMode
                    ? "mt-1 text-base font-semibold text-white"
                    : "mt-1 text-base font-semibold text-black"
                }
              >
                AI Tutor
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Ask questions and learn directly from the
                material in this library.
              </p>

              <button
                type="button"
                onClick={() => navigate(`/app/tutor/${courseId}`)}
                className={
                  darkMode
                    ? "mt-5 flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/5"
                    : "mt-5 flex items-center gap-2 rounded-lg border border-(--learnai-primary-soft) px-4 py-2.5 text-sm font-medium text-black transition hover:bg-(--learnai-primary-soft)"
                }
              >
                Ask Tutor
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
        {/* LEARNING JOURNEY */}

        <section
          className={
            darkMode
              ? "mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              : "mt-5 rounded-2xl border border-(--learnai-primary-soft) bg-white p-6"
          }
        >
          <div className="flex items-start gap-4">
            {/* ICON */}

            <div
              className={
                darkMode
                  ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white"
                  : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5] text-black"
              }
            >
              <GraduationCap
                size={19}
                strokeWidth={1.7}
              />
            </div>

            <div className="min-w-0 flex-1">

              {/* SECTION NUMBER */}

              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                04
              </p>

              {/* TITLE */}

              <h2
                className={
                  darkMode
                    ? "mt-1 text-base font-semibold text-white"
                    : "mt-1 text-base font-semibold text-black"
                }
              >
                Learning Journey
              </h2>

              {/* DESCRIPTION */}

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Learn step by step, practice what you understand,
                and track your progress as you go.
              </p>

              {/* PROGRESS CONTENT */}

              {progressLoading ? (
                <div
                  className={
                    darkMode
                      ? "mt-5 rounded-xl bg-white/5 p-5"
                      : "mt-5 rounded-xl bg-[#F5F5F5] p-5"
                  }
                >
                  <div className="space-y-4">
                    <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

                    <div className="h-8 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

                    <div className="h-2 w-full animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              ) : progressError ? (
                <div
                  className={
                    darkMode
                      ? "mt-5 rounded-xl bg-white/5 p-4"
                      : "mt-5 rounded-xl bg-[#F5F5F5] p-4"
                  }
                >
                  <p
                    className={
                      darkMode
                        ? "text-sm text-zinc-400"
                        : "text-sm text-zinc-600"
                    }
                  >
                    {progressError}
                  </p>
                </div>
              ) : progress.length === 0 ? (
                <div
                  className={
                    darkMode
                      ? "mt-5 rounded-xl bg-white/5 p-4"
                      : "mt-5 rounded-xl bg-[#F5F5F5] p-4"
                  }
                >
                  <p
                    className={
                      darkMode
                        ? "text-sm font-medium text-zinc-300"
                        : "text-sm font-medium text-zinc-700"
                    }
                  >
                    Your learning journey hasn't started yet.
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Start practicing with the AI Tutor to build your progress.
                  </p>
                </div>
              ) : (
                <>
                  {/* OVERALL PROGRESS */}

                  <div
                    className={
                      darkMode
                        ? "mt-5 rounded-xl bg-white/5 p-5"
                        : "mt-5 rounded-xl bg-[#F5F5F5] p-5"
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Overall Progress
                        </p>

                        <p
                          className={
                            darkMode
                              ? "mt-2 text-3xl font-semibold text-white"
                              : "mt-2 text-3xl font-semibold text-black"
                          }
                        >
                          {Math.round(
                            progress.reduce(
                              (total, item) =>
                                total + item.mastery,
                              0
                            ) / progress.length
                          )}
                          %
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          Average mastery
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={
                            darkMode
                              ? "text-lg font-semibold text-white"
                              : "text-lg font-semibold text-black"
                          }
                        >
                          {progress.length}
                        </p>

                        <p className="text-xs text-zinc-500">
                          {progress.length === 1
                            ? "Concept"
                            : "Concepts"}
                        </p>

                        <p
                          className={
                            darkMode
                              ? "mt-3 text-lg font-semibold text-white"
                              : "mt-3 text-lg font-semibold text-black"
                          }
                        >
                          {progress.reduce(
                            (total, item) =>
                              total + item.attempts,
                            0
                          )}
                        </p>

                        <p className="text-xs text-zinc-500">
                          Attempts
                        </p>
                      </div>
                    </div>

                    {/* OVERALL PROGRESS BAR */}

                    <div className="mt-5">
                      <div
                        className={
                          darkMode
                            ? "h-2 overflow-hidden rounded-full bg-zinc-800"
                            : "h-2 overflow-hidden rounded-full bg-zinc-200"
                        }
                      >
                        <div
                          className={
                            darkMode
                              ? "h-full rounded-full bg-white transition-all duration-500"
                              : "h-full rounded-full bg-black transition-all duration-500"
                          }
                          style={{
                            width: `${Math.round(
                              progress.reduce(
                                (total, item) =>
                                  total + item.mastery,
                                0
                              ) / progress.length
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* CONCEPT PROGRESS */}

                  <div className="mt-6">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Concepts
                    </p>

                    <div className="mt-3 space-y-3">
                      {progress.map((item) => (
                        <div
                          key={`${item.topic}-${item.concept}`}
                          className={
                            darkMode
                              ? "rounded-xl border border-white/10 p-4"
                              : "rounded-xl border border-(--learnai-primary-soft) p-4"
                          }
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p
                                className={
                                  darkMode
                                    ? "text-xs text-zinc-500"
                                    : "text-xs text-zinc-500"
                                }
                              >
                                {item.topic}
                              </p>

                              <p
                                className={
                                  darkMode
                                    ? "mt-1 text-sm font-medium text-white"
                                    : "mt-1 text-sm font-medium text-black"
                                }
                              >
                                {item.concept}
                              </p>
                            </div>

                            <div className="shrink-0 text-right">
                              <p
                                className={
                                  darkMode
                                    ? "text-sm font-semibold text-white"
                                    : "text-sm font-semibold text-black"
                                }
                              >
                                {item.mastery}%
                              </p>

                              <p className="mt-1 text-xs capitalize text-zinc-500">
                                {item.status}
                              </p>
                            </div>
                          </div>

                          {/* CONCEPT PROGRESS BAR */}

                          <div
                            className={
                              darkMode
                                ? "mt-4 h-2 overflow-hidden rounded-full bg-zinc-800"
                                : "mt-4 h-2 overflow-hidden rounded-full bg-zinc-200"
                            }
                          >
                            <div
                              className={
                                darkMode
                                  ? "h-full rounded-full bg-white transition-all duration-500"
                                  : "h-full rounded-full bg-black transition-all duration-500"
                              }
                              style={{
                                width: `${item.mastery}%`,
                              }}
                            />
                          </div>

                          {/* ATTEMPTS */}

                          <div className="mt-3 flex gap-4 text-xs text-zinc-500">
                            <span>
                              {item.attempts}{" "}
                              {item.attempts === 1
                                ? "attempt"
                                : "attempts"}
                            </span>

                            <span>
                              {item.correct} correct
                            </span>

                            <span>
                              {item.incorrect} incorrect
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}