
import { NavLink, useParams } from "react-router-dom";

import {
  BookOpen,
  MessageSquare,
  Brain,
  ChevronLeft,
  Home,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

export default function CourseSidebar() {
  const { courseId } = useParams<{ courseId: string }>();
  const { darkMode } = useTheme();

  if (!courseId) return null;

  const items = [
    {
      label: "Material",
      shortLabel: "Material",
      path: `/app/library/${courseId}`,
      icon: BookOpen,
    },
    {
      label: "Tutor",
      shortLabel: "Tutor",
      path: `/app/tutor/${courseId}`,
      icon: MessageSquare,
    },
    {
      label: "Learning Journey",
      shortLabel: "Journey",
      path: `/app/progress/${courseId}`,
      icon: Brain,
    },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden min-h-full w-64 shrink-0 flex-col border-r p-4 transition-colors duration-300 md:flex ${
          darkMode
            ? "border-white/10 bg-zinc-950 text-white"
            : "border-(--learnai-primary-soft) bg-(--learnai-surface) text-(--learnai-primary)"
        }`}
      >
        <NavLink
          to="/app"
          className={`mb-8 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
            darkMode
              ? "text-zinc-400 hover:bg-white/5 hover:text-white"
              : "text-zinc-500 hover:bg-black/5 hover:text-black"
          }`}
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </NavLink>

        <p
          className={`mb-3 px-3 text-xs font-medium uppercase tracking-wider ${
            darkMode ? "text-zinc-500" : "text-zinc-500"
          }`}
        >
          Course workspace
        </p>

        <nav className="space-y-1">
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={label}
              to={path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? darkMode
                      ? "bg-white/10 font-medium text-white"
                      : "bg-black/5 font-medium text-black"
                    : darkMode
                      ? "text-zinc-400 hover:bg-white/5 hover:text-white"
                      : "text-zinc-600 hover:bg-black/5 hover:text-black"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom navigation */}
      <nav
        className={`fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden ${
          darkMode
            ? "border-white/10 bg-zinc-950/95 text-zinc-400 backdrop-blur-lg"
            : "border-(--learnai-primary-soft) bg-white/95 text-zinc-500 backdrop-blur-lg"
        }`}
      >
        <NavLink
          to="/app"
          className={({ isActive }) =>
            `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-xs transition ${
              isActive
                ? darkMode
                  ? "text-white"
                  : "text-black"
                : ""
            }`
          }
        >
          <Home size={20} strokeWidth={1.8} />
          <span>Home</span>
        </NavLink>

        {items.map(({ label, shortLabel, path, icon: Icon }) => (
          <NavLink
            key={label}
            to={path}
            end
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-xs transition ${
                isActive
                  ? darkMode
                    ? "font-medium text-white"
                    : "font-medium text-black"
                  : ""
              }`
            }
          >
            <Icon size={20} strokeWidth={1.8} />
            <span className="truncate">{shortLabel}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
