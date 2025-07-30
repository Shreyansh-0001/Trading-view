import React from 'react';

const StockPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Stock Page
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Individual stock details and charts will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default StockPage;