'use client';

import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 bg-linear-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center z-50'
    : 'flex items-center justify-center p-6';

  return (
    <div className={containerClass}>
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <Loader className="w-16 h-16 text-orange-500 animate-spin" />
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-orange-400/20 to-amber-400/20 animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-semibold text-gray-700">{message}</p>
        <div className="flex gap-1 justify-center">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
