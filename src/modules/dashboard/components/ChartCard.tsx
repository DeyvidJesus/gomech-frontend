import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export default function ChartCard({ title, children, isLoading = false, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm ${className}`}>
      <h3 className="text-gray-700 text-lg font-semibold mb-4">{title}</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="h-64">
          {children}
        </div>
      )}
    </div>
  );
}
