import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CourseProvider } from "./context/CourseContext";
import { TutorProvider } from "./context/TutorContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <CourseProvider>
          <TutorProvider>
            <App />
          </TutorProvider>
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)
