import { Component, ErrorInfo, ReactNode } from 'react';
import { LuniSprite } from '../luni/LuniSprite';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
            <div className="flex justify-center">
              <LuniSprite pose="surprised" size={96} animate />
            </div>
            <h2 className="text-xl font-black text-slate-900">A cosmic ripple occurred!</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Luni encountered an unexpected hiccup while loading this pathway. Don't worry, your progress
              is safely stored in your Luminary records!
            </p>
            <div className="pt-2 space-y-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all active:scale-95"
              >
                Retry this page
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all active:scale-95"
              >
                Return to Luminary Hub
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
