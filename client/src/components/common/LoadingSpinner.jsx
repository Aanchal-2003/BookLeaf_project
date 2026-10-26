import React from 'react';

export const LoadingSpinner = ({ label = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-charcoal-500">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-parchment-300 border-t-burgundy-700 animate-spin mb-3`}
      ></div>
      {label && <p className="text-sm font-medium text-charcoal-600">{label}</p>}
    </div>
  );
};
