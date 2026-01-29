"use client";

import { Component, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full border border-border rounded-lg p-6 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-foreground">
                Application Error
              </h2>
            </div>
            <p className="text-muted-foreground mb-2">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            {this.state.error?.stack && (
              <details className="mt-4">
                <summary className="text-sm text-muted-foreground cursor-pointer mb-2">
                  Error Details
                </summary>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="mt-6 flex gap-2">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="flex-1"
              >
                Try again
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
