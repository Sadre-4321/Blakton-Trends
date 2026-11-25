import React from 'react';

const LoadingSpinner = ({ size = 'lg', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className={`${sizeClasses[size]} spinner`} />
      <p className="text-gray-600 font-semibold">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
