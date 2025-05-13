"use client"
import React from 'react';
import { useToast } from '../contexts/ToastContext';

const ToastExample = () => {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Toast Notification Examples</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => showSuccess('Operation completed successfully!')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Show Success Toast
        </button>
        
        <button
          onClick={() => showError('An error occurred. Please try again.')}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Show Error Toast
        </button>
        
        <button
          onClick={() => showInfo('This is an informational message.')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Show Info Toast
        </button>
        
        <button
          onClick={() => showWarning('Warning: This action cannot be undone.')}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
        >
          Show Warning Toast
        </button>
      </div>
    </div>
  );
};

export default ToastExample;
