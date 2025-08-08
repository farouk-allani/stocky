import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: any;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // Optionally log to monitoring
    console.error("UI ErrorBoundary caught error", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md">
            An unexpected error occurred in the UI. Please refresh the page or
            navigate back to the home page.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded bg-primary text-primary-foreground"
            >
              Refresh
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-4 py-2 rounded border"
            >
              Home
            </button>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="text-left text-xs bg-muted p-4 rounded max-h-64 overflow-auto w-full max-w-xl">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
