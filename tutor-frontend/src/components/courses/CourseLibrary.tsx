import { BookOpen, FileText, ArrowRight } from "lucide-react";
import { useCourses } from "../../context/CourseContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { CourseLibrarySkeleton, EmptyState, InlineError } from "../ui/Skeleton";

export default function CourseLibrary() {
  const { courses, loadingCourses, courseError, fetchCourses } = useCourses();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  if (loadingCourses) {
    return <CourseLibrarySkeleton />;
  }

  if (courseError) {
    return (
      <div className="mt-10">
        <InlineError
          title="Your library couldn't be loaded"
          message={courseError}
          onRetry={() => {
            if (user) {
              void fetchCourses(user);
            }
          }}
        />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="mt-10">
        <EmptyState
          title="Your library is empty"
          message="Upload a PDF to create your first learning library."
        />
      </div>
    );
  }

  return (
    <div className="mt-10">
      {/* HEADER */}

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2
            className={
              darkMode
                ? "text-base font-semibold text-white"
                : "text-base font-semibold text-black"
            }
          >
            Your Libraries
          </h2>

          <p
            className={
              darkMode
                ? "mt-1 text-xs text-zinc-500"
                : "mt-1 text-xs text-zinc-500"
            }
          >
            Continue learning from your study material
          </p>
        </div>

        <span
          className={
            darkMode
              ? "text-xs text-zinc-500"
              : "text-xs text-zinc-500"
          }
        >
          {courses.length} librar
          {courses.length === 1 ? "y" : "ies"}
        </span>
      </div>

      {/* LIBRARY LIST */}

      <div
        className={`max-h-[60vh] overflow-y-auto rounded-xl pr-2 ${darkMode ? "scrollbar-dark" : "scrollbar-light"
          }`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className={
                darkMode
                  ? "rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20"
                  : "rounded-xl border border-[#E5E5E5] bg-white p-5 transition hover:border-black hover:shadow-sm"
              }
            >
              {/* LIBRARY HEADER */}

              <div className="flex items-start gap-3">
                <div
                  className={
                    darkMode
                      ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10"
                      : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5]"
                  }
                >
                  <BookOpen
                    size={19}
                    strokeWidth={1.8}
                    className={
                      darkMode ? "text-white" : "text-black"
                    }
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    className={
                      darkMode
                        ? "truncate text-sm font-semibold text-white"
                        : "truncate text-sm font-semibold text-black"
                    }
                  >
                    {course.title}
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    {course.documents?.length || 0} document
                    {course.documents?.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {/* DOCUMENTS */}

              <div className="mt-5">
                <p
                  className={
                    darkMode
                      ? "mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500"
                      : "mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500"
                  }
                >
                  Study Material
                </p>

                <div className="space-y-2">
                  {course.documents?.map((document: any) => (
                    <div
                      key={document.id}
                      className={
                        darkMode
                          ? "flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2.5"
                          : "flex items-center gap-2 rounded-lg bg-[#F5F5F5] px-3 py-2.5"
                      }
                    >
                      <FileText
                        size={15}
                        strokeWidth={1.8}
                        className={
                          darkMode
                            ? "shrink-0 text-zinc-300"
                            : "shrink-0 text-black"
                        }
                      />

                      <span
                        className={
                          darkMode
                            ? "min-w-0 flex-1 truncate text-xs text-zinc-300"
                            : "min-w-0 flex-1 truncate text-xs text-zinc-700"
                        }
                      >
                        {document.filename}
                      </span>

                      <span
                        className={
                          darkMode
                            ? "shrink-0 text-[10px] text-zinc-500"
                            : "shrink-0 text-[10px] text-zinc-500"
                        }
                      >
                        {document.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* LEARNING STATUS */}

              <div
                className={
                  darkMode
                    ? "mt-5 border-t border-white/10 pt-4"
                    : "mt-5 border-t border-[#E5E5E5] pt-4"
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={
                        darkMode
                          ? "text-xs font-medium text-zinc-300"
                          : "text-xs font-medium text-zinc-700"
                      }
                    >
                      Learning Journey
                    </p>

                    <p className="mt-1 text-[11px] text-zinc-500">
                      Ready to start
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/app/library/${course.id}`)}
                    className={
                      darkMode
                        ? "flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-zinc-200"
                        : "flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800"
                    }
                  >
                    Continue
                    <ArrowRight size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}