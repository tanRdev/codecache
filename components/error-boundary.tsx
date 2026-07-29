"use client";

import { Component, type ReactNode } from "react";
import { Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="max-w-lg px-4 py-16">
          <div className="surface-card border-l-4 border-l-destructive p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Warning className="size-5" weight="fill" aria-hidden="true" />
              </div>
              <div className="space-y-3">
                <h3 className="text-[16px] leading-6 font-semibold tracking-[-0.01em] text-foreground">
                  Something went wrong
                </h3>
                <p className="text-[13px] leading-6 text-muted-foreground">
                  An unexpected error occurred. Please try again.
                </p>
                {this.state.error ? (
                  <pre className="overflow-auto rounded-lg border border-border-subtle bg-muted px-4 py-3 font-mono text-[12px] leading-5 text-muted-foreground whitespace-pre-wrap break-words">
                    {this.state.error.message}
                  </pre>
                ) : null}
              </div>
            </div>
            <div className="mt-6 flex justify-start">
              <Button variant="outline" onClick={this.handleRetry}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for async operations with error handling
interface AsyncBoundaryProps {
  children: ReactNode;
  error?: string | null;
  onRetry?: () => void;
  isLoading?: boolean;
  loadingFallback?: ReactNode;
}

export function AsyncBoundary({
  children,
  error,
  onRetry,
  isLoading,
  loadingFallback,
}: AsyncBoundaryProps) {
  if (isLoading) {
    return loadingFallback ?? null;
  }

  if (error) {
    return (
      <div className="max-w-lg px-4 py-12">
        <div className="surface-card border-l-4 border-l-destructive p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Warning className="size-5" weight="fill" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[16px] leading-6 font-semibold tracking-[-0.01em] text-foreground">
                Error
              </h3>
              <p className="text-[13px] leading-6 text-muted-foreground">{error}</p>
            </div>
          </div>
          {onRetry ? (
            <div className="mt-6 flex justify-start">
              <Button onClick={onRetry} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
