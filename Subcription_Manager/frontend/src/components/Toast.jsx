import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XIcon } from 'lucide-react';

const Toast = ({ message, type = 'success', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    
    // Auto close for success messages
    if (type === 'success' && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [type, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-md w-full bg-white rounded-lg shadow-lg border-l-4 p-4 transition-all duration-300 transform";
    
    if (type === 'success') {
      return `${baseStyles} border-green-500 ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`;
    } else {
      return `${baseStyles} border-red-500 ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`;
    }
  };

  const getIcon = () => {
    if (type === 'success') {
      return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
    } else {
      return <XCircleIcon className="w-6 h-6 text-red-500" />;
    }
  };

  const getTextColor = () => {
    return type === 'success' ? 'text-green-800' : 'text-red-800';
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className={`text-sm font-medium ${getTextColor()}`}>
            {message}
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleClose}
            className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              type === 'success' 
                ? 'text-green-400 hover:bg-green-100 focus:ring-green-600' 
                : 'text-red-400 hover:bg-red-100 focus:ring-red-600'
            }`}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast;