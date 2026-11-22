
import { Outlet, useLocation } from "react-router-dom";

import { useTheme } from "../../context/ThemeContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import CourseSidebar from "./CourseSidebar";

export default function AuthenticatedLayout() {
  const { darkMode } = useTheme();
  const location = useLocation();

  const isCourseWorkspace =
    /^\/app\/(library|tutor|practice|progress)\/[^/]+/.test(
      location.pathname
    );

  return (
    <div
      className={`flex h-dvh flex-col overflow-hidden ${
        darkMode
          ? "bg-zinc-950 text-white"
          : "bg-(--learnai-bg) text-(--learnai-primary)"
      } transition-colors duration-300`}
    >
      {/* Application header */}
      <div className="shrink-0">
        <Header />
      </div>

      {/* Main application area */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">

        {/* Desktop sidebar */}
        <div className="hidden shrink-0 self-stretch md:flex">
          {isCourseWorkspace ? <CourseSidebar /> : <Sidebar />}
        </div>

        {/* Page content */}
        <main
          className={`min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain ${
            isCourseWorkspace ? "pb-20 md:pb-0" : ""
          } ${
            darkMode ? "scrollbar-dark" : "scrollbar-light"
          }`}
        >
          <Outlet />
        </main>

        {/* Mobile course navigation */}
        {isCourseWorkspace && <CourseSidebar />}
      </div>
    </div>
  );
}
