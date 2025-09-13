import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export default function ChartCard({ title, children, isLoading = false, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 p-4 sm:p-5 md:p-6 ${className}`}>
      <h3 className="text-gray-700 font-semibold mb-4 text-base sm:text-lg">{title}</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-48 sm:h-56 md:h-64">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-orangeWheel-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="h-48 sm:h-56 md:h-64">
          {children}
        </div>
      )}
    </div>
  );
}
