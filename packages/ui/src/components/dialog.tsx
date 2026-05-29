"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-navy/45 backdrop-blur-[1px] data-[state=open]:animate-fade-in", className)} {...props} />
));
DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[520px] translate-x-[-50%] translate-y-[-50%] bg-card border border-border/30 rounded-[2px] shadow-lg overflow-hidden",
        "data-[state=open]:animate-slide-up",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center justify-between px-4 py-3 border-b border-border/30", className)} {...props}>
    {children}
    <DialogPrimitive.Close className="inline-flex h-7 w-7 items-center justify-center rounded-[2px] text-muted-foreground hover:bg-gray-bg hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue">
      <X className="h-3.5 w-3.5" />
      <span className="sr-only">Tancar</span>
    </DialogPrimitive.Close>
  </div>
);

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("font-display text-[16px] font-bold text-navy", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-mgr-small text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

export const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-4 py-4 text-[13px] leading-relaxed", className)} {...props} />
);

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex justify-end gap-2 px-4 py-3 border-t border-border/30 bg-gray-bg", className)} {...props} />
);

export interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: "right" | "left" | "top" | "bottom";
}
export const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  ({ className, side = "right", children, ...props }, ref) => {
    const sides = {
      right:  "right-0 top-0 h-full w-[420px] border-l data-[state=open]:animate-slide-up",
      left:   "left-0 top-0 h-full w-[420px] border-r data-[state=open]:animate-slide-up",
      top:    "top-0 inset-x-0 h-[360px] border-b data-[state=open]:animate-slide-up",
      bottom: "bottom-0 inset-x-0 h-[420px] border-t data-[state=open]:animate-slide-up",
    }[side];
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content ref={ref} className={cn("fixed z-50 bg-card border-border/30 shadow-lg overflow-y-auto", sides, className)} {...props}>
          {children}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }
);
SheetContent.displayName = "SheetContent";

export { Dialog as Sheet, DialogTrigger as SheetTrigger, DialogClose as SheetClose };
