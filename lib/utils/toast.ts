import { toast } from 'react-toastify';

// Track the last error message to prevent duplicates
let lastErrorMessage: string | null = null;
let lastErrorTime: number = 0;

// Toast functions with default configuration
export const showSuccess = (message: string) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showError = (message: string) => {
  const now = Date.now();
  const timeSinceLastError = now - lastErrorTime;
  
  // If same message within 500ms, skip to prevent duplicates
  if (lastErrorMessage === message && timeSinceLastError < 500) {
    return;
  }
  
  lastErrorMessage = message;
  lastErrorTime = now;
  
  // Dismiss only the error toast (not all toasts) to avoid dismissing other toasts
  toast.dismiss('error');
  
  // Use fixed toastId so duplicate calls update the same toast instead of creating new ones
  toast.error(message, {
    position: 'top-right',
    autoClose: 5000, // 5 seconds for slower fade out
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    toastId: 'error', // Fixed ID - updates existing toast instead of creating duplicate
  });
};

export const showInfo = (message: string) => {
  toast.info(message, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showWarning = (message: string) => {
  toast.warning(message, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Custom toast with custom component
export const showCustomToast = (component: React.ReactNode) => {
  return toast(component, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Dismiss toast
export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

// Export the original toast for advanced usage
export { toast }; 