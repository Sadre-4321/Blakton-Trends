import React, { useState, useEffect } from 'react';

const SuccessAlert = ({ message, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [message, duration, onClose]);

  if (!isVisible || !message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInRight">
      <div className="bg-success text-white px-6 py-4 rounded-lg shadow-premium flex items-center gap-4">
        <span className="text-2xl">✓</span>
        <div>
          <h4 className="font-bold">Success</h4>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="ml-4 text-white hover:text-gray-200 transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SuccessAlert;
