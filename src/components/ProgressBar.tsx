import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showText?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  total, 
  className = '',
  showText = true 
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progression
          </span>
          <span className="text-sm text-gray-500">
            {current}/{total}
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <p className="text-xs text-gray-500 mt-1 text-center">
          {percentage.toFixed(0)}% complété
        </p>
      )}
    </div>
  );
};

export default ProgressBar;