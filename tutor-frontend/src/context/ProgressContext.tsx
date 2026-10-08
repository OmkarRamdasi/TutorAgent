import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { User } from "firebase/auth";


export interface LearningProgress {
  topic: string;
  concept: string;
  attempts: number;
  correct: number;
  incorrect: number;
  mastery: number;
  status: string;
}

interface ProgressContextType {
  progress: LearningProgress[];
  progressLoading: boolean;
  progressError: string;

  fetchProgress: (
    user: User,
    courseId: string
  ) => Promise<LearningProgress[]>;
}

const ProgressContext =
  createContext<ProgressContextType | undefined>(
    undefined
  );

interface ProgressProviderProps {
  children: ReactNode;
}

export function ProgressProvider({
  children,
}: ProgressProviderProps) {


  const [progress, setProgress] = useState<
    LearningProgress[]
  >([]);

  const [progressLoading, setProgressLoading] =
    useState(false);

  const [progressError, setProgressError] =
    useState("");

  const fetchProgress = useCallback(
    async (
      currentUser: User,
      courseId: string
    ): Promise<LearningProgress[]> => {
      setProgressLoading(true);
      setProgressError("");

      try {
        const token =
          await currentUser.getIdToken();

        const response = await fetch(
          `http://localhost:8000/progress/${courseId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Failed to fetch progress."
          );
        }

        const nextProgress =
          Array.isArray(data?.progress)
            ? data.progress
            : [];

        setProgress(nextProgress);

        return nextProgress;
      } catch (error) {
        console.error(
          "Failed to load progress:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "Failed to load progress.";

        setProgressError(message);

        return [];
      } finally {
        setProgressLoading(false);
      }
    },
    []
  );

  return (
    <ProgressContext.Provider
      value={{
        progress,
        progressLoading,
        progressError,
        fetchProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context =
    useContext(ProgressContext);

  if (!context) {
    throw new Error(
      "useProgress must be used inside ProgressProvider"
    );
  }

  return context;
}