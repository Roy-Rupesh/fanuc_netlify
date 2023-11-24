import React, { Component } from "react";
import Error from "./Error"; // Import your Error component

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false
  };

  // This lifecycle method will catch errors that occur during rendering
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update the state so that the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error or send it to a logging service here
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <Error />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
