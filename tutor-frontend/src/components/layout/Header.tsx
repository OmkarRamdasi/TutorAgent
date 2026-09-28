import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface HeaderProps {
  onTestCourses?: () => void;
  onTestTutor?: () => void;
}

export default function Header({
  onTestCourses,
  onTestTutor,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header
      className={
        darkMode
          ? "h-16 border-b border-white/10"
          : "h-16 border-b border-[var(--learnai-primary-soft)] bg-[var(--learnai-surface)]"
      }
    >
      <div className="flex h-full items-center justify-between px-6">

        {/* LOGO */}

        <div className="flex items-center gap-2">
          <div
            className={
              darkMode
                ? "flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black"
                : "flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--learnai-primary)] text-white"
            }
          >
            ✦
          </div>

          <span
            className={
              darkMode
                ? "font-semibold text-white"
                : "font-semibold text-[var(--learnai-primary)]"
            }
          >
            LearnAI
          </span>
        </div>

        {/* RIGHT SIDE */}

        <div className="flex items-center gap-3">

          {/* THEME */}

          <button
            type="button"
            onClick={toggleTheme}
            className={
              darkMode
                ? "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/10"
                : "flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--learnai-primary-soft)] bg-[var(--learnai-surface)] text-[var(--learnai-primary)] transition hover:bg-[var(--learnai-primary-soft)]"
            }
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* EMAIL */}

          <span
            className={
              darkMode
                ? "hidden text-sm text-zinc-400 sm:block"
                : "hidden text-sm text-[var(--learnai-primary)]/60 sm:block"
            }
          >
            {user?.email}
          </span>

          {/* TEMPORARY TEST BUTTONS */}

          {onTestCourses && (
            <button
              type="button"
              onClick={onTestCourses}
              className={
                darkMode
                  ? "rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"
                  : "rounded-lg bg-[var(--learnai-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              }
            >
              Test Courses
            </button>
          )}

          {onTestTutor && (
            <button
              type="button"
              onClick={onTestTutor}
              className={
                darkMode
                  ? "rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"
                  : "rounded-lg bg-[var(--learnai-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              }
            >
              Test Tutor
            </button>
          )}

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            className={
              darkMode
                ? "rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
                : "rounded-lg border border-[var(--learnai-primary-soft)] bg-[var(--learnai-surface)] px-4 py-2 text-sm font-medium text-[var(--learnai-primary)] transition hover:bg-[var(--learnai-primary-soft)]"
            }
          >
            Logout
          </button>

        </div>
      </div>
    </header>
  );
}