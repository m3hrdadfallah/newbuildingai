import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6 text-center" dir="rtl">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-red-100">
             <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8" />
             </div>
             <h1 className="text-2xl font-bold text-gray-800 mb-2">متاسفانه خطایی رخ داده است</h1>
             <p className="text-gray-500 mb-6">برنامه با مشکل مواجه شد. لطفاً صفحه را مجدداً بارگذاری کنید.</p>
             
             {this.state.error && (
                <div className="bg-gray-50 p-4 rounded-lg text-left text-xs text-red-600 font-mono mb-6 overflow-auto max-h-40 border border-gray-200">
                   {this.state.error.message}
                </div>
             )}

             <button
               onClick={() => window.location.reload()}
               className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-200"
             >
               <RefreshCw className="w-5 h-5" />
               تلاش مجدد (Reload)
             </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}