import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-brand-100 text-brand-800",
  secondary: "bg-neutral-100 text-neutral-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  destructive: "bg-red-100 text-red-800",
  outline: "border border-neutral-300 text-neutral-700 bg-white",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
