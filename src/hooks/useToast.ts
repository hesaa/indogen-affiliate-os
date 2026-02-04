import { useState, useEffect } from 'react';
import { Info, CheckCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  timestamp: number;
}

export interface UseToast {
  toasts: Toast[];
  showToast: (type: ToastType, title: string, description?: string) => void;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

export const useToast = (): UseToast => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, title: string, description?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();

    setToasts(prev => [
      ...prev,
      { id, type, title, description, timestamp }
    ]);

    // Auto-hide after 5 seconds for non-error toasts
    if (type !== 'error') {
      setTimeout(() => hideToast(id), 5000);
    }
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const hideAllToasts = () => {
    setToasts([]);
  };

  return { toasts, showToast, hideToast, hideAllToasts };
};