
import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

import { useAuth } from "./AuthContext";

export interface PracticeQuestion {
    id: string;
    course_id: string;
    topic: string;
    concept: string;
    quiz_question: string;
    expected_answer?: string;
    quiz_explanation?: string;
    status: string;
    created_at?: string;
}

export interface PracticeHistoryItem {
    id: string;
    topic: string;
    concept: string;
    quiz_question: string;
    student_answer: string | null;
    evaluation_feedback: string | null;
    is_correct: boolean | null;
    status: string;
    created_at: string;
    answered_at: string | null;
}

interface PracticeContextType {
    practiceQuestion: PracticeQuestion | null;
    practiceHistory: PracticeHistoryItem[];
    practiceLoading: boolean;
    historyLoading: boolean;
    practiceError: string;

    generatePractice: (
        courseId: string
    ) => Promise<PracticeQuestion>;

    fetchPracticeHistory: (
        courseId: string
    ) => Promise<void>;

    loadPracticeQuestion: (
        courseId: string,
        questionId: string
    ) => Promise<PracticeQuestion>;
    clearPractice: () => void;
}

const PracticeContext =
    createContext<PracticeContextType | undefined>(
        undefined
    );

interface PracticeProviderProps {
    children: ReactNode;
}

export function PracticeProvider({
    children,
}: PracticeProviderProps) {
    const { user } = useAuth();

    const [practiceQuestion, setPracticeQuestion] =
        useState<PracticeQuestion | null>(null);

    const [practiceHistory, setPracticeHistory] =
        useState<PracticeHistoryItem[]>([]);

    const [practiceLoading, setPracticeLoading] =
        useState(false);

    const [historyLoading, setHistoryLoading] =
        useState(false);

    const [practiceError, setPracticeError] =
        useState("");

    const fetchPracticeHistory = async (
        courseId: string
    ): Promise<void> => {
        if (!user) {
            throw new Error("Please log in first.");
        }

        setHistoryLoading(true);

        try {
            const token = await user.getIdToken();

            const response = await fetch(
                `http://localhost:8000/practice/${courseId}/history`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Failed to load practice history."
                );
            }

            setPracticeHistory(data.questions ?? []);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to load practice history.";

            setPracticeError(message);
            throw error;
        } finally {
            setHistoryLoading(false);
        }
    };

    const generatePractice = async (
        courseId: string
    ): Promise<PracticeQuestion> => {
        if (!user) {
            throw new Error("Please log in first.");
        }

        setPracticeLoading(true);
        setPracticeError("");

        // Do not clear the current question here.
        // Keep existing history while generating another question.

        try {
            const token = await user.getIdToken();

            const response = await fetch(
                `http://localhost:8000/practice/${courseId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Failed to generate a practice question."
                );
            }

            const newQuestion: PracticeQuestion = data;

            setPracticeQuestion(newQuestion);

            // Immediately add the new question to local history.
            setPracticeHistory((previous) => [
                {
                    id: newQuestion.id,
                    topic: newQuestion.topic,
                    concept: newQuestion.concept,
                    quiz_question: newQuestion.quiz_question,
                    student_answer: null,
                    evaluation_feedback: null,
                    is_correct: null,
                    status: newQuestion.status ?? "pending",
                    created_at:
                        newQuestion.created_at ??
                        new Date().toISOString(),
                    answered_at: null,
                },
                ...previous.filter(
                    (item) => item.id !== newQuestion.id
                ),
            ]);

            return newQuestion;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to generate a practice question.";

            setPracticeError(message);
            throw error;
        } finally {
            setPracticeLoading(false);
        }
    };

    const clearPractice = () => {
        setPracticeQuestion(null);
        setPracticeError("");
        // Keep history; it is loaded from the database.
    };

    const loadPracticeQuestion = async (
        courseId: string,
        questionId: string
    ): Promise<PracticeQuestion> => {
        if (!user) {
            throw new Error("Please log in first.");
        }

        setPracticeError("");

        try {
            const token = await user.getIdToken();

            const response = await fetch(
                `http://localhost:8000/practice/${courseId}/question/${questionId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to load practice question."
                );
            }

            setPracticeQuestion(data);

            return data;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to load practice question.";

            setPracticeError(message);
            throw error;
        }
    };

    return (
        <PracticeContext.Provider
            value={{
                practiceQuestion,
                practiceHistory,
                practiceLoading,
                historyLoading,
                practiceError,
                generatePractice,
                fetchPracticeHistory,
                clearPractice,
                loadPracticeQuestion,
            }}
        >
            {children}
        </PracticeContext.Provider>
    );
}

export function usePractice() {
    const context = useContext(PracticeContext);

    if (!context) {
        throw new Error(
            "usePractice must be used inside PracticeProvider"
        );
    }

    return context;
}
