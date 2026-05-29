"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

const cardVariants = cva(
  "bg-card text-card-foreground border border-border/30 rounded-[2px] transition-shadow",
  {
    variants: {
      accent: {
        none:  "",
        navy:  "border-t-[3px] border-t-navy",
        green: "border-t-[3px] border-t-green",
        blue:  "border-t-[3px] border-t-blue",
      },
      interactive: { true: "hover:shadow-m cursor-pointer", false: "" },
    },
    defaultVariants: { accent: "none", interactive: false },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, accent, interactive, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ accent, interactive }), className)} {...props} />
  )
);
Card.displayName = "Card";

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5 p-4 pb-2", className)} {...props} />
);
export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("font-display text-mgr-h3 text-navy", className)} {...props} />
);
export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-mgr-small text-muted-foreground", className)} {...props} />
);
export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4 pt-2", className)} {...props} />
);
export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center gap-2 p-4 pt-2 border-t border-border/30", className)} {...props} />
);

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  delta?: React.ReactNode;
  deltaDirection?: "up" | "down" | "neutral";
  accent?: "navy" | "green" | "blue" | "warn";
}
export const KpiCard = React.forwardRef<HTMLDivElement, KpiCardProps>(
  ({ className, label, value, delta, deltaDirection = "up", accent = "navy", ...props }, ref) => {
    const top = { navy: "border-t-navy", green: "border-t-green", blue: "border-t-blue", warn: "border-t-status-warn" }[accent];
    const valueColor = { navy: "text-navy", green: "text-green-dark", blue: "text-blue-dark", warn: "text-status-warn" }[accent];
    return (
      <div ref={ref} className={cn("bg-card border border-border/30 border-t-[3px] rounded-[2px] p-4 flex flex-col gap-1", top, className)} {...props}>
        <span className="font-display text-[10px] font-bold uppercase tracking-caps text-muted-foreground">{label}</span>
        <span className={cn("font-display text-[28px] font-bold leading-none", valueColor)}>{value}</span>
        {delta ? (
          <span className={cn("font-mono text-[12px]", deltaDirection === "down" ? "text-destructive" : "text-green-dark")}>{delta}</span>
        ) : null}
      </div>
    );
  }
);
KpiCard.displayName = "KpiCard";

export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root ref={ref} className={cn("relative flex h-7 w-7 shrink-0 overflow-hidden rounded-full bg-navy text-white", className)} {...props} />
));
Avatar.displayName = "Avatar";

export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full object-cover", className)} {...props} />
));
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback ref={ref} className={cn("flex h-full w-full items-center justify-center font-display text-[11px] font-bold tracking-tight uppercase", className)} {...props} />
));
AvatarFallback.displayName = "AvatarFallback";

export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn("shrink-0 bg-border/30", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)}
    {...props}
  />
));
Separator.displayName = "Separator";

export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  tone?: "green" | "navy" | "blue" | "warn" | "down";
}
export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, tone = "green", ...props }, ref) => {
  const bar = { green: "bg-green", navy: "bg-navy", blue: "bg-blue", warn: "bg-status-warn", down: "bg-status-down" }[tone];
  return (
    <ProgressPrimitive.Root ref={ref} className={cn("relative h-1.5 w-full overflow-hidden rounded-[2px] bg-gray-bg", className)} {...props}>
      <ProgressPrimitive.Indicator className={cn("h-full transition-transform", bar)} style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }} />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = "Progress";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
  tone?: "navy" | "muted" | "white";
}
export const Spinner = ({ className, size = "md", tone = "navy", ...props }: SpinnerProps) => {
  const sz = { sm: "h-3 w-3", md: "h-3.5 w-3.5", lg: "h-5 w-5" }[size];
  const t = { navy: "text-navy", muted: "text-muted-foreground", white: "text-white" }[tone];
  return (
    <span role="status" className={cn("inline-flex", t, className)} {...props}>
      <Loader2 className={cn(sz, "animate-spin")} />
    </span>
  );
};
