import { Moon, Sparkles, Sun, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Header() {
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
          : "h-16 border-b border-(--learnai-primary-soft) bg-(--learnai-surface)"
      }
    >
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div
            className={
              darkMode
                ? "flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black"
                : "flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white"
            }
          >
            <Sparkles size={16} strokeWidth={2} />
          </div>
          <span className={darkMode ? "font-semibold text-white" : "font-semibold text-black"}>
            LearnAI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            className={
              darkMode
                ? "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white transition hover:bg-white/10"
                : "flex h-9 w-9 items-center justify-center rounded-lg border border-(--learnai-primary-soft) bg-(--learnai-surface) text-black transition hover:bg-(--learnai-primary-soft)"
            }
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <span className={darkMode ? "hidden max-w-52 truncate text-sm text-zinc-400 sm:block" : "hidden max-w-52 truncate text-sm text-zinc-500 sm:block"}>
            {user?.email}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className={
              darkMode
                ? "flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                : "flex items-center gap-2 rounded-lg border border-(--learnai-primary-soft) bg-(--learnai-surface) px-4 py-2 text-sm font-medium text-black transition hover:bg-(--learnai-primary-soft)"
            }
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
