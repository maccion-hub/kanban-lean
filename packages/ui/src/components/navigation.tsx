"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, ChevronRight, Slash } from "lucide-react";
import { cn } from "../lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn("inline-flex items-center border-b border-border/30 gap-0", className)} {...props} />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center gap-2 px-3.5 py-2.5 font-display text-[13px] font-semibold text-muted-foreground transition-colors -mb-px",
      "hover:text-navy",
      "data-[state=active]:text-navy data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:-bottom-px data-[state=active]:after:h-[3px] data-[state=active]:after:bg-green",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-inset",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue", className)} {...props} />
));
TabsContent.displayName = "TabsContent";

export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b border-border/30", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn("flex flex-1 items-center justify-between py-3 font-display text-[14px] font-semibold text-navy transition-all hover:underline [&[data-state=open]>svg]:rotate-180", className)}
      {...props}
    >
      {children}
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content ref={ref} className="overflow-hidden text-[13px] data-[state=closed]:animate-fade-in data-[state=open]:animate-fade-in" {...props}>
    <div className={cn("pb-3 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";

export const Breadcrumb = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <nav ref={ref} aria-label="breadcrumb" className={cn("inline-flex items-center gap-1.5 text-[12px] text-muted-foreground", className)} {...props} />
  )
);
Breadcrumb.displayName = "Breadcrumb";

export const BreadcrumbList = ({ className, ...props }: React.OlHTMLAttributes<HTMLOListElement>) => (
  <ol className={cn("flex items-center gap-1.5", className)} {...props} />
);
export const BreadcrumbItem = ({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li className={cn("inline-flex items-center", className)} {...props} />
);
export const BreadcrumbLink = ({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a className={cn("text-muted-foreground hover:text-navy cursor-pointer", className)} {...props} />
);
export const BreadcrumbPage = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span aria-current="page" className={cn("font-semibold text-navy", className)} {...props} />
);
export const BreadcrumbSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span role="presentation" className={cn("text-border", className)} {...props}>
    <ChevronRight className="h-3 w-3" />
  </span>
);

export const Pagination = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <nav role="navigation" aria-label="pagination" className={cn("inline-flex items-center gap-1 text-[12px]", className)} {...props} />
);
export const PaginationItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { isActive?: boolean }>(
  ({ className, isActive, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "min-w-7 h-7 inline-flex items-center justify-center rounded-[2px] border border-navy/24 bg-card font-display text-[12px] font-semibold text-navy",
        "hover:bg-gray-bg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue",
        isActive && "bg-navy text-white border-navy hover:bg-navy",
        className
      )}
      {...props}
    />
  )
);
PaginationItem.displayName = "PaginationItem";

export const PaginationEllipsis = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span aria-hidden className={cn("inline-flex h-7 min-w-7 items-center justify-center text-muted-foreground", className)} {...props}>…</span>
);

export { Slash };
