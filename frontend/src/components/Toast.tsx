"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  exiting: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-sm:left-4 max-sm:right-4 max-sm:items-center">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const iconByType: Record<ToastType, ReactNode> = {
    success: (
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8.5l3.5 3.5 6.5-8" />
      </svg>
    ),
    error: (
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v3" />
        <circle cx="8" cy="11" r="0.5" fill="currentColor" />
      </svg>
    ),
    info: (
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 7v4" />
        <circle cx="8" cy="5" r="0.5" fill="currentColor" />
      </svg>
    ),
  };

  const colorByType: Record<ToastType, string> = {
    success: "text-[var(--color-success)]",
    error: "text-[var(--color-error)]",
    info: "text-[var(--color-accent)]",
  };

  return (
    <div
      className={`
        glass-card flex items-center gap-3 px-4 py-3 min-w-[280px] max-w-[420px]
        ${toast.exiting ? "animate-toast-exit" : "animate-toast-enter"}
      `}
      role="alert"
    >
      <span className={`shrink-0 ${colorByType[toast.type]}`}>
        {iconByType[toast.type]}
      </span>
      <p className="flex-1 text-sm text-[var(--color-foreground)]">
        {toast.message}
      </p>
      <button
        onClick={onDismiss}
        className="shrink-0 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
        aria-label="Fechar"
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 3l8 8M11 3l-8 8" />
        </svg>
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
