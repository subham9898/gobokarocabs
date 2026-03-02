
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-8">
              <i className="fas fa-bug text-4xl"></i>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Something went wrong</h1>
            <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium">
              We encountered an unexpected error. Please try refreshing the page or go back to home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-3 bg-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                <i className="fas fa-sync"></i>
                Refresh Page
              </button>
              <a 
                href="/" 
                className="inline-flex items-center justify-center gap-3 bg-black text-[#A3E635] px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
              >
                <i className="fas fa-home"></i>
                Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
