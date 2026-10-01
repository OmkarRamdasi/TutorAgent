import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || "Unexpected application error.",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("LearnAI render error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-6 text-black dark:bg-zinc-950 dark:text-white">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-black dark:bg-white/10 dark:text-white">
            !
          </div>
          <h1 className="mt-5 text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            LearnAI couldn't render this screen. Your learning data has not been deleted.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Try again
          </button>
          {import.meta.env.DEV && this.state.message && (
            <p className="mt-4 break-words text-left text-xs text-zinc-400">
              {this.state.message}
            </p>
          )}
        </div>
      </div>
    );
  }
}
