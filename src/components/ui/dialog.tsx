"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { type HTMLAttributes, useEffect, useRef } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl mx-4",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-lg font-semibold text-neutral-900 mb-2", className)} {...props} />
  );
}

export function DialogDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-neutral-500 mb-4", className)} {...props} />
  );
}
