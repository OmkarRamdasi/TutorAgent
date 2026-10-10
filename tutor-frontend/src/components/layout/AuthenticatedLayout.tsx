
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
          ? "flex min-h-screen flex-col bg-zinc-950 text-white transition-colors duration-300"
          : "flex min-h-screen flex-col bg-(--learnai-bg) text-(--learnai-primary) transition-colors duration-300"
      }
    >
      <Header />

      <div className="flex flex-1 items-stretch">
        <div className="flex shrink-0 self-stretch">
          {isCourseWorkspace ? <CourseSidebar /> : <Sidebar />}
        </div>

        <main className="min-h-full min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
