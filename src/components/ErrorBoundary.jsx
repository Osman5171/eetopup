import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to console to see exactly where it happened
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A] p-6 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Oops! Something went wrong.</h2>
          <p className="text-gray-400 mb-4">We are sorry, but a part of the website crashed.</p>
          <p className="text-sm text-orange-400 mb-6 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20 max-w-lg break-words">
            Error: {this.state.errorMessage}
          </p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="bg-[#8B5CF6] hover:bg-purple-600 text-white px-6 py-2 rounded-xl font-bold transition shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            Go Back to Home
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;