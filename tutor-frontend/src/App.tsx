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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [courses, setCourses] = useState<any[]>([]);

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return true;
  });

  // Firebase authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const token = await currentUser.getIdToken();

        console.log("Firebase UID:", currentUser.uid);
        console.log("Firebase ID token:", token);
        await fetchCourses(currentUser);
      }
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

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a PDF first.");
      return;
    }

    if (!user) {
      alert("Please log in first.");
      return;
    }

    setUploading(true);

    try {
      const token = await user.getIdToken();

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Refresh library even when AI processing fails
        await fetchCourses(user);

        throw new Error(data.detail || "Upload failed");
      }

      console.log("Upload result:", data);

      alert(
        `PDF processed successfully!\n\nPages: ${data.pages}\nChunks: ${data.chunks}`
      );

      setSelectedFile(null);

      await fetchCourses(user);

    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading."
      );

    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };


  const testBackendAuth = async () => {
    if (!user) {
      console.log("No user logged in");
      return;
    }

    try {
      const token = await user.getIdToken();

      const response = await fetch("http://127.0.0.1:8000/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("Backend response:", data);
    } catch (error) {
      console.error("Backend authentication failed:", error);
    }
  };

  const testCourses = async () => {
    if (!user) {
      console.log("No user logged in");
      return;
    }

    try {
      const token = await user.getIdToken();

      const response = await fetch("http://localhost:8000/courses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("Courses:", data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const fetchCourses = async (currentUser: User) => {
    try {
      const token = await currentUser.getIdToken();

      const response = await fetch("http://localhost:8000/courses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();

      console.log("Library courses:", data);

      setCourses(data);

      return data;
    } catch (error) {
      console.error("Failed to load library:", error);
      return [];
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
            : "min-h-screen bg-zinc-50 text-zinc-900 transition-colors duration-300"
        }
      >
        {/* HEADER */}

        <header
          className={
            darkMode
              ? "h-16 border-b border-white/10"
              : "h-16 border-b border-zinc-200 bg-white"
          }
        >
          <div className="flex h-full items-center justify-between px-6">

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

            {/* RIGHT */}

            <div className="flex items-center gap-3">

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={
                  darkMode
                    ? "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/10"
                    : "flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-100"
                }
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              <span
                className={
                  darkMode
                    ? "hidden text-sm text-zinc-400 sm:block"
                    : "hidden text-sm text-zinc-500 sm:block"
                }
              >
                {user.email}
              </span>
              <button
                onClick={testCourses}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"
              >
                Test Courses
              </button>
              <button
                onClick={handleLogout}
                className={
                  darkMode
                    ? "rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
                    : "rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-100"
                }
              >
                Logout
              </button>

            </div>
          </div>
        </header>

        {/* BODY */}

        <div className="flex">

          {/* SIDEBAR */}

          <aside
            className={
              darkMode
                ? "hidden min-h-[calc(100vh-4rem)] w-64 border-r border-white/10 p-4 md:block"
                : "hidden min-h-[calc(100vh-4rem)] w-64 border-r border-zinc-200 bg-white p-4 md:block"
            }
          >

            {/* NEW COURSE */}

            <button
              className={
                darkMode
                  ? "mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black hover:bg-zinc-200"
                  : "mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700"
              }
            >
              + New Course
            </button>

            {/* LIBRARY */}

            <div>
              <p
                className={
                  darkMode
                    ? "mb-3 px-2 text-xs font-medium uppercase tracking-wider text-zinc-500"
                    : "mb-3 px-2 text-xs font-medium uppercase tracking-wider text-zinc-400"
                }
              >
                Your Library
              </p>

              <div className="space-y-1">

                <button
                  className={
                    darkMode
                      ? "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
                      : "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }
                >
                  <span>📄 Your documents</span>

                  {courses.length > 0 && (
                    <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-400">
                      {courses.length}
                    </span>
                  )}
                </button>

              </div>
            </div>

            {/* BOTTOM */}

            <div className="absolute bottom-6 w-56">

              <button
                className={
                  darkMode
                    ? "w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-400 hover:bg-white/5"
                    : "w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100"
                }
              >
                📊 Progress
              </button>

              <button
                className={
                  darkMode
                    ? "w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-400 hover:bg-white/5"
                    : "w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100"
                }
              >
                ⚙ Settings
              </button>

            </div>

          </aside>

          {/* MAIN CONTENT */}

          <main className="flex-1">

            <div className="mx-auto max-w-5xl px-6 py-12">

              {/* GREETING */}

              <div className="mb-10">

                <p
                  className={
                    darkMode
                      ? "text-sm text-zinc-500"
                      : "text-sm text-zinc-500"
                  }
                >
                  Your learning space
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  What do you want to learn?
                </h1>

                <p
                  className={
                    darkMode
                      ? "mt-3 text-zinc-400"
                      : "mt-3 text-zinc-600"
                  }
                >
                  Upload your material and your AI tutor will
                  teach you from it.
                </p>

              </div>

              {/* UPLOAD CARD */}

              <div
                className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${darkMode
                  ? "border-zinc-700 bg-zinc-900/40 hover:border-zinc-500"
                  : "border-zinc-300 bg-zinc-50 hover:border-zinc-400"
                  }`}
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                  📄
                </div>

                <h3
                  className={`mb-2 text-lg font-semibold ${darkMode ? "text-white" : "text-zinc-900"
                    }`}
                >
                  Upload your learning material
                </h3>

                <p
                  className={`mb-6 text-sm ${darkMode ? "text-zinc-400" : "text-zinc-500"
                    }`}
                >
                  Upload a PDF and LearnAI will turn it into an interactive learning experience.
                </p>

                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    if (file.type !== "application/pdf") {
                      alert("Please select a PDF file.");
                      return;
                    }

                    const maxSize = 20 * 1024 * 1024;

                    if (file.size > maxSize) {
                      alert("PDF must be smaller than 20 MB.");
                      return;
                    }

                    setSelectedFile(file);
                  }}
                />

                <label
                  htmlFor="pdf-upload"
                  className="inline-flex cursor-pointer items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  Choose PDF
                </label>

                {selectedFile && (
                  <div
                    className={`mx-auto mt-6 max-w-md rounded-xl border p-4 text-left ${darkMode
                      ? "border-zinc-700 bg-zinc-800"
                      : "border-zinc-200 bg-white"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📄</div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${darkMode ? "text-white" : "text-zinc-900"
                            }`}
                        >
                          {selectedFile.name}
                        </p>

                        <p
                          className={`text-xs ${darkMode ? "text-zinc-400" : "text-zinc-500"
                            }`}
                        >
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedFile(null)}
                      className="mt-3 text-xs text-red-500 hover:text-red-400"
                    >
                      Remove file
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="mt-4 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploading ? "Uploading & processing..." : "Upload & Start Learning"}
                    </button>
                  </div>
                )}
              </div>

              {/* LIBRARY */}

              {courses.length > 0 && (
                <div className="mt-10">

                  <h2
                    className={
                      darkMode
                        ? "mb-4 text-sm font-medium text-zinc-300"
                        : "mb-4 text-sm font-medium text-zinc-700"
                    }
                  >
                    Your Library
                  </h2>

                  <div className="grid gap-4 sm:grid-cols-2">

                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className={
                          darkMode
                            ? "rounded-xl border border-white/10 bg-white/[0.02] p-5"
                            : "rounded-xl border border-zinc-200 bg-white p-5"
                        }
                      >

                        <div className="mb-4 flex items-start gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                            📚
                          </div>

                          <div className="min-w-0 flex-1">

                            <h3 className="truncate text-sm font-medium">
                              {course.title}
                            </h3>

                            <p
                              className={
                                darkMode
                                  ? "mt-1 text-xs text-zinc-500"
                                  : "mt-1 text-xs text-zinc-500"
                              }
                            >
                              {course.documents?.length || 0} document
                              {course.documents?.length === 1 ? "" : "s"}
                            </p>

                          </div>

                        </div>

                        {course.documents?.map((document: any) => (
                          <div
                            key={document.id}
                            className={
                              darkMode
                                ? "rounded-lg bg-white/5 px-3 py-2 text-xs"
                                : "rounded-lg bg-zinc-50 px-3 py-2 text-xs"
                            }
                          >

                            <div className="flex items-center justify-between">

                              <span className="truncate">
                                📄 {document.filename}
                              </span>

                              <span className="ml-3 shrink-0 text-zinc-500">
                                {document.status}
                              </span>

                            </div>

                          </div>
                        ))}

                      </div>
                    ))}

                  </div>

                </div>
              )}
              {/* QUICK ACTIONS */}

              <div className="mt-10">

                <h2
                  className={
                    darkMode
                      ? "mb-4 text-sm font-medium text-zinc-300"
                      : "mb-4 text-sm font-medium text-zinc-700"
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
                          : "rounded-xl border border-zinc-200 bg-white p-5 text-left transition hover:bg-zinc-50"
                      }
                    >

                      <div className="mb-4 text-lg">
                        {item.icon}
                      </div>

                      <h3 className="text-sm font-medium">
                        {item.title}
                      </h3>

                      <p
                        className={
                          darkMode
                            ? "mt-1 text-xs text-zinc-500"
                            : "mt-1 text-xs text-zinc-500"
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