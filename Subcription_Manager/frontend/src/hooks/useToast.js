import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = null) => {
    const id = Date.now() + Math.random();
    
    // Set default duration based on type
    const toastDuration = duration !== null ? duration : (type === 'success' ? 5000 : 0);
    
    const newToast = {
      id,
      message,
      type,
      duration: toastDuration
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove success toasts
    if (type === 'success' && toastDuration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toastDuration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration = 5000) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message, duration = 0) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    clearAll
  };
};