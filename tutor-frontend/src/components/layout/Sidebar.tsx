import { useCourses } from "../../context/CourseContext";
import { useTheme } from "../../context/ThemeContext";

export default function Sidebar() {
  const { courses } = useCourses();
  const { darkMode } = useTheme();

  return (
    <aside
      className={
        darkMode
          ? "hidden min-h-[calc(100vh-4rem)] w-64 border-r border-white/10 p-4 md:block"
          : "hidden min-h-[calc(100vh-4rem)] w-64 border-r border-[var(--learnai-primary-soft)] bg-[var(--learnai-bg)] p-4 md:block"
      }
    >
      {/* NEW COURSE */}

      <button
        type="button"
        className={
          darkMode
            ? "mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black hover:bg-zinc-200"
            : "mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--learnai-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        }
      >
        + New Course
      </button>

      {/* LIBRARY */}

      <div>
        <p
          className={
            darkMode
              ? "mb-3 px-2 text-xs font-medium uppercase tracking-wider text-zinc-500"
              : "mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--learnai-primary)]/50"
          }
        >
          Your Library
        </p>

        <div className="space-y-1">
          <button
            type="button"
            className={
              darkMode
                ? "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
                : "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[var(--learnai-primary)] transition hover:bg-[var(--learnai-primary-soft)]"
            }
          >
            <span>📄 Your documents</span>

            {courses.length > 0 && (
              <span
                className={
                  darkMode
                    ? "rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-400"
                    : "rounded-full bg-[var(--learnai-primary-soft)] px-2 py-0.5 text-xs font-medium text-[var(--learnai-primary)]"
                }
              >
                {courses.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* BOTTOM */}

      <div className="absolute bottom-6 w-56">

        <button
          type="button"
          className={
            darkMode
              ? "w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-400 hover:bg-white/5"
              : "w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--learnai-primary)] transition hover:bg-[var(--learnai-primary-soft)]"
          }
        >
          📊 Progress
        </button>

        <button
          type="button"
          className={
            darkMode
              ? "w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-400 hover:bg-white/5"
              : "w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--learnai-primary)] transition hover:bg-[var(--learnai-primary-soft)]"
          }
        >
          ⚙ Settings
        </button>

      </div>
    </aside>
  );
}