"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../lib/utils";

export interface StepperProps extends React.HTMLAttributes<HTMLOListElement> {
  current: number;
  steps: { label: string; description?: string }[];
}
export const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(
  ({ className, current, steps, ...props }, ref) => (
    <ol ref={ref} className={cn("flex items-start gap-2", className)} {...props}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={i} className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] font-display text-[11px] font-bold border",
                  done   ? "bg-status-ok text-white border-status-ok"
                  : active ? "bg-green text-white border-green"
                  : "bg-card text-muted-foreground border-border"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </span>
              {i < steps.length - 1 ? (
                <span className={cn("h-px flex-1", done ? "bg-status-ok" : "bg-border")} />
              ) : null}
            </div>
            <div>
              <div className={cn("font-display text-[12px] font-bold uppercase tracking-caps", done || active ? "text-navy" : "text-muted-foreground")}>
                {step.label}
              </div>
              {step.description ? (
                <div className="text-[11px] text-muted-foreground mt-0.5">{step.description}</div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  )
);
Stepper.displayName = "Stepper";
