"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[2px] font-display font-bold uppercase tracking-caps leading-none whitespace-nowrap",
  {
    variants: {
      variant: {
        navy:    "bg-navy text-white",
        green:   "bg-green text-white",
        blue:    "bg-blue/12 text-blue-dark border border-blue",
        gray:    "bg-gray-bg text-muted-foreground",
        danger:  "bg-destructive/12 text-destructive border border-destructive/40",
        warn:    "bg-status-warn/12 text-status-warn border border-status-warn/40",
        success: "bg-status-ok/12 text-status-ok border border-status-ok/40",
      },
      size: {
        sm: "text-[9px] px-1.5 py-[3px]",
        md: "text-[10px] px-2 py-[3px]",
        lg: "text-[11px] px-2.5 py-1",
      },
    },
    defaultVariants: { variant: "navy", size: "md" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
);
Badge.displayName = "Badge";

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "ok" | "warn" | "down" | "paused" | "info";
  children: React.ReactNode;
}
export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ className, status, children, ...props }, ref) => {
    const palette = {
      ok:     { text: "text-status-ok",   dot: "bg-status-ok",   ring: "ring-status-ok/20" },
      warn:   { text: "text-status-warn", dot: "bg-status-warn", ring: "ring-status-warn/20" },
      down:   { text: "text-status-down", dot: "bg-status-down", ring: "ring-status-down/20" },
      paused: { text: "text-muted-foreground", dot: "bg-muted-foreground", ring: "ring-muted-foreground/15" },
      info:   { text: "text-blue-dark",   dot: "bg-blue",        ring: "ring-blue/20" },
    }[status];
    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-caps", palette.text, className)}
        {...props}
      >
        <span className={cn("h-2 w-2 rounded-full ring-[3px]", palette.dot, palette.ring)} />
        {children}
      </span>
    );
  }
);
StatusPill.displayName = "StatusPill";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
  variant?: "filter" | "input";
}
export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, children, onRemove, variant = "filter", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[2px] border border-navy/24 bg-card px-2.5 py-1 text-[12px] font-semibold text-navy",
        variant === "input" && "bg-gray-bg border-transparent",
        className
      )}
      {...props}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-[2px] text-muted-foreground hover:bg-navy/10 hover:text-navy focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue"
          aria-label="Treure filtre"
        >
          <X className="h-3 w-3" strokeWidth={2.5} />
        </button>
      ) : null}
    </span>
  )
);
Chip.displayName = "Chip";
