import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useCourses } from "../../context/CourseContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { LibraryDetailSkeleton, InlineError } from "../ui/Skeleton";

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
  const { darkMode } = useTheme();
  const [summary, setSummary] = useState<string | null>(null);

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

        {/* YOUR MATERIAL */}

        {/* <section
          className={
            darkMode
              ? "rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              : "rounded-2xl border border-(--learnai-primary-soft) bg-white p-6"
          }
        >
          <div className="mb-5">
            <p
              className={
                darkMode
                  ? "text-xs font-medium uppercase tracking-wide text-zinc-500"
                  : "text-xs font-medium uppercase tracking-wide text-zinc-500"
              }
            >
              01
            </p>

            <h2
              className={
                darkMode
                  ? "mt-1 text-base font-semibold text-white"
                  : "mt-1 text-base font-semibold text-black"
              }
            >
              Your Material
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Material uploaded to this learning library.
            </p>
          </div>

          <div className="space-y-2">
            {course.documents?.map((document: any) => (
              <div
                key={document.id}
                className={
                  darkMode
                    ? "flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3"
                    : "flex items-center gap-3 rounded-xl bg-[#F5F5F5] px-4 py-3"
                }
              >
                <FileText
                  size={18}
                  strokeWidth={1.7}
                  className={
                    darkMode
                      ? "shrink-0 text-zinc-300"
                      : "shrink-0 text-black"
                  }
                />

                <div className="min-w-0 flex-1">
                  <p
                    className={
                      darkMode
                        ? "truncate text-sm text-zinc-200"
                        : "truncate text-sm text-zinc-800"
                    }
                  >
                    {document.filename}
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    {document.pages
                      ? `${document.pages} pages`
                      : "Document"}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-zinc-500">
                  {document.status}
                </span>
              </div>
            ))}
          </div>
        </section> */}

        {/* AI SUMMARY */}
        <section>
          <div className="flex items-start gap-4">
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

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Here's a quick overview of your study material to give
                you context before you start learning.
              </p>

              {summaryLoading && (
                <div
                  className={
                    darkMode
                      ? "mt-5 rounded-xl bg-white/5 p-5"
                      : "mt-5 rounded-xl bg-[#F5F5F5] p-5"
                  }
                >
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 w-40 rounded bg-zinc-300/40" />
                    <div className="h-3 w-full rounded bg-zinc-300/30" />
                    <div className="h-3 w-5/6 rounded bg-zinc-300/30" />
                    <div className="h-3 w-4/6 rounded bg-zinc-300/30" />
                  </div>
                </div>
              )}

              {summaryError && (
                <div className="mt-5">
                  <InlineError
                    title="Summary couldn't be loaded"
                    message={summaryError}
                  />
                </div>
              )}

              {summary && !summaryLoading && !summaryError && (
                <div
                  className={
                    darkMode
                      ? "mt-5 rounded-xl bg-white/5 p-5 text-sm leading-7 text-zinc-300 whitespace-pre-wrap"
                      : "mt-5 rounded-xl bg-[#F5F5F5] p-5 text-sm leading-7 text-zinc-700 whitespace-pre-wrap"
                  }
                >
                  <div
                    className={
                      darkMode
                        ? "prose prose-invert max-w-none prose-headings:font-semibold prose-headings:text-white prose-p:text-zinc-300 prose-p:leading-7 prose-li:text-zinc-300 prose-strong:text-white"
                        : "prose max-w-none prose-headings:font-semibold prose-headings:text-black prose-p:text-zinc-700 prose-p:leading-7 prose-li:text-zinc-700 prose-strong:text-black"
                    }
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summary}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
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
            <div
              className={
                darkMode
                  ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white"
                  : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5] text-black"
              }
            >
              <GraduationCap size={19} strokeWidth={1.7} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                04
              </p>

              <h2
                className={
                  darkMode
                    ? "mt-1 text-base font-semibold text-white"
                    : "mt-1 text-base font-semibold text-black"
                }
              >
                Learning Journey
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Learn step by step, practice what you understand,
                and track your progress as you go.
              </p>

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
                  Start learning after reviewing your material.
                </p>
              </div>

              <button
                type="button"
                className={
                  darkMode
                    ? "mt-5 flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
                    : "mt-5 flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
                }
              >
                Start Learning
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}