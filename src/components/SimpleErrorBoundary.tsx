import { Component } from 'react';

interface Props {
  children: any;
}

interface State {
  hasError: boolean;
  error?: any;
}

class SimpleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('🚨 React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <h2 style={{ color: 'red' }}>React Application Error</h2>
          <p>Something went wrong with the React application.</p>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>
            {this.state.error?.toString() || 'Unknown error'}
          </pre>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SimpleErrorBoundary;
