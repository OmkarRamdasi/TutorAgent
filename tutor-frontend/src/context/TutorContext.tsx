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
    courseId: string
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
    courseId: string
  ): Promise<Evaluation> => {

    if (!user) {

      throw new Error(
        "Please log in first."
      );
    }

    if (!tutorResponse) {

      throw new Error(
        "No quiz question available."
      );
    }

    setEvaluatingAnswer(true);
    setEvaluationError("");

    try {

      const token =
        await user.getIdToken();

      const response = await fetch(
        "http://localhost:8000/evaluate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({

            // -----------------------------------------
            // Course
            // -----------------------------------------

            course_id: courseId,

            // -----------------------------------------
            // Learning context
            // -----------------------------------------

            topic:
              tutorResponse.topic,

            concept:
              tutorResponse.concept,

            // -----------------------------------------
            // Quiz
            // -----------------------------------------

            quiz_question:
              tutorResponse.quiz_question,

            expected_answer:
              tutorResponse.expected_answer,

            quiz_explanation:
              tutorResponse.quiz_explanation,

            // -----------------------------------------
            // Student answer
            // -----------------------------------------

            student_answer:
              studentAnswer,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Answer evaluation failed."
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