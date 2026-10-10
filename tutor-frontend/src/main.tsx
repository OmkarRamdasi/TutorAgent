import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CourseProvider } from "./context/CourseContext";
import { TutorProvider } from "./context/TutorContext";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { ProgressProvider } from "./context/ProgressContext.tsx";
import { PracticeProvider } from "./context/PracticeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <CourseProvider>
              <TutorProvider>
                <PracticeProvider>
                  <ProgressProvider>
                    <App />
                  </ProgressProvider>
                </PracticeProvider>

              </TutorProvider>
            </CourseProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
