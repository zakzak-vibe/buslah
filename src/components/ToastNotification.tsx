import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  icon?: string;
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 max-w-md bg-stone-900 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-orange-500/40 animate-slide-up">
      <div className="w-10 h-10 rounded-xl bg-[#d95e1e] flex items-center justify-center shrink-0 text-white shadow-sm">
        <span className="material-symbols-outlined text-[24px]">
          {toast.icon || 'notifications_active'}
        </span>
      </div>

      <div className="flex-1">
        <p className="text-sm font-extrabold text-white leading-tight">{toast.title}</p>
        <p className="text-xs text-stone-300 mt-0.5 leading-snug">{toast.message}</p>
      </div>

      <button
        onClick={onClose}
        className="text-stone-400 hover:text-white transition p-1 rounded-lg hover:bg-stone-800"
        aria-label="Dismiss Notification"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};
