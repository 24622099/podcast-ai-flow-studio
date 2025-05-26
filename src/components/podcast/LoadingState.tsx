
import React from 'react';
import { Pen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  loadingMessage: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ loadingMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      <div className="relative w-32 h-32">
        {/* Spinning outer circle */}
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin"></div>
        
        {/* Central icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Pen className="h-12 w-12 text-blue-600 animate-pulse" />
        </div>
      </div>
      
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-medium text-gray-800">{loadingMessage}</h3>
        <p className="text-gray-500">
          Please wait while we process your content...
        </p>
      </div>

      {/* Loading placeholder skeletons */}
      <div className="w-full max-w-md space-y-3">
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
      </div>
    </div>
  );
};
