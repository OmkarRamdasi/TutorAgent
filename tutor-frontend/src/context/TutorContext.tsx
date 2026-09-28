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

interface Evaluation {
  correct: boolean;
  feedback: string;
}

interface TutorContextType {
  question: string;
  setQuestion: (question: string) => void;

  tutorResponse: TutorResponse | null;

  askingTutor: boolean;

  askTutor: (
    question: string,
    courseId: string
  ) => Promise<TutorResponse>;

  evaluation: Evaluation | null;

  evaluatingAnswer: boolean;

  evaluateAnswer: (
    studentAnswer: string
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

  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  const [evaluatingAnswer, setEvaluatingAnswer] =
    useState(false);

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
    setEvaluation(null);

    try {
      const token =
        await user.getIdToken();

      const response = await fetch(
        "http://localhost:8000/ask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question,
            course_id: courseId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Tutor request failed."
        );
      }

      setTutorResponse(data);

      return data;
    } finally {
      setAskingTutor(false);
    }
  };

  const evaluateAnswer = async (
    studentAnswer: string
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

    try {
      const token =
        await user.getIdToken();

      const response = await fetch(
        "http://localhost:8000/evaluate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quiz_question:
              tutorResponse.quiz_question,

            expected_answer:
              tutorResponse.expected_answer,

            quiz_explanation:
              tutorResponse.quiz_explanation,

            student_answer:
              studentAnswer,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Answer evaluation failed."
        );
      }

      setEvaluation(data);

      return data;
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  return (
    <TutorContext.Provider
      value={{
        question,
        setQuestion,

        tutorResponse,

        askingTutor,

        askTutor,

        evaluation,

        evaluatingAnswer,

        evaluateAnswer,
      }}
    >
      {children}
    </TutorContext.Provider>
  );
}

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