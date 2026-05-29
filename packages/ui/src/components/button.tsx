"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-display font-bold leading-none rounded-[2px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "bg-navy text-white border-navy hover:bg-navy-dark hover:border-navy-dark active:opacity-95",
        accent:  "bg-green text-white border-green hover:bg-green-dark hover:border-green-dark active:opacity-95",
        outline: "bg-transparent text-navy border-navy/40 hover:bg-navy hover:text-white hover:border-navy",
        ghost:   "bg-transparent text-muted-foreground border-transparent hover:bg-gray-bg hover:text-navy",
        danger:  "bg-destructive text-destructive-foreground border-destructive hover:opacity-90",
        link:    "bg-transparent text-navy border-transparent underline-offset-2 hover:underline px-0 h-auto",
      },
      size: {
        sm:       "h-7 px-2.5 text-[12px] gap-1",
        md:       "h-9 px-3 text-[13px]",
        lg:       "h-10 px-4 text-[14px]",
        icon:     "h-9 w-9 p-0",
        "icon-sm":"h-7 w-7 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export interface IconButtonProps extends Omit<ButtonProps, "size"> {
  label: string;
  size?: "sm" | "md";
}
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, size = "md", children, ...props }, ref) => (
    <Button
      ref={ref}
      size={size === "sm" ? "icon-sm" : "icon"}
      variant={props.variant ?? "ghost"}
      aria-label={label}
      {...props}
    >
      {children}
    </Button>
  )
);
IconButton.displayName = "IconButton";
