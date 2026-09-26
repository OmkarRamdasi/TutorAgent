import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";

import { auth } from "./firebase";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return true;
  });

  // Firebase authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem(
      "theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
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
            : "min-h-screen bg-white text-zinc-900 transition-colors duration-300"
        }
      >
        {/* HEADER */}

        <header
          className={
            darkMode
              ? "border-b border-white/10"
              : "border-b border-zinc-200"
          }
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

            {/* LOGO */}

            <div className="flex items-center gap-2">
              <div
                className={
                  darkMode
                    ? "flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black"
                    : "flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white"
                }
              >
                ✦
              </div>

              <span className="font-semibold">
                LearnAI
              </span>
            </div>

            {/* RIGHT SIDE */}

            <div className="flex items-center gap-3">

              {/* THEME BUTTON */}

              <button
                onClick={() => setDarkMode(!darkMode)}
                title={
                  darkMode
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                className={
                  darkMode
                    ? "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-300 transition hover:bg-white/10"
                    : "flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100"
                }
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              {/* USER EMAIL */}

              <span
                className={
                  darkMode
                    ? "hidden text-sm text-zinc-400 sm:block"
                    : "hidden text-sm text-zinc-500 sm:block"
                }
              >
                {user.email}
              </span>

              {/* LOGOUT */}

              <button
                onClick={handleLogout}
                className={
                  darkMode
                    ? "rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
                    : "rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100"
                }
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* MAIN */}

        <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center px-6">

          <div className="w-full max-w-3xl text-center">

            {/* ICON */}

            <div
              className={
                darkMode
                  ? "mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl"
                  : "mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-xl"
              }
            >
              ✦
            </div>

            {/* TITLE */}

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              What do you want to learn?
            </h1>

            {/* DESCRIPTION */}

            <p
              className={
                darkMode
                  ? "mx-auto mt-4 max-w-xl text-zinc-400"
                  : "mx-auto mt-4 max-w-xl text-zinc-600"
              }
            >
              Upload your learning material and let your AI tutor
              explain, teach, quiz, and help you practice.
            </p>

            {/* INPUT / UPLOAD CARD */}

            <div
              className={
                darkMode
                  ? "mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left shadow-2xl"
                  : "mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left shadow-lg"
              }
            >
              <div className="flex min-h-32 flex-col justify-between">

                <p
                  className={
                    darkMode
                      ? "px-2 text-sm text-zinc-500"
                      : "px-2 text-sm text-zinc-500"
                  }
                >
                  Upload a document or ask anything...
                </p>

                <div className="mt-8 flex items-center justify-between">

                  {/* UPLOAD */}

                  <button
                    className={
                      darkMode
                        ? "rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
                        : "rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 transition hover:bg-white"
                    }
                  >
                    + Upload
                  </button>

                  {/* SEND */}

                  <button
                    className={
                      darkMode
                        ? "flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:bg-zinc-200"
                        : "flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-zinc-700"
                    }
                  >
                    ↑
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}

            <div className="mt-6 flex flex-wrap justify-center gap-3">

              {[
                "Explain something",
                "Practice",
                "Take a quiz",
              ].map((item) => (
                <button
                  key={item}
                  className={
                    darkMode
                      ? "rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/10 hover:text-white"
                      : "rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                  }
                >
                  {item}
                </button>
              ))}

            </div>

          </div>
        </main>
      </div>
    );
  }

  /*
   * ============================
   * LOGIN / SIGN UP
   * ============================
   */

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col">

        {/* HEADER */}

        <header className="flex h-16 items-center justify-between px-6">

          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
              ✦
            </div>

            <span className="font-semibold">
              LearnAI
            </span>

          </div>

          <span className="text-sm text-zinc-500">
            Your personal AI tutor
          </span>

        </header>

        {/* MAIN */}

        <main className="flex flex-1 items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            <div className="mb-8 text-center">

              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                ✦
              </div>

              <h1 className="text-3xl font-semibold tracking-tight">
                {isLogin
                  ? "Welcome back"
                  : "Start learning"}
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {isLogin
                  ? "Continue learning with your personal AI tutor."
                  : "Create your account and learn anything with AI."}
              </p>

            </div>

            {/* AUTH CARD */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm text-zinc-300">
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
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-white/30"
                  />

                </div>

                {/* PASSWORD */}

                <div>

                  <label className="mb-2 block text-sm text-zinc-300">
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
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-white/30"
                  />

                </div>

                {/* ERROR */}

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-xs text-zinc-600">
                  OR
                </span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* GOOGLE */}

              <button
                type="button"
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/5"
              >
                Continue with Google
              </button>

            </div>

            {/* SWITCH LOGIN / SIGNUP */}

            <p className="mt-6 text-center text-sm text-zinc-500">

              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="ml-1 text-zinc-200 hover:underline"
              >
                {isLogin
                  ? "Create one"
                  : "Sign in"}
              </button>

            </p>

          </div>
        </main>

        {/* FOOTER */}

        <footer className="px-6 py-6 text-center text-xs text-zinc-600">
          Learn anything. Understand everything.
        </footer>

      </div>
    </div>
  );
}

export default App;