"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const labelVariants = cva(
  "font-display font-bold uppercase tracking-caps text-muted-foreground select-none",
  { variants: { size: { sm: "text-[10px]", md: "text-[11px]" } }, defaultVariants: { size: "md" } }
);

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, size, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants({ size }), className)} {...props} />
));
Label.displayName = "Label";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-invalid={invalid ? "" : undefined}
      className={cn(
        "h-9 w-full rounded-[2px] border border-navy/24 bg-card px-3 text-[14px] text-foreground transition-colors",
        "placeholder:text-muted-foreground/70",
        "hover:border-navy",
        "focus:outline-none focus:border-navy focus:ring-[3px] focus:ring-navy/12",
        "disabled:cursor-not-allowed disabled:bg-gray-bg disabled:text-muted-foreground",
        "data-[invalid]:border-destructive data-[invalid]:focus:ring-destructive/15",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  ({ className, invalid, rows = 3, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      data-invalid={invalid ? "" : undefined}
      className={cn(
        "w-full rounded-[2px] border border-navy/24 bg-card px-3 py-2.5 text-[14px] leading-relaxed text-foreground transition-colors resize-y min-h-[80px]",
        "placeholder:text-muted-foreground/70",
        "hover:border-navy",
        "focus:outline-none focus:border-navy focus:ring-[3px] focus:ring-navy/12",
        "data-[invalid]:border-destructive data-[invalid]:focus:ring-destructive/15",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const FormField = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props} />
  )
);
FormField.displayName = "FormField";

export const FormHint = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-[12px] text-muted-foreground", className)} {...props} />
);
export const FormError = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-[12px] text-destructive font-semibold", className)} {...props} />
);

export const InputGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-9 items-stretch overflow-hidden rounded-[2px] border border-navy/24 bg-card w-full",
        "focus-within:border-navy focus-within:ring-[3px] focus-within:ring-navy/12",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
InputGroup.displayName = "InputGroup";

export const InputGroupAddon = ({ className, position = "trailing", ...props }: React.HTMLAttributes<HTMLSpanElement> & { position?: "leading" | "trailing" }) => (
  <span
    className={cn(
      "inline-flex items-center bg-gray-bg px-3 text-[13px] font-semibold text-muted-foreground",
      position === "leading" ? "border-r border-border/30" : "border-l border-border/30",
      className
    )}
    {...props}
  />
);

export const InputGroupInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn("flex-1 border-0 bg-transparent px-3 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/70", className)}
      {...props}
    />
  )
);
InputGroupInput.displayName = "InputGroupInput";
