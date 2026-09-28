import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import { useTheme } from "../../context/ThemeContext";

export default function UploadCard() {
  const { user } = useAuth();
  const { uploading, uploadCourse } = useCourses();
  const { darkMode } = useTheme();

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.warning("Please select a PDF file.");
      return;
    }

    const maxSize = 20 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.warning("PDF must be smaller than 20 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning("Please select a PDF first.");
      return;
    }

    if (!user) {
      toast.error("Please log in first.");
      return;
    }

    try {
      const result = await uploadCourse(
        user,
        selectedFile
      );

      toast.success(
        "PDF processed successfully!",
        {
          description: `Pages: ${result.pages} • Chunks: ${result.chunks}`,
        }
      );

      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading."
      );
    }
  };

  return (
    <div
      className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
        darkMode
          ? "border-zinc-700 bg-zinc-900/40 hover:border-zinc-500"
          : "border-[var(--learnai-primary-soft)] bg-[var(--learnai-surface)] hover:border-[var(--learnai-primary)]"
      }`}
    >
      {/* ICON */}

      <div
        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
          darkMode
            ? "bg-indigo-500/10"
            : "bg-[var(--learnai-primary-soft)]"
        }`}
      >
        📄
      </div>

      {/* TITLE */}

      <h3
        className={`mb-2 text-lg font-semibold ${
          darkMode
            ? "text-white"
            : "text-[var(--learnai-primary)]"
        }`}
      >
        Upload your learning material
      </h3>

      {/* DESCRIPTION */}

      <p
        className={`mb-6 text-sm ${
          darkMode
            ? "text-zinc-400"
            : "text-[var(--learnai-primary)]/65"
        }`}
      >
        Upload a PDF and LearnAI will turn it
        into an interactive learning experience.
      </p>

      {/* FILE INPUT */}

      <input
        id="pdf-upload"
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* CHOOSE PDF */}

      <label
        htmlFor="pdf-upload"
        className={`inline-flex cursor-pointer items-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
          darkMode
            ? "bg-indigo-600 hover:bg-indigo-500"
            : "bg-[var(--learnai-accent)] hover:opacity-90"
        }`}
      >
        Choose PDF
      </label>

      {/* SELECTED FILE */}

      {selectedFile && (
        <div
          className={`mx-auto mt-6 max-w-md rounded-xl border p-4 text-left ${
            darkMode
              ? "border-zinc-700 bg-zinc-800"
              : "border-[var(--learnai-primary-soft)] bg-[var(--learnai-primary-soft)]"
          }`}
        >
          <div className="flex items-center gap-3">

            <div className="text-2xl">
              📄
            </div>

            <div className="min-w-0 flex-1">

              <p
                className={`truncate text-sm font-medium ${
                  darkMode
                    ? "text-white"
                    : "text-[var(--learnai-primary)]"
                }`}
              >
                {selectedFile.name}
              </p>

              <p
                className={`text-xs ${
                  darkMode
                    ? "text-zinc-400"
                    : "text-[var(--learnai-primary)]/60"
                }`}
              >
                {(
                  selectedFile.size /
                  (1024 * 1024)
                ).toFixed(2)}{" "}
                MB
              </p>

            </div>
          </div>

          {/* REMOVE */}

          <button
            type="button"
            onClick={() =>
              setSelectedFile(null)
            }
            className="mt-3 text-xs text-red-500 transition hover:text-red-400"
          >
            Remove file
          </button>

          {/* UPLOAD */}

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className={`mt-4 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
              darkMode
                ? "bg-indigo-600 hover:bg-indigo-500"
                : "bg-[var(--learnai-accent)] hover:opacity-90"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {uploading
              ? "Uploading & processing..."
              : "Upload & Start Learning"}
          </button>

        </div>
      )}
    </div>
  );
}