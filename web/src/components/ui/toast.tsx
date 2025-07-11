'use client';
import React, { createContext, useCallback, useContext, useState } from 'react';

import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastContextType = {
  showToast: (
    content: ReactNode,
    options?: {
      duration?: number;
      type?: ToastType;
    }
  ) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ReactNode | null>(null);
  const [visible, setVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (
      content: ReactNode,
      options?: {
        duration?: number;
        type?: ToastType;
      }
    ) => {
      setToastType(options?.type ?? 'success');
      setToast(content);
      setVisible(true);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const id = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setToast(null);
        }, 300); // Wait for animation to complete
      }, options?.duration ?? 3000);

      setTimeoutId(id);
    },
    [timeoutId]
  );

  const getToastConfig = (type: ToastType) => {
    const configs = {
      success: {
        bg: 'bg-emerald-50 border-emerald-200',
        text: 'text-emerald-800',
        icon: 'text-emerald-600',
        Icon: CheckCircle,
      },
      error: {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600',
        Icon: XCircle,
      },
      info: {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-600',
        Icon: Info,
      },
      warning: {
        bg: 'bg-amber-50 border-amber-200',
        text: 'text-amber-800',
        icon: 'text-amber-600',
        Icon: AlertTriangle,
      },
    };
    return configs[type];
  };

  const config = getToastConfig(toastType);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <div className='pointer-events-none fixed inset-0 z-50 flex items-start justify-end p-4'>
          <div
            className={` ${config.bg} ${config.text} flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out ${
              visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
            } pointer-events-auto max-w-sm`}
          >
            <config.Icon className={`size-5 ${config.icon} flex-shrink-0`} />
            <div className='text-sm font-medium'>{toast}</div>
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
