
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('Dashboard Error:', error);
    console.error('Error Info:', errorInfo);
  }

  handleRetry = (): void => {
    // Reset the error boundary state and try to re-render
    this.setState({
      hasError: false,
      error: null
    });
    window.location.reload();
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {this.state.error?.message || 'An unexpected error occurred while loading the dashboard.'}
              </AlertDescription>
            </Alert>
            
            <p className="text-muted-foreground mb-6">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            
            <Button onClick={this.handleRetry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Loading Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;
