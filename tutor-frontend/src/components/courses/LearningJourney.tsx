
import { useEffect } from "react";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import { useProgress } from "../../context/ProgressContext";
import { useTheme } from "../../context/ThemeContext";
import { InlineError } from "../ui/Skeleton";

export default function LearningJourney() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { courses, loadingCourses } = useCourses();
    const { darkMode } = useTheme();

    const {
        progress,
        progressLoading,
        progressError,
        fetchProgress,
    } = useProgress();

    useEffect(() => {
        if (!user || !courseId) return;
        void fetchProgress(user, courseId);
    }, [user, courseId, fetchProgress]);

    const course = courses.find(
        (item) => item.id === courseId
    );

    const averageMastery =
        progress.length > 0
            ? Math.round(
                progress.reduce(
                    (total, item) => total + item.mastery,
                    0
                ) / progress.length
            )
            : 0;

    const totalAttempts = progress.reduce(
        (total, item) => total + item.attempts,
        0
    );

    const surface = darkMode
        ? "border-white/10 bg-white/[0.02]"
        : "border-(--learnai-primary-soft) bg-(--learnai-surface)";

    const muted = darkMode
        ? "text-sm text-zinc-400"
        : "text-sm text-zinc-500";

    return (
        <div
            className={
                darkMode
                    ? "min-h-screen w-full bg-zinc-950 px-4 py-10 text-white transition-colors duration-300 sm:px-6 lg:px-10"
                    : "min-h-screen w-full bg-(--learnai-bg) px-4 py-10 text-(--learnai-primary) transition-colors duration-300 sm:px-6 lg:px-10"
            }
        >
            <main className="mx-auto max-w-5xl">
                <button
                    type="button"
                    onClick={() =>
                        navigate(`/app/library/${courseId}`)
                    }
                    className={`mb-6 flex items-center gap-2 text-sm transition ${darkMode
                        ? "text-zinc-400 hover:text-white"
                        : "text-zinc-500 hover:text-black"
                        }`}
                >
                    <ArrowLeft size={16} />
                    Back to Material
                </button>

                <div className="mb-8 flex items-center gap-3">
                    <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${surface}`}
                    >
                        <GraduationCap size={22} strokeWidth={1.7} />
                    </div>

                    <div className="min-w-0">
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Learning Journey
                        </h1>

                        <p className={`mt-1 ${muted}`}>
                            {course?.title ?? "Your course"} · Track your learning progress.
                        </p>
                    </div>
                </div>

                {loadingCourses ? (
                    <p className={muted}>Loading course...</p>
                ) : !course ? (
                    <div className={`rounded-2xl border p-6 ${surface}`}>
                        <h2 className="font-medium">Course not found</h2>
                        <p className={`mt-2 ${muted}`}>
                            This course may no longer exist or may be unavailable.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/app")}
                            className={`mt-5 rounded-xl px-4 py-2.5 text-sm font-medium ${darkMode
                                ? "bg-white text-black hover:bg-zinc-200"
                                : "bg-black text-white hover:bg-zinc-800"
                                }`}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                ) : progressLoading ? (
                    <div className={`rounded-2xl border p-6 ${surface}`}>
                        <p className={muted}>Loading learning progress...</p>
                        <div
                            className={`mt-4 h-2 animate-pulse rounded-full ${darkMode ? "bg-zinc-800" : "bg-zinc-200"
                                }`}
                        />
                    </div>
                ) : progressError ? (
                    <div className="space-y-4">
                        <InlineError message={progressError} />

                        <button
                            type="button"
                            onClick={() => {
                                if (user && courseId) {
                                    void fetchProgress(user, courseId);
                                }
                            }}
                            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${darkMode
                                ? "border-white/10 hover:bg-white/5"
                                : "border-zinc-200 hover:bg-zinc-100"
                                }`}
                        >
                            Retry
                        </button>
                    </div>
                ) : progress.length === 0 ? (
                    <div className={`rounded-2xl border p-6 ${surface}`}>
                        <h2 className="font-medium">
                            Your learning journey hasn't started yet.
                        </h2>

                        <p className={`mt-2 ${muted}`}>
                            Start practicing with the AI Tutor to build your progress.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(`/app/tutor/${courseId}`)
                            }
                            className={`mt-5 rounded-xl px-4 py-2.5 text-sm font-medium transition ${darkMode
                                ? "bg-white text-black hover:bg-zinc-200"
                                : "bg-black text-white hover:bg-zinc-800"
                                }`}
                        >
                            Open AI Tutor
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                {
                                    label: "Average mastery",
                                    value: `${averageMastery}%`,
                                },
                                {
                                    label: "Concepts practiced",
                                    value: String(progress.length),
                                },
                                {
                                    label: "Total attempts",
                                    value: String(totalAttempts),
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className={`rounded-2xl border p-5 ${surface}`}
                                >
                                    <p className={muted}>{stat.label}</p>

                                    <p className="mt-3 text-3xl font-semibold">
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <section
                            className={`mt-6 rounded-2xl border p-5 sm:p-6 ${surface}`}
                        >
                            <h2 className="text-lg font-semibold">
                                Concept progress
                            </h2>

                            <p className={`mt-1 ${muted}`}>
                                Review your mastery and practice results for each concept.
                            </p>

                            <div className="mt-5 space-y-4">
                                {progress.map((item) => {
                                    const mastery = Math.min(
                                        100,
                                        Math.max(0, item.mastery)
                                    );

                                    return (
                                        <div
                                            key={`${item.topic}-${item.concept}`}
                                            className={`rounded-xl border p-4 ${darkMode
                                                ? "border-white/10"
                                                : "border-(--learnai-primary-soft)"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <p className={muted}>
                                                        {item.topic}
                                                    </p>

                                                    <h3 className="mt-1 text-sm font-medium">
                                                        {item.concept}
                                                    </h3>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <p className="font-semibold">
                                                        {mastery}%
                                                    </p>

                                                    <p
                                                        className={`mt-1 text-xs capitalize ${darkMode
                                                            ? "text-zinc-400"
                                                            : "text-zinc-500"
                                                            }`}
                                                    >
                                                        {item.status}
                                                    </p>
                                                </div>
                                            </div>

                                            <div
                                                className={`mt-4 h-2 overflow-hidden rounded-full ${darkMode
                                                    ? "bg-zinc-800"
                                                    : "bg-zinc-200"
                                                    }`}
                                            >
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${darkMode ? "bg-white" : "bg-black"
                                                        }`}
                                                    style={{ width: `${mastery}%` }}
                                                />
                                            </div>

                                            <div
                                                className={`mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs ${darkMode
                                                    ? "text-zinc-400"
                                                    : "text-zinc-500"
                                                    }`}
                                            >
                                                <span>{item.attempts} attempts</span>
                                                <span>{item.correct} correct</span>
                                                <span>{item.incorrect} incorrect</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
