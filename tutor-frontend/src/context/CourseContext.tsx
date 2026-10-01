import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User } from "firebase/auth";
import { useAuth } from "./AuthContext";

export interface CourseDocument {
  id: string;
  filename: string;
  pages: number | null;
  chunks: number | null;
  status: string;
}

export interface Course {
  id: string;
  title: string;
  created_at: string;
  documents: CourseDocument[];
}

interface CourseContextType {
  courses: Course[];
  loadingCourses: boolean;
  courseError: string;
  uploading: boolean;
  fetchCourses: (user: User) => Promise<Course[]>;
  uploadCourse: (user: User, file: File) => Promise<any>;

  getCourseSummary: (
    user: User,
    courseId: string
  ) => Promise<string>;

  summaryLoading: boolean;
  summaryError: string;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

interface CourseProviderProps {
  children: ReactNode;
}

export function CourseProvider({ children }: CourseProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseError, setCourseError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setCourses([]);
      setCourseError("");
      setLoadingCourses(false);
      return;
    }

    void fetchCourses(user);
  }, [user, authLoading]);

  const fetchCourses = async (currentUser: User): Promise<Course[]> => {
    setLoadingCourses(true);
    setCourseError("");

    try {
      const token = await currentUser.getIdToken();

      const response = await fetch("http://localhost:8000/courses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to fetch courses.");
      }

      const nextCourses = Array.isArray(data) ? data : [];
      setCourses(nextCourses);
      return nextCourses;
    } catch (error) {
      console.error("Failed to load library:", error);
      const message = error instanceof Error ? error.message : "Failed to load your library.";
      setCourseError(message);
      return [];
    } finally {
      setLoadingCourses(false);
    }
  };
  const getCourseSummary = useCallback(
    async (
      currentUser: User,
      courseId: string
    ): Promise<string> => {
      setSummaryLoading(true);
      setSummaryError("");

      try {
        const token = await currentUser.getIdToken();

        const response = await fetch(
          "http://localhost:8000/summary",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              course_id: courseId,
            }),
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.detail || "Failed to generate course summary."
          );
        }

        return data.summary;
      } catch (error) {
        console.error("Failed to generate summary:", error);

        const message =
          error instanceof Error
            ? error.message
            : "Failed to generate course summary.";

        setSummaryError(message);

        throw error;
      } finally {
        setSummaryLoading(false);
      }
    },
    []
  );
  const uploadCourse = async (currentUser: User, file: File) => {
    setUploading(true);
    setCourseError("");

    try {
      const token = await currentUser.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        await fetchCourses(currentUser);
        throw new Error(data?.detail || "Upload failed.");
      }

      await fetchCourses(currentUser);
      return data;
    } finally {
      setUploading(false);
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        loadingCourses,
        courseError,
        uploading,
        fetchCourses,
        uploadCourse,
        getCourseSummary,
        summaryLoading,
        summaryError,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);

  if (!context) {
    throw new Error("useCourses must be used inside CourseProvider");
  }

  return context;
}
