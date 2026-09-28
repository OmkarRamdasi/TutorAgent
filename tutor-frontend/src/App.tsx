import { useState } from "react";
import { Toaster } from "sonner";

import { useAuth } from "./context/AuthContext";
import { useCourses } from "./context/CourseContext";
import { useTheme } from "./context/ThemeContext";

import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import UploadCard from "./components/courses/UploadCard";
import CourseLibrary from "./components/courses/CourseLibrary";
import Tutor from "./components/tutor/Tutor";

function App() {
  const {
    user,
    login,
    signup,
    loading,
    error,
  } = useAuth();

  const {
    darkMode,
  } = useTheme();

  const { courses } = useCourses();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const testCourses = async () => {
    if (!user) {
      console.log("No user logged in");
      return;
    }

    try {
      const token = await user.getIdToken();

      const response = await fetch(
        "http://localhost:8000/courses",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Courses:", data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  /*
   * ============================
   * LOGGED-IN DASHBOARD
   * ============================
   */

  if (user) {
    return (
      <div
        className={
          darkMode
            ? "min-h-screen bg-zinc-950 text-white transition-colors duration-300"
            : "min-h-screen bg-[var(--learnai-bg)] text-[var(--learnai-primary)] transition-colors duration-300"
        }
      >
        <Toaster
          position="bottom-right"
          theme={darkMode ? "dark" : "light"}
          richColors
          closeButton
        />

        {/* HEADER */}

        <Header
          onTestCourses={testCourses}
        />

        {/* BODY */}

        <div className="flex">

          {/* SIDEBAR */}

          <Sidebar />

          {/* MAIN CONTENT */}

          <main className="flex-1">

            <div className="mx-auto max-w-5xl px-6 py-12">

              {/* GREETING */}

              <div className="mb-10">

                <p
                  className={
                    darkMode
                      ? "text-sm text-zinc-500"
                      : "text-sm text-[var(--learnai-primary)]/60"
                  }
                >
                  Your learning space
                </p>

                <h1
                  className={
                    darkMode
                      ? "mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
                      : "mt-2 text-3xl font-semibold tracking-tight text-[var(--learnai-primary)] sm:text-4xl"
                  }
                >
                  What do you want to learn?
                </h1>

                <p
                  className={
                    darkMode
                      ? "mt-3 text-zinc-400"
                      : "mt-3 text-[var(--learnai-primary)]/70"
                  }
                >
                  Upload your material and your AI tutor will
                  teach you from it.
                </p>

              </div>

              {/* UPLOAD CARD */}

              <UploadCard />

              {/* ASK TUTOR */}

              <Tutor />

              {/* LIBRARY */}

              <CourseLibrary />

              {/* QUICK ACTIONS */}

              <div className="mt-10">

                <h2
                  className={
                    darkMode
                      ? "mb-4 text-sm font-medium text-zinc-300"
                      : "mb-4 text-sm font-medium text-[var(--learnai-primary)]"
                  }
                >
                  Quick actions
                </h2>

                <div className="grid gap-4 sm:grid-cols-3">

                  {[
                    {
                      title: "Continue learning",
                      description: "Resume where you left off",
                      icon: "▶",
                    },
                    {
                      title: "Practice",
                      description: "Test your understanding",
                      icon: "✦",
                    },
                    {
                      title: "Take a quiz",
                      description: "Challenge yourself",
                      icon: "✓",
                    },
                  ].map((item) => (
                    <button
                      key={item.title}
                      className={
                        darkMode
                          ? "rounded-xl border border-white/10 bg-white/[0.02] p-5 text-left transition hover:bg-white/[0.05]"
                          : "rounded-xl border border-[var(--learnai-primary-soft)] bg-[var(--learnai-surface)] p-5 text-left transition hover:border-[var(--learnai-primary)] hover:bg-[var(--learnai-primary-soft)]"
                      }
                    >

                      <div
                        className={
                          darkMode
                            ? "mb-4 text-lg"
                            : "mb-4 text-lg text-[var(--learnai-accent)]"
                        }
                      >
                        {item.icon}
                      </div>

                      <h3
                        className={
                          darkMode
                            ? "text-sm font-medium text-white"
                            : "text-sm font-medium text-[var(--learnai-primary)]"
                        }
                      >
                        {item.title}
                      </h3>

                      <p
                        className={
                          darkMode
                            ? "mt-1 text-xs text-zinc-500"
                            : "mt-1 text-xs text-[var(--learnai-primary)]/60"
                        }
                      >
                        {item.description}
                      </p>

                    </button>
                  ))}

                </div>

              </div>

            </div>

          </main>

        </div>
      </div>
    );
  }

  /*
   * ============================
   * LOGIN / SIGN UP
   * ============================
   */

  return (
    <div className="min-h-screen bg-[var(--learnai-bg)] text-[var(--learnai-primary)]">

      <Toaster
        position="bottom-right"
        theme="light"
        richColors
        closeButton
      />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col">

        {/* HEADER */}

        <header className="flex h-16 items-center justify-between px-6">

          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--learnai-primary)] text-white">
              ✦
            </div>

            <span className="font-semibold text-[var(--learnai-primary)]">
              LearnAI
            </span>

          </div>

          <span className="text-sm text-[var(--learnai-primary)]/60">
            Your personal AI tutor
          </span>

        </header>

        {/* MAIN */}

        <main className="flex flex-1 items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            {/* INTRO */}

            <div className="mb-8 text-center">

              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--learnai-primary-soft)] text-2xl text-[var(--learnai-primary)]">
                ✦
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-[var(--learnai-primary)]">
                {isLogin
                  ? "Welcome back"
                  : "Start learning"}
              </h1>

              <p className="mt-3 text-sm leading-6 text-[var(--learnai-primary)]/65">
                {isLogin
                  ? "Continue learning with your personal AI tutor."
                  : "Create your account and learn anything with AI."}
              </p>

            </div>

            {/* AUTH CARD */}

            <div className="rounded-2xl border border-[var(--learnai-primary-soft)] bg-[var(--learnai-surface)] p-6 shadow-sm">

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[var(--learnai-primary)]">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-[var(--learnai-primary-soft)] bg-[var(--learnai-bg)] px-4 py-3 text-sm text-[var(--learnai-primary)] outline-none placeholder:text-[var(--learnai-primary)]/40 transition focus:border-[var(--learnai-primary)]"
                  />

                </div>

                {/* PASSWORD */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[var(--learnai-primary)]">
                    Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-[var(--learnai-primary-soft)] bg-[var(--learnai-bg)] px-4 py-3 text-sm text-[var(--learnai-primary)] outline-none placeholder:text-[var(--learnai-primary)]/40 transition focus:border-[var(--learnai-primary)]"
                  />

                </div>

                {/* ERROR */}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[var(--learnai-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Please wait..."
                    : isLogin
                      ? "Continue"
                      : "Create account"}
                </button>

              </form>

              {/* DIVIDER */}

              <div className="my-6 flex items-center gap-3">

                <div className="h-px flex-1 bg-[var(--learnai-primary-soft)]" />

                <span className="text-xs text-[var(--learnai-primary)]/40">
                  OR
                </span>

                <div className="h-px flex-1 bg-[var(--learnai-primary-soft)]" />

              </div>

              {/* GOOGLE */}

              <button
                type="button"
                className="w-full rounded-xl border border-[var(--learnai-primary-soft)] bg-[var(--learnai-surface)] px-4 py-3 text-sm font-medium text-[var(--learnai-primary)] transition hover:bg-[var(--learnai-primary-soft)]"
              >
                Continue with Google
              </button>

            </div>

            {/* SWITCH LOGIN / SIGNUP */}

            <p className="mt-6 text-center text-sm text-[var(--learnai-primary)]/60">

              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                }}
                className="ml-1 font-medium text-[var(--learnai-accent)] hover:underline"
              >
                {isLogin
                  ? "Create one"
                  : "Sign in"}
              </button>

            </p>

          </div>

        </main>

        {/* FOOTER */}

        <footer className="px-6 py-6 text-center text-xs text-[var(--learnai-primary)]/40">
          Learn anything. Understand everything.
        </footer>

      </div>

    </div>
  );
}

export default App;