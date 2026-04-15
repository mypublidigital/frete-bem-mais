import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm",
  secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
  outline: "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",
  ghost: "text-neutral-900 hover:bg-neutral-100",
  destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  link: "text-brand-500 underline-offset-4 hover:underline p-0 h-auto",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
