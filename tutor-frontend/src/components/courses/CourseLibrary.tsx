import { useCourses } from "../../context/CourseContext";
import { useTheme } from "../../context/ThemeContext";

export default function CourseLibrary() {
  const { courses } = useCourses();
  const { darkMode } = useTheme();

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between">
        <h2
          className={
            darkMode
              ? "text-sm font-medium text-zinc-300"
              : "text-sm font-semibold text-[var(--learnai-primary)]"
          }
        >
          Your Library
        </h2>

        <span
          className={
            darkMode
              ? "text-xs text-zinc-500"
              : "text-xs text-[var(--learnai-primary)]/50"
          }
        >
          {courses.length} course
          {courses.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* SCROLLABLE LIBRARY */}

      <div
        className={`max-h-[60vh] overflow-y-auto rounded-xl pr-2 ${
          darkMode
            ? "scrollbar-dark"
            : "scrollbar-light"
        }`}
      >
        <div className="grid gap-4 sm:grid-cols-2">

          {courses.map((course) => (
            <div
              key={course.id}
              className={
                darkMode
                  ? "rounded-xl border border-white/10 bg-white/[0.02] p-5"
                  : "rounded-xl border border-[var(--learnai-primary-soft)] bg-[var(--learnai-surface)] p-5 transition hover:border-[var(--learnai-primary)] hover:shadow-sm"
              }
            >

              {/* COURSE HEADER */}

              <div className="mb-4 flex items-start gap-3">

                <div
                  className={
                    darkMode
                      ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10"
                      : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--learnai-primary-soft)]"
                  }
                >
                  📚
                </div>

                <div className="min-w-0 flex-1">

                  <h3
                    className={
                      darkMode
                        ? "truncate text-sm font-medium text-white"
                        : "truncate text-sm font-semibold text-[var(--learnai-primary)]"
                    }
                  >
                    {course.title}
                  </h3>

                  <p
                    className={
                      darkMode
                        ? "mt-1 text-xs text-zinc-500"
                        : "mt-1 text-xs text-[var(--learnai-primary)]/50"
                    }
                  >
                    {course.documents?.length || 0} document
                    {course.documents?.length === 1
                      ? ""
                      : "s"}
                  </p>

                </div>
              </div>

              {/* DOCUMENTS */}

              <div className="space-y-2">

                {course.documents?.map(
                  (document: any) => (
                    <div
                      key={document.id}
                      className={
                        darkMode
                          ? "rounded-lg bg-white/5 px-3 py-2 text-xs"
                          : "rounded-lg bg-[var(--learnai-bg)] px-3 py-2 text-xs"
                      }
                    >

                      <div className="flex items-center justify-between gap-2">

                        <span
                          className={
                            darkMode
                              ? "truncate text-zinc-300"
                              : "truncate text-[var(--learnai-primary)]"
                          }
                        >
                          📄 {document.filename}
                        </span>

                        <span
                          className={
                            darkMode
                              ? "ml-3 shrink-0 text-zinc-500"
                              : "ml-3 shrink-0 text-[var(--learnai-primary)]/50"
                          }
                        >
                          {document.status}
                        </span>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}