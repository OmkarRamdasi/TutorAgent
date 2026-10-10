import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "./AuthContext";

interface TutorResponse {
  topic: string;
  concept: string;
  lesson: string;
  quiz_question: string;
  expected_answer: string;
  quiz_explanation: string;
}

interface EvaluationProgress {
  topic: string;
  concept: string;
  attempts: number;
  correct: number;
  incorrect: number;
  mastery: number;
  status: string;
}

interface Evaluation {
  correct: boolean;
  feedback: string;
  progress?: EvaluationProgress;
}

interface TutorContextType {
  question: string;
  setQuestion: (question: string) => void;

  tutorResponse: TutorResponse | null;

  askingTutor: boolean;
  tutorError: string;

  askTutor: (
    question: string,
    courseId: string
  ) => Promise<TutorResponse>;

  evaluation: Evaluation | null;

  evaluatingAnswer: boolean;
  evaluationError: string;

  evaluateAnswer: (
    studentAnswer: string,
    courseId: string,
    questionOverride?: TutorResponse,
    practiceQuestionId?: string
  ) => Promise<Evaluation>;
}

const TutorContext =
  createContext<TutorContextType | undefined>(
    undefined
  );

interface TutorProviderProps {
  children: ReactNode;
}

export function TutorProvider({
  children,
}: TutorProviderProps) {
  const { user } = useAuth();

  const [question, setQuestion] =
    useState("");

  const [tutorResponse, setTutorResponse] =
    useState<TutorResponse | null>(null);

  const [askingTutor, setAskingTutor] =
    useState(false);

  const [tutorError, setTutorError] =
    useState("");

  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  const [evaluatingAnswer, setEvaluatingAnswer] =
    useState(false);

  const [evaluationError, setEvaluationError] =
    useState("");

  // ============================================================
  // ASK TUTOR
  // ============================================================

  const askTutor = async (
    question: string,
    courseId: string
  ): Promise<TutorResponse> => {

    if (!user) {
      throw new Error(
        "Please log in first."
      );
    }

    setAskingTutor(true);
    setTutorError("");
    setEvaluation(null);
    setEvaluationError("");

    try {

      const token =
        await user.getIdToken();

      const response = await fetch(
        "http://localhost:8000/ask",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            question,

            course_id: courseId,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Tutor request failed."
        );
      }

      setTutorResponse(data);

      return data;

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : "Tutor request failed.";

      setTutorError(message);

      throw error;

    } finally {

      setAskingTutor(false);
    }
  };

  // ============================================================
  // EVALUATE ANSWER
  // ============================================================

  const evaluateAnswer = async (
    studentAnswer: string,
    courseId: string,
    questionOverride?: TutorResponse,
    practiceQuestionId?: string
  ): Promise<Evaluation> => {
    if (!user) {
      throw new Error("Please log in first.");
    }

    const activeQuestion = questionOverride ?? tutorResponse;

    if (!activeQuestion) {
      throw new Error("No quiz question available.");
    }

    setEvaluatingAnswer(true);
    setEvaluationError("");

    try {
      const token = await user.getIdToken();

      const isPracticeQuestion = Boolean(
        practiceQuestionId?.trim()
      );

      const payload = {
        course_id: courseId,
        topic: activeQuestion.topic,
        concept: activeQuestion.concept,
        quiz_question: activeQuestion.quiz_question,
        student_answer: studentAnswer.trim(),

        // Practice answers are loaded securely by the backend.
        ...(isPracticeQuestion
          ? {
            practice_question_id: practiceQuestionId,
          }
          : {
            expected_answer: activeQuestion.expected_answer,
            quiz_explanation: activeQuestion.quiz_explanation,
          }),
      };

      console.log("Evaluation request:", {
        course_id: payload.course_id,
        practice_question_id:
          "practice_question_id" in payload
            ? payload.practice_question_id
            : null,
        isPracticeQuestion,
      });

      const response = await fetch(
        "http://localhost:8000/evaluate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Answer evaluation failed."
        );
      }

      setEvaluation(data);

      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Answer evaluation failed.";

      setEvaluationError(message);

      throw error;
    } finally {
      setEvaluatingAnswer(false);
    }
  };


  // ============================================================
  // CONTEXT
  // ============================================================

  return (
    <TutorContext.Provider
      value={{

        question,

        setQuestion,

        tutorResponse,

        askingTutor,

        tutorError,

        askTutor,

        evaluation,

        evaluatingAnswer,

        evaluationError,

        evaluateAnswer,

      }}
    >
      {children}
    </TutorContext.Provider>
  );
}


// ============================================================
// useTutor
// ============================================================

export function useTutor() {

  const context =
    useContext(TutorContext);

  if (!context) {

    throw new Error(
      "useTutor must be used inside TutorProvider"
    );
  }

  return context;
}