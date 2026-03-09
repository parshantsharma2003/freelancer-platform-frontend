import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Toast notification functions
 */
export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      duration: 4000,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      ...options,
    });
  },
  error: (message, options = {}) => {
    toast.error(message, {
      duration: 5000,
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      ...options,
    });
  },
  warning: (message, options = {}) => {
    toast(message, {
      duration: 4000,
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      ...options,
    });
  },
  info: (message, options = {}) => {
    toast(message, {
      duration: 4000,
      icon: <Info className="h-5 w-5 text-blue-600" />,
      ...options,
    });
  },
};

/**
 * ToastContainer - Must be placed in App root
 */
export const ToastContainer = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: '',
        style: {
          background: '#fff',
          color: '#333',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          maxWidth: '500px',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default ToastContainer;
