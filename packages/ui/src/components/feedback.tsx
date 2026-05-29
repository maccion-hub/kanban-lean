"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "../lib/utils";

const alertVariants = cva(
  "flex gap-3 rounded-[2px] border-l-[3px] px-3.5 py-3 text-[13px] leading-relaxed bg-card",
  {
    variants: {
      tone: {
        info:    "border-l-blue bg-blue/6 text-navy-dark",
        success: "border-l-status-ok bg-status-ok/8 text-navy-dark",
        warn:    "border-l-status-warn bg-status-warn/8 text-[#6C5310]",
        danger:  "border-l-status-down bg-status-down/6 text-[#6C231A]",
      },
    },
    defaultVariants: { tone: "info" },
  }
);

const ICONS = { info: Info, success: CheckCircle2, warn: AlertTriangle, danger: XCircle } as const;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
}
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, tone = "info", icon, children, ...props }, ref) => {
    const Icon = ICONS[tone ?? "info"];
    const tint = { info: "text-blue", success: "text-status-ok", warn: "text-status-warn", danger: "text-status-down" }[tone ?? "info"];
    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ tone }), className)} {...props}>
        <span className={cn("mt-0.5 shrink-0", tint)}>{icon ?? <Icon className="h-4 w-4" strokeWidth={2.4} />}</span>
        <div className="flex-1">{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

export const AlertTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h5 className={cn("font-semibold text-navy mb-0.5", className)} {...props} />
);
export const AlertDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <div className={cn("text-[13px] leading-relaxed", className)} {...props} />
);

export const Toolbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2 rounded-[2px] border border-border/30 bg-card px-3 py-2", className)} {...props} />
  )
);
Toolbar.displayName = "Toolbar";

export const ToolbarSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span aria-hidden className={cn("h-5 w-px bg-border/30 mx-1", className)} {...props} />
);
export const ToolbarSpacer = () => <div className="flex-1" />;

export const Sidenav = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <aside ref={ref} className={cn("sticky top-0 self-start h-screen overflow-y-auto bg-card border-r border-border/30 p-4", className)} {...props} />
  )
);
Sidenav.displayName = "Sidenav";

export const SidenavSectionLabel = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("font-display text-[10px] font-bold uppercase tracking-caps text-muted-foreground mt-4 mb-2 first:mt-0", className)} {...props} />
);

export const SidenavLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }>(
  ({ className, active, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "block px-2.5 py-1.5 text-[13px] rounded-[2px] cursor-pointer transition-colors",
        active ? "bg-navy text-white" : "text-navy hover:bg-gray-bg",
        className
      )}
      {...props}
    />
  )
);
SidenavLink.displayName = "SidenavLink";
