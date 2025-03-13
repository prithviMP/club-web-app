import React from 'react';

const Spinner = ({ size = 'default', color = 'primary' }) => {
  // Size classes
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    default: 'h-8 w-8 border-4',
    large: 'h-12 w-12 border-4',
  };

  // Color classes
  const colorClasses = {
    primary: 'border-primary',
    white: 'border-white',
    gray: 'border-gray-400',
  };

  // Get the appropriate classes based on props
  const spinnerSize = sizeClasses[size] || sizeClasses.default;
  const spinnerColor = colorClasses[color] || colorClasses.primary;

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${spinnerSize} rounded-full border-t-transparent animate-spin ${spinnerColor}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default Spinner; 