import { Component, ErrorInfo, ReactNode } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { LUNI_POSES } from '../../assets/manifest';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export function isDynamicImportError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: unknown }).message ?? '')
          : '';
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i.test(
    message,
  );
}

export function ErrorRecoveryCard({
  error,
  onReload,
  onReset,
}: {
  error?: unknown;
  onReload: () => void;
  onReset: () => void;
}) {
  const chunkMismatch = isDynamicImportError(error);
  const statusText = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}`.trim() : '';

  return (
    <div className="min-h-dvh bg-[var(--bg)] dark:bg-[#0a0f1d] flex items-center justify-center p-6 text-[var(--text)] dark:text-slate-100">
      <div className="max-w-md w-full bg-[var(--surface)] dark:bg-slate-900 rounded-3xl p-8 border border-[var(--border)] dark:border-slate-700/70 shadow-xl text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative inline-flex items-center justify-center select-none w-24 h-24">
            <img
              src={LUNI_POSES.surprised.url}
              alt="Luni in Surprised pose"
              className="w-full h-full object-contain pixelated pointer-events-none drop-shadow-sm"
            />
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {chunkMismatch ? 'A fresh update is ready!' : 'A cosmic ripple occurred!'}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {chunkMismatch
            ? 'The app was updated while this tab was open. Reload this page to load the latest files—your progress is safely saved.'
            : statusText
              ? `Luni hit a route hiccup (${statusText}) while opening this page. Don't worry, your progress is safely stored in your Luminary records!`
              : "Luni encountered an unexpected hiccup while loading this pathway. Don't worry, your progress is safely stored in your Luminary records!"}
        </p>
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={onReload}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            Retry this page
          </button>
          <button
            type="button"
            onClick={onReset}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            Return to Luminary Hub
          </button>
        </div>
      </div>
    </div>
  );
}

export function RouteErrorFallback() {
  const error = useRouteError();
  return (
    <ErrorRecoveryCard
      error={error}
      onReload={() => window.location.reload()}
      onReset={() => window.location.replace('/')}
    />
  );
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.replace('/');
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorRecoveryCard
          error={this.state.error}
          onReload={this.handleReload}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
