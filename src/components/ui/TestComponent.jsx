import React from 'react';

const TestComponent = () => {
  return (
    <div className="p-6 max-w-sm mx-auto bg-secondary rounded-xl shadow-md flex items-center space-x-4 mt-8">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
          <span className="text-black font-bold">CU</span>
        </div>
      </div>
      <div>
        <div className="text-xl font-medium text-light">Club Unplugged</div>
        <p className="text-gray-400">TailwindCSS Test Component</p>
      </div>
    </div>
  );
};

export default TestComponent; 