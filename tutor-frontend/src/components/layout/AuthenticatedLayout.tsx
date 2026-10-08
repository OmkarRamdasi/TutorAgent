import { Outlet } from "react-router-dom";

import { useTheme } from "../../context/ThemeContext";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AuthenticatedLayout() {
  const { darkMode } = useTheme();

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-zinc-950 text-white transition-colors duration-300"
          : "min-h-screen bg-(--learnai-bg) text-(--learnai-primary) transition-colors duration-300"
      }
    >
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}