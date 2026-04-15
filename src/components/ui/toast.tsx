"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (params: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((params: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...params, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border bg-white p-4 shadow-lg",
              "animate-in slide-in-from-right-full"
            )}
          >
            {icons[t.type]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900">{t.title}</p>
              {t.description && (
                <p className="text-xs text-neutral-500 mt-0.5">{t.description}</p>
              )}
            </div>
            <button onClick={() => removeToast(t.id)}>
              <X className="h-4 w-4 text-neutral-400" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
