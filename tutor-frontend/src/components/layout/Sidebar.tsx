import { BarChart3, FileText, Plus, Settings } from "lucide-react";
import { useCourses } from "../../context/CourseContext";
import { useTheme } from "../../context/ThemeContext";

export default function Sidebar() {
  const { courses, loadingCourses } = useCourses();
  const { darkMode } = useTheme();

  return (
    <aside
      className={
        darkMode
          ? "relative hidden min-h-[calc(100vh-4rem)] w-64 border-r border-white/10 p-4 md:block"
          : "relative hidden min-h-[calc(100vh-4rem)] w-64 border-r border-(--learnai-primary-soft) bg-(--learnai-bg) p-4 md:block"
      }
    >
      <button
        type="button"
        className={
          darkMode
            ? "mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
            : "mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
        }
      >
        <Plus size={16} />
        New Course
      </button>

      <div>
        <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Your Library
        </p>

        <div className="space-y-1">
          <button
            type="button"
            className={
              darkMode
                ? "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
                : "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-(--learnai-primary-soft)"
            }
          >
            <span className="flex items-center gap-2">
              <FileText size={15} />
              Your documents
            </span>

            {loadingCourses ? (
              <span className="h-5 w-7 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
            ) : courses.length > 0 ? (
              <span className={darkMode ? "rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300" : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700"}>
                {courses.length}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 left-4 right-4 space-y-1">
        <button
          type="button"
          className={
            darkMode
              ? "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-400 transition hover:bg-white/5"
              : "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-(--learnai-primary-soft)"
          }
        >
          <BarChart3 size={15} />
          Progress
        </button>

        <button
          type="button"
          className={
            darkMode
              ? "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-400 transition hover:bg-white/5"
              : "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-(--learnai-primary-soft)"
          }
        >
          <Settings size={15} />
          Settings
        </button>
      </div>
    </aside>
  );
}
