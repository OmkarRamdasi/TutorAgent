import type { ReactNode } from "react";
import { useTheme } from "../../context/ThemeContext";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  const { darkMode } = useTheme();

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg ${
        darkMode ? "bg-white/10" : "bg-zinc-200"
      } ${className}`}
    />
  );
}

export function AppLoadingSkeleton() {
  const { darkMode } = useTheme();

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-zinc-950 text-white"
          : "min-h-screen bg-(--learnai-bg) text-black"
      }
    >
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col">
        <header
          className={
            darkMode
              ? "h-16 border-b border-white/10"
              : "h-16 border-b border-(--learnai-primary-soft) bg-white"
          }
        >
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-28 hidden sm:block" />
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          <aside
            className={
              darkMode
                ? "hidden w-64 border-r border-white/10 p-4 md:block"
                : "hidden w-64 border-r border-(--learnai-primary-soft) bg-(--learnai-bg) p-4 md:block"
            }
          >
            <Skeleton className="mb-8 h-11 w-full rounded-xl" />
            <Skeleton className="mb-4 h-3 w-24" />
            <Skeleton className="mb-2 h-9 w-full" />
            <Skeleton className="mb-2 h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </aside>

          <main className="flex-1">
            <div className="mx-auto max-w-5xl px-6 py-12">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-3 h-10 w-80 max-w-full" />
              <Skeleton className="mt-3 h-5 w-96 max-w-full" />

              <div className="mt-10 space-y-5">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-44 w-full rounded-2xl" />
                  <Skeleton className="h-44 w-full rounded-2xl" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function CourseLibrarySkeleton() {
  return (
    <div className="mt-10">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-2 h-3 w-52" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.02]"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-2 h-3 w-20" />
              </div>
            </div>
            <Skeleton className="mt-5 h-3 w-24" />
            <Skeleton className="mt-2 h-10 w-full rounded-lg" />
            <Skeleton className="mt-5 h-px w-full" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <Skeleton className="h-3 w-28" />
                <Skeleton className="mt-2 h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LibraryDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-6 h-9 w-72 max-w-full" />
      <Skeleton className="mt-3 h-4 w-48" />

      <div className="mt-10 space-y-5">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.02]"
          >
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="mt-2 h-5 w-36" />
                <Skeleton className="mt-3 h-4 w-full max-w-xl" />
                <Skeleton className="mt-2 h-4 w-4/5 max-w-lg" />
                <Skeleton className="mt-5 h-10 w-32 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TutorSkeleton() {
  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-2 h-3 w-56" />
        </div>
      </div>
      <Skeleton className="mt-5 h-12 w-full rounded-xl" />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function InlineError({
  title = "Something went wrong",
  message = "We couldn't load this section. Please try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  const { darkMode } = useTheme();

  return (
    <div
      role="alert"
      className={
        darkMode
          ? "rounded-2xl border border-white/10 bg-white/[0.02] p-6"
          : "rounded-2xl border border-zinc-200 bg-white p-6"
      }
    >
      <h3 className={darkMode ? "text-sm font-semibold text-white" : "text-sm font-semibold text-black"}>
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={
            darkMode
              ? "mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
              : "mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          }
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: ReactNode;
}) {
  const { darkMode } = useTheme();

  return (
    <div
      className={
        darkMode
          ? "rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center"
          : "rounded-2xl border border-zinc-200 bg-white p-8 text-center"
      }
    >
      <h3 className={darkMode ? "text-sm font-semibold text-white" : "text-sm font-semibold text-black"}>
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">{message}</p>
      {children}
    </div>
  );
}
