import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    FileQuestion,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";
import { usePractice } from "../../context/PracticeContext";
import { useProgress } from "../../context/ProgressContext";
import { useTheme } from "../../context/ThemeContext";
import { useTutor } from "../../context/TutorContext";
import { InlineError, Skeleton } from "../ui/Skeleton";

interface PracticeProps {
    embedded?: boolean;
}

export default function Practice({
    embedded = false,
}: PracticeProps) {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const { user } = useAuth();
    const { darkMode } = useTheme();

    const {
        practiceQuestion,
        practiceHistory,
        practiceLoading,
        historyLoading,
        practiceError,
        generatePractice,
        fetchPracticeHistory,
        loadPracticeQuestion,
    } = usePractice();
    const {
        evaluateAnswer,
        evaluatingAnswer,
        evaluation,
        evaluationError,
    } = useTutor();

    const {
        fetchProgress,
    } = useProgress();

    const [studentAnswer, setStudentAnswer] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const practiceSectionRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!courseId || !user) return;

        void fetchPracticeHistory(courseId).catch((error) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to load practice history."
            );
        });
    }, [courseId, user]);

    const cardClass = darkMode
        ? "border-white/10 bg-white/[0.02]"
        : "border-(--learnai-primary-soft) bg-(--learnai-surface) shadow-sm";

    const mutedText = darkMode
        ? "text-zinc-400"
        : "text-zinc-500";

    const buttonClass = darkMode
        ? "flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        : "flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50";

    const inputClass = darkMode
        ? "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white disabled:opacity-60"
        : "w-full rounded-xl border border-(--learnai-primary-soft) bg-(--learnai-bg) px-4 py-3 text-sm text-black outline-none placeholder:text-zinc-400 focus:border-black disabled:opacity-60";

    const handleGeneratePractice = async () => {
        if (!courseId) {
            toast.error("Course not found.");
            return;
        }

        try {
            await generatePractice(courseId);
            setStudentAnswer("");
            setSubmitted(false);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to generate practice question."
            );
        }
    };


    const handleResumePractice = async (questionId: string) => {
        if (!courseId) {
            toast.error("Course not found.");
            return;
        }

        try {
            const question = await loadPracticeQuestion(
                courseId,
                questionId
            );

            // Reset the previous question's UI state.
            setStudentAnswer("");
            setSubmitted(false);

            requestAnimationFrame(() => {
                practiceSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            });

            // Clear evaluation feedback from the previous question.
            // This assumes your TutorContext exposes a clear function;
            // if it doesn't, skip this line for now.
            // clearEvaluation();

            if (question.status === "answered") {
                toast.info("This question has already been answered.");
                return;
            }

            toast.success("Pending question loaded.");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to resume practice."
            );
        }
    };


    const handleSubmitAnswer = async () => {
        if (!studentAnswer.trim()) {
            toast.warning("Please enter your answer.");
            return;
        }

        if (!user || !courseId || !practiceQuestion) {
            toast.error("Practice session is unavailable.");
            return;
        }

        try {
            await evaluateAnswer(
                studentAnswer.trim(),
                courseId,
                {
                    topic: practiceQuestion.topic,
                    concept: practiceQuestion.concept,
                    lesson: "",
                    quiz_question: practiceQuestion.quiz_question,
                    expected_answer: "",
                    quiz_explanation: "",
                },
                practiceQuestion.id
            );

            setSubmitted(true);
            await fetchProgress(user, courseId);
            await fetchPracticeHistory(courseId);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not evaluate your answer."
            );
        }
    };

    return (
        <div
            className={
                embedded
                    ? "w-full min-w-0"
                    : "mx-auto max-w-4xl p-6 md:p-10"
            }
        >
            {!embedded && (<>
                <button
                    type="button"
                    onClick={() =>
                        navigate(`/app/library/${courseId}`)
                    }
                    className={`mb-6 flex items-center gap-2 text-sm font-medium transition ${darkMode
                        ? "text-zinc-300 hover:text-white"
                        : "text-zinc-600 hover:text-black"
                        }`}
                >
                    <ArrowLeft size={16} />
                    Back to Learning Journey
                </button>
                <div className="mb-8 flex items-center gap-3">
                    <div className={`rounded-xl border p-3 ${cardClass}`}>
                        <BookOpen size={22} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold">
                            Practice
                        </h1>
                        <p className={`mt-1 text-sm ${mutedText}`}>
                            Test your understanding of your course material.
                        </p>
                    </div>
                </div>
            </>)}
            <section ref={practiceSectionRef} className={`rounded-2xl border p-6 ${cardClass}`}>
                <button
                    type="button"
                    onClick={() => void handleGeneratePractice()}
                    disabled={practiceLoading || evaluatingAnswer}
                    className={buttonClass}
                >
                    {practiceLoading ? (
                        <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Generating question...
                        </>
                    ) : (
                        <>
                            <RefreshCw size={16} />
                            {practiceQuestion
                                ? "Generate Another Question"
                                : "Generate Practice Question"}
                        </>
                    )}
                </button>

                {practiceError && (
                    <div className="mt-4">
                        <InlineError message={practiceError} />
                    </div>
                )}

                {practiceQuestion && (
                    <div className="mt-6 space-y-5">
                        <div>
                            <p className={`text-xs font-medium uppercase tracking-wider ${mutedText}`}>
                                {practiceQuestion.topic}
                            </p>
                            <h2 className="mt-2 text-lg font-semibold">
                                {practiceQuestion.concept}
                            </h2>
                        </div>

                        <div className={`rounded-xl border p-5 ${darkMode
                            ? "border-zinc-700 bg-zinc-900"
                            : "border-(--learnai-primary-soft) bg-white"
                            }`}>
                            <div className="mb-3 flex items-center gap-2">
                                <FileQuestion size={17} />
                                <h3 className="text-sm font-semibold">
                                    Your question
                                </h3>
                            </div>

                            <p className="text-sm leading-7">
                                {practiceQuestion.quiz_question}
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="practice-answer"
                                className="mb-2 block text-sm font-medium"
                            >
                                Your answer
                            </label>

                            <textarea
                                id="practice-answer"
                                value={studentAnswer}
                                onChange={(event) =>
                                    setStudentAnswer(event.target.value)
                                }
                                rows={5}
                                disabled={submitted || evaluatingAnswer}
                                placeholder="Write your answer here..."
                                className={inputClass}
                            />

                            {!submitted && (
                                <button
                                    type="button"
                                    onClick={() => void handleSubmitAnswer()}
                                    disabled={
                                        evaluatingAnswer || !studentAnswer.trim()
                                    }
                                    className={`${buttonClass} mt-3`}
                                >
                                    {evaluatingAnswer
                                        ? "Checking answer..."
                                        : "Submit Answer"}
                                </button>
                            )}
                        </div>

                        {evaluatingAnswer && (
                            <div className={`space-y-3 rounded-xl border p-4 ${cardClass}`}>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                            </div>
                        )}

                        {evaluationError && !evaluatingAnswer && (
                            <InlineError message={evaluationError} />
                        )}

                        {submitted && evaluation && (
                            <div className={`rounded-xl border p-5 ${cardClass}`}>
                                <div className="flex items-center gap-2 font-semibold">
                                    {evaluation.correct
                                        ? <CheckCircle2 size={18} />
                                        : <FileQuestion size={18} />}
                                    {evaluation.correct
                                        ? "Correct answer"
                                        : "Keep learning"}
                                </div>

                                <p className={`mt-3 text-sm leading-6 ${mutedText}`}>
                                    {evaluation.feedback}
                                </p>

                                <div className={`mt-4 border-t pt-4 ${darkMode ? "border-white/10" : "border-zinc-200"
                                    }`}>
                                    <h4 className="text-sm font-semibold">
                                        Explanation
                                    </h4>
                                    <p className={`mt-2 text-sm leading-6 ${mutedText}`}>
                                        {practiceQuestion.quiz_explanation}
                                    </p>
                                </div>

                                <p className={`mt-4 text-xs ${mutedText}`}>
                                    Learning Journey progress has been refreshed.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => void handleGeneratePractice()}
                                    disabled={practiceLoading}
                                    className={`${buttonClass} mt-5`}
                                >
                                    <RefreshCw size={16} />
                                    Practice Another Question
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {!practiceQuestion && !practiceLoading && !practiceError && (
                    <p className={`mt-5 text-sm ${mutedText}`}>
                        Generate a question to begin your practice session.
                    </p>
                )}
            </section>


            <section className={`mt-8 rounded-2xl border p-6 ${cardClass}`}>
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Practice History
                        </h2>
                        <p className={`mt-1 text-sm ${mutedText}`}>
                            Your previously generated questions and submitted answers.
                        </p>
                    </div>

                    <span className={`text-sm ${mutedText}`}>
                        {practiceHistory.length} questions
                    </span>
                </div>

                {historyLoading && (
                    <p className={`text-sm ${mutedText}`}>
                        Loading practice history...
                    </p>
                )}

                {!historyLoading && practiceHistory.length === 0 && (
                    <p className={`text-sm ${mutedText}`}>
                        No practice questions yet. Generate your first question above.
                    </p>
                )}

                <div className="space-y-4">
                    {practiceHistory.map((item, index) => (

                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                if (item.status === "pending") {
                                    void handleResumePractice(item.id);
                                }
                            }}
                            disabled={item.status !== "pending"}
                            className={`block w-full rounded-xl border p-4 text-left transition ${darkMode
                                ? "border-zinc-700 bg-zinc-900"
                                : "border-zinc-200 bg-white"
                                } ${item.status === "pending"
                                    ? "cursor-pointer hover:border-zinc-500"
                                    : "cursor-default opacity-90"
                                }`}
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className={`text-xs uppercase tracking-wide ${mutedText}`}>
                                    Question {practiceHistory.length - index}
                                </p>

                                <span className="rounded-full border px-3 py-1 text-xs">
                                    {item.status === "answered"
                                        ? item.is_correct
                                            ? "Correct"
                                            : "Reviewed"
                                        : "Pending"}
                                </span>
                            </div>

                            <p className={`mt-3 text-xs ${mutedText}`}>
                                {item.topic} · {item.concept}
                            </p>

                            <p className="mt-2 text-sm leading-6">
                                {item.quiz_question}
                            </p>

                            {item.student_answer && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium">
                                        Your answer
                                    </p>
                                    <p className={`mt-1 whitespace-pre-wrap text-sm ${mutedText}`}>
                                        {item.student_answer}
                                    </p>
                                </div>
                            )}

                            {item.evaluation_feedback && (
                                <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                                    <p className="text-sm font-medium">
                                        Evaluation feedback
                                    </p>
                                    <p className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${mutedText}`}>
                                        {item.evaluation_feedback}
                                    </p>
                                </div>
                            )}

                            <p className={`mt-3 text-xs ${mutedText}`}>
                                {new Date(item.created_at).toLocaleString()}
                            </p>
                        </button>
                    ))}
                </div>
            </section>

        </div>
    );
}