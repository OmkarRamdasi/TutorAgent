import {
  ArrowRight,
  BookOpen,
  Check,
  Play,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Toaster } from "sonner";

import CourseLibrary from "./components/courses/CourseLibrary";
import LibraryDetail from "./components/courses/LibraryDetail";
import UploadCard from "./components/courses/UploadCard";
import AuthenticatedLayout from "./components/layout/AuthenticatedLayout";
import Tutor from "./components/tutor/Tutor";
import AuthLoadingScreen from "./components/ui/AuthLoadingScreen";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import Practice from "./components/tutor/Practice";
import LearningJourney from "./components/courses/LearningJourney";

function Dashboard() {
  const { darkMode } = useTheme();
  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-zinc-950 text-white transition-colors duration-300"
          : "min-h-screen bg-(--learnai-bg) text-(--learnai-primary) transition-colors duration-300"
      }
    >

      {/* BODY */}

      <div className="flex">
        {/* MAIN CONTENT */}

        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-6 py-12">

            {/* GREETING */}

            <div className="mb-10">
              <p
                className={
                  darkMode
                    ? "text-sm text-zinc-500"
                    : "text-sm text-(--learnai-primary)/60"
                }
              >
                Your learning space
              </p>

              <h1
                className={
                  darkMode
                    ? "mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
                    : "mt-2 text-3xl font-semibold tracking-tight text-(--learnai-primary) sm:text-4xl"
                }
              >
                What do you want to learn?
              </h1>

              <p
                className={
                  darkMode
                    ? "mt-3 text-zinc-400"
                    : "mt-3 text-(--learnai-primary)/70"
                }
              >
                Upload your material and your AI tutor will
                teach you from it.
              </p>
            </div>

            {/* UPLOAD CARD */}

            <UploadCard />

            {/* ASK TUTOR */}


            {/* LIBRARY */}

            <CourseLibrary />

            {/* QUICK ACTIONS */}

            <div className="mt-10">
              <h2
                className={
                  darkMode
                    ? "mb-4 text-sm font-medium text-zinc-300"
                    : "mb-4 text-sm font-medium text-(--learnai-primary)"
                }
              >
                Quick actions
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "Continue learning",
                    description: "Resume where you left off",
                    icon: Play,
                  },
                  {
                    title: "Practice",
                    description: "Test your understanding",
                    icon: Sparkles,
                  },
                  {
                    title: "Take a quiz",
                    description: "Challenge yourself",
                    icon: Check,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      className={
                        darkMode
                          ? "rounded-xl border border-white/10 bg-white/[0.02] p-5 text-left transition hover:bg-white/[0.05]"
                          : "rounded-xl border border-(--learnai-primary-soft) bg-(--learnai-surface) p-5 text-left transition hover:border-(--learnai-primary) hover:bg-(--learnai-primary-soft)"
                      }
                    >
                      <div
                        className={
                          darkMode
                            ? "mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white"
                            : "mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-(--learnai-primary-soft) text-black"
                        }
                      >
                        <Icon size={17} strokeWidth={1.8} />
                      </div>

                      <h3
                        className={
                          darkMode
                            ? "text-sm font-medium text-white"
                            : "text-sm font-medium text-(--learnai-primary)"
                        }
                      >
                        {item.title}
                      </h3>

                      <p
                        className={
                          darkMode
                            ? "mt-1 text-xs text-zinc-500"
                            : "mt-1 text-xs text-(--learnai-primary)/60"
                        }
                      >
                        {item.description}
                      </p>

                      <div
                        className={
                          darkMode
                            ? "mt-4 flex items-center gap-1 text-xs text-zinc-400"
                            : "mt-4 flex items-center gap-1 text-xs text-zinc-500"
                        }
                      >
                        Open
                        <ArrowRight size={13} />
                      </div>
                    </button>
                  );
                })}
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
 * LIBRARY DETAIL
 * ============================
 *
 * Temporary placeholder.
 * We will build the actual LibraryDetail
 * page next.
 */



/*
 * ============================
 * LOGIN / SIGN UP
 * ============================
 */

function AuthScreen() {
  const {
    login,
    signup,
    loading,
    error,
  } = useAuth();

  const { darkMode } = useTheme();

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

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-zinc-950 text-white"
          : "min-h-screen bg-(--learnai-bg) text-(--learnai-primary)"
      }
    >

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col">

        {/* HEADER */}

        <header className="flex h-16 items-center justify-between px-6">
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

            <span
              className={
                darkMode
                  ? "font-semibold text-white"
                  : "font-semibold text-black"
              }
            >
              LearnAI
            </span>
          </div>

          <span
            className={
              darkMode
                ? "text-sm text-zinc-500"
                : "text-sm text-zinc-500"
            }
          >
            Your personal AI tutor
          </span>
        </header>

        {/* MAIN */}

        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            {/* INTRO */}

            <div className="mb-8 text-center">
              <div
                className={
                  darkMode
                    ? "mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white"
                    : "mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-(--learnai-primary-soft) text-black"
                }
              >
                <BookOpen size={24} strokeWidth={1.8} />
              </div>

              <h1
                className={
                  darkMode
                    ? "text-3xl font-semibold tracking-tight text-white"
                    : "text-3xl font-semibold tracking-tight text-black"
                }
              >
                {isLogin ? "Welcome back" : "Start learning"}
              </h1>

              <p
                className={
                  darkMode
                    ? "mt-3 text-sm leading-6 text-zinc-400"
                    : "mt-3 text-sm leading-6 text-zinc-500"
                }
              >
                {isLogin
                  ? "Continue learning with your personal AI tutor."
                  : "Create your account and learn anything with AI."}
              </p>
            </div>

            {/* AUTH CARD */}

            <div
              className={
                darkMode
                  ? "rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-sm"
                  : "rounded-2xl border border-(--learnai-primary-soft) bg-(--learnai-surface) p-6 shadow-sm"
              }
            >
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* EMAIL */}

                <div>
                  <label
                    className={
                      darkMode
                        ? "mb-2 block text-sm font-medium text-white"
                        : "mb-2 block text-sm font-medium text-black"
                    }
                  >
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
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-white/30"
                        : "w-full rounded-xl border border-(--learnai-primary-soft) bg-(--learnai-bg) px-4 py-3 text-sm text-black outline-none placeholder:text-zinc-400 transition focus:border-black"
                    }
                  />
                </div>

                {/* PASSWORD */}

                <div>
                  <label
                    className={
                      darkMode
                        ? "mb-2 block text-sm font-medium text-white"
                        : "mb-2 block text-sm font-medium text-black"
                    }
                  >
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
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-white/30"
                        : "w-full rounded-xl border border-(--learnai-primary-soft) bg-(--learnai-bg) px-4 py-3 text-sm text-black outline-none placeholder:text-zinc-400 transition focus:border-black"
                    }
                  />
                </div>

                {/* ERROR */}

                {error && (
                  <div className={darkMode ? "rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300" : "rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700"}>
                    {error}
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className={
                    darkMode
                      ? "w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                      : "w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                  }
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
                <div
                  className={
                    darkMode
                      ? "h-px flex-1 bg-white/10"
                      : "h-px flex-1 bg-(--learnai-primary-soft)"
                  }
                />

                <span className="text-xs text-zinc-500">
                  OR
                </span>

                <div
                  className={
                    darkMode
                      ? "h-px flex-1 bg-white/10"
                      : "h-px flex-1 bg-(--learnai-primary-soft)"
                  }
                />
              </div>

              {/* GOOGLE */}

              <button
                type="button"
                className={
                  darkMode
                    ? "w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                    : "w-full rounded-xl border border-(--learnai-primary-soft) bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-(--learnai-primary-soft)"
                }
              >
                Continue with Google
              </button>
            </div>

            {/* SWITCH LOGIN / SIGNUP */}

            <p
              className={
                darkMode
                  ? "mt-6 text-center text-sm text-zinc-500"
                  : "mt-6 text-center text-sm text-zinc-500"
              }
            >
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className={
                  darkMode
                    ? "ml-1 font-medium text-white hover:underline"
                    : "ml-1 font-medium text-black hover:underline"
                }
              >
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
        </main>

        {/* FOOTER */}

        <footer
          className={
            darkMode
              ? "px-6 py-6 text-center text-xs text-zinc-600"
              : "px-6 py-6 text-center text-xs text-zinc-400"
          }
        >
          Learn anything. Understand everything.
        </footer>
      </div>
    </div>
  );
}

/*
 * ============================
 * APP
 * ============================
 */
function TutorPage() {
  const { darkMode } = useTheme();
  const { courseId } = useParams();
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode
        ? "bg-black text-white"
        : "bg-(--learnai-background) text-(--learnai-primary)"
        }`}
    >

      <div className="flex">
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-6 py-8">
            <button
              type="button"
              onClick={() => navigate(`/app/library/${courseId}`)}
              className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${darkMode
                ? "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]"
                : "border-(--learnai-primary-soft) bg-white text-(--learnai-primary) hover:bg-(--learnai-surface)"
                }`}
            >
              ← Back to Course
            </button>

            <Tutor />
          </div>
        </main>
      </div>
    </div>
  );
}
function App() {
  const { user, loading } = useAuth();
  const { darkMode } = useTheme();
  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      <Routes>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/app" element={<Dashboard />} />

          <Route
            path="/app/library/:courseId"
            element={<LibraryDetail />}
          />

          <Route
            path="/app/tutor/:courseId"
            element={<TutorPage />}
          />
          <Route
            path="/app/practice/:courseId"
            element={<Practice />}
          />

          <Route
            path="/app/progress/:courseId"
            element={<LearningJourney />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/app" replace />}
        />

      </Routes>
      <Toaster
        position="top-right"
        theme={darkMode ? "dark" : "light"}
        richColors
        closeButton
      />
    </>
  );
}

export default App;