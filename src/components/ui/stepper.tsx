"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  isCompleted && "bg-brand-500 text-white",
                  isCurrent && "bg-brand-500 text-white ring-2 ring-brand-200",
                  !isCompleted && !isCurrent && "bg-neutral-200 text-neutral-500"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "hidden sm:block text-sm",
                  isCurrent ? "font-medium text-neutral-900" : "text-neutral-500"
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-8 sm:w-12",
                  index < currentStep ? "bg-brand-500" : "bg-neutral-200"
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
