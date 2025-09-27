import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <h3 className="text-red-800 font-semibold">Something went wrong</h3>
          </div>
          <p className="text-red-600 text-sm mb-3">
            The AI Assistant encountered an error. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-3">
              <summary className="text-red-600 text-xs cursor-pointer">Error Details</summary>
              <pre className="text-xs text-red-500 mt-2 p-2 bg-red-100 rounded overflow-auto max-h-32">
                {this.state.error?.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;