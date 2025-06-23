import { useState, useEffect } from 'react';

const CloseIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Toast = ({ message, type = 'error', onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Esperar a que termine la animación
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const baseStyles = "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-300 flex items-center gap-2 min-w-[320px] z-50";
  
  const typeStyles = {
    error: "bg-red-50 text-red-800 border-l-4 border-red-600",
    success: "bg-green-50 text-green-800 border-l-4 border-green-600",
    warning: "bg-yellow-50 text-yellow-800 border-l-4 border-yellow-600",
    info: "bg-blue-50 text-blue-800 border-l-4 border-blue-600"
  };

  const iconStyles = {
    error: "bg-red-100 text-red-500",
    success: "bg-green-100 text-green-500",
    warning: "bg-yellow-100 text-yellow-500",
    info: "bg-blue-100 text-blue-500"
  };

  return (
    <div 
      className={`${baseStyles} ${typeStyles[type]} ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
      role="alert"
    >
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium">
            {type === 'error' && 'Error'}
            {type === 'success' && 'Éxito'}
            {type === 'warning' && 'Advertencia'}
            {type === 'info' && 'Información'}
          </p>
          <button 
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className={`rounded-lg p-1.5 hover:bg-opacity-80 ${iconStyles[type]}`}
          >
            <CloseIcon />
          </button>
        </div>
        <p className="text-sm mt-1">{message}</p>
      </div>
    </div>
  );
};

export default Toast;