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
      className={
        darkMode
          ? "flex h-screen flex-col overflow-hidden bg-zinc-950 text-white transition-colors duration-300"
          : "flex h-screen flex-col overflow-hidden bg-(--learnai-bg) text-(--learnai-primary) transition-colors duration-300"
      }
    >
      <Header />

      <div className="flex min-h-0 flex-1 items-stretch overflow-hidden">
        <div className="flex shrink-0 self-stretch">
          {isCourseWorkspace ? <CourseSidebar /> : <Sidebar />}
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}