import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";

import { auth } from "../firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  signup: (
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Listen for Firebase authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const login = async (
    email: string,
    password: string
  ) => {
    setError("");

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch (error: any) {
      console.error("Login failed:", error);

      setError(error.message);

      throw error;
    }
  };

  const signup = async (
    email: string,
    password: string
  ) => {
    setError("");

    try {
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch (error: any) {
      console.error("Signup failed:", error);

      setError(error.message);

      throw error;
    }
  };

  const logout = async () => {
    setError("");

    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout failed:", error);

      setError(error.message);

      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}