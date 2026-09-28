import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import type { User } from "firebase/auth";
import { useAuth } from "./AuthContext";

interface CourseContextType {
    courses: any[];
    uploading: boolean;
    fetchCourses: (user: User) => Promise<any[]>;
    uploadCourse: (
        user: User,
        file: File
    ) => Promise<any>;
}

const CourseContext =
    createContext<CourseContextType | undefined>(
        undefined
    );

interface CourseProviderProps {
    children: ReactNode;
}

export function CourseProvider({
    children,
}: CourseProviderProps) {
    const { user } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user) {
            setCourses([]);
            return;
        }

        fetchCourses(user);
    }, [user]);

    const fetchCourses = async (
        currentUser: User
    ) => {
        try {
            const token =
                await currentUser.getIdToken();

            const response = await fetch(
                "http://localhost:8000/courses",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch courses"
                );
            }

            const data = await response.json();

            console.log(
                "Library courses:",
                data
            );

            setCourses(data);

            return data;
        } catch (error) {
            console.error(
                "Failed to load library:",
                error
            );

            return [];
        }
    };

    const uploadCourse = async (
        currentUser: User,
        file: File
    ) => {
        setUploading(true);

        try {
            const token =
                await currentUser.getIdToken();

            const formData = new FormData();

            formData.append("file", file);

            const response = await fetch(
                "http://localhost:8000/upload",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                // Refresh library even if processing fails
                await fetchCourses(currentUser);

                throw new Error(
                    data.detail || "Upload failed"
                );
            }

            console.log(
                "Upload result:",
                data
            );

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
                uploading,
                fetchCourses,
                uploadCourse,
            }}
        >
            {children}
        </CourseContext.Provider>
    );
}

export function useCourses() {
    const context =
        useContext(CourseContext);

    if (!context) {
        throw new Error(
            "useCourses must be used inside CourseProvider"
        );
    }

    return context;
}