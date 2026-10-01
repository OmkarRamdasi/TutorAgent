import { FileText, LoaderCircle, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import { useTheme } from "../../context/ThemeContext";
import { Skeleton } from "../ui/Skeleton";

export default function UploadCard() {
  const { user } = useAuth();
  const { uploading, uploadCourse } = useCourses();
  const { darkMode } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.warning("Please select a PDF file.");
      e.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.warning("PDF must be smaller than 20 MB.");
      e.target.value = "";
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
      const result = await uploadCourse(user, selectedFile);
      toast.success("PDF processed successfully!", {
        description: `Pages: ${result.pages} • Chunks: ${result.chunks}`,
      });
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong while uploading.");
    }
  };

  return (
    <div
      className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
        darkMode
          ? "border-zinc-700 bg-zinc-900/40 hover:border-zinc-500"
          : "border-zinc-200 bg-white hover:border-black"
      }`}
    >
      <div className={darkMode ? "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white" : "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-black"}>
        <Upload size={22} strokeWidth={1.8} />
      </div>

      <h3 className={darkMode ? "mb-2 text-lg font-semibold text-white" : "mb-2 text-lg font-semibold text-black"}>
        Upload your learning material
      </h3>

      <p className="mb-6 text-sm text-zinc-500">
        Upload a PDF and LearnAI will turn it into an interactive learning experience.
      </p>

      <input
        id="pdf-upload"
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <label
        htmlFor="pdf-upload"
        className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
          darkMode
            ? "bg-white text-black hover:bg-zinc-200"
            : "bg-black text-white hover:bg-zinc-800"
        } ${uploading ? "pointer-events-none opacity-50" : ""}`}
      >
        <FileText size={16} />
        Choose PDF
      </label>

      {selectedFile && !uploading && (
        <div className={darkMode ? "mx-auto mt-6 max-w-md rounded-xl border border-zinc-700 bg-zinc-800 p-4 text-left" : "mx-auto mt-6 max-w-md rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left"}>
          <div className="flex items-center gap-3">
            <FileText size={20} className={darkMode ? "text-zinc-300" : "text-black"} />
            <div className="min-w-0 flex-1">
              <p className={darkMode ? "truncate text-sm font-medium text-white" : "truncate text-sm font-medium text-black"}>
                {selectedFile.name}
              </p>
              <p className="text-xs text-zinc-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="mt-3 text-xs text-zinc-500 transition hover:text-black dark:hover:text-white"
          >
            Remove file
          </button>

          <button
            type="button"
            onClick={() => void handleUpload()}
            className={darkMode ? "mt-4 w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200" : "mt-4 w-full rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"}
          >
            Upload & Start Learning
          </button>
        </div>
      )}

      {uploading && (
        <div className={darkMode ? "mx-auto mt-6 max-w-md rounded-xl border border-white/10 bg-white/[0.02] p-5 text-left" : "mx-auto mt-6 max-w-md rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-left"}>
          <div className="flex items-center gap-3">
            <LoaderCircle className="animate-spin" size={18} />
            <div className="flex-1">
              <p className={darkMode ? "text-sm font-medium text-white" : "text-sm font-medium text-black"}>
                Processing your PDF
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Extracting material and preparing your learning library...
              </p>
            </div>
          </div>
          <Skeleton className="mt-4 h-2 w-full rounded-full" />
          <Skeleton className="mt-2 h-2 w-4/5 rounded-full" />
        </div>
      )}
    </div>
  );
}
