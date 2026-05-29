"use client";

import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full bg-card border border-border/30 rounded-[2px] overflow-hidden">
      <table ref={ref} className={cn("w-full caption-bottom border-collapse text-[13px]", className)} {...props} />
    </div>
  )
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b [&_tr]:border-border/30 bg-gray-bg", className)} {...props} />
  )
);
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  )
);
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("border-t border-border/30 bg-gray-bg/50 font-semibold", className)} {...props} />
  )
);
TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }>(
  ({ className, selected, ...props }, ref) => (
    <tr
      ref={ref}
      data-selected={selected ? "" : undefined}
      className={cn("h-9 border-b border-border/30 transition-colors hover:bg-navy/[0.03] data-[selected]:bg-blue/5", className)}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
  align?: "left" | "right" | "center";
}
export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable, sortDirection, onSort, align = "left", ...props }, ref) => {
    const Icon = sortDirection === "asc" ? ArrowUp : sortDirection === "desc" ? ArrowDown : ArrowUpDown;
    return (
      <th
        ref={ref}
        className={cn(
          "h-9 px-3.5 font-display text-[11px] font-bold uppercase tracking-caps text-muted-foreground whitespace-nowrap",
          align === "right" && "text-right",
          align === "center" && "text-center",
          className
        )}
        {...props}
      >
        {sortable ? (
          <button type="button" onClick={onSort} className={cn("inline-flex items-center gap-1.5 hover:text-navy", sortDirection && "text-navy")}>
            {children}
            <Icon className="h-3 w-3 opacity-60" />
          </button>
        ) : children}
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "right" | "center";
  numeric?: boolean;
}
export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = "left", numeric, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "px-3.5 text-foreground align-middle",
        align === "right" && "text-right",
        align === "center" && "text-center",
        numeric && "font-mono text-[13px] tabular-nums text-right",
        className
      )}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-3 text-[12px] text-muted-foreground", className)} {...props} />
  )
);
TableCaption.displayName = "TableCaption";

export interface TreeItemProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: number;
  expanded?: boolean;
  hasChildren?: boolean;
  active?: boolean;
  onToggle?: () => void;
}
export const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
  ({ className, level = 0, expanded, hasChildren, active, onToggle, children, ...props }, ref) => (
    <div
      ref={ref}
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      className={cn("group flex items-center gap-2 px-2.5 py-1.5 rounded-[2px] text-[13px] cursor-pointer transition-colors hover:bg-gray-bg", active && "bg-navy text-white hover:bg-navy", className)}
      style={{ paddingLeft: `${level * 16 + 10}px` }}
      {...props}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
        className={cn("inline-flex h-4 w-4 items-center justify-center text-muted-foreground", active && "text-white/70")}
        tabIndex={-1}
      >
        {hasChildren ? (expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />) : <span className="h-1 w-1 rounded-full bg-current opacity-40" />}
      </button>
      {children}
    </div>
  )
);
TreeItem.displayName = "TreeItem";

export const TreeGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div role="group" className={cn("ml-3.5 border-l border-border/30", className)} {...props} />
);

export const Tree = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="tree" className={cn("text-[13px] flex flex-col gap-px", className)} {...props} />
  )
);
Tree.displayName = "Tree";

export const List = ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className={cn("flex flex-col divide-y divide-border/30 rounded-[2px] border border-border/30 bg-card", className)} {...props} />
);
export const ListItem = ({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li className={cn("flex items-center justify-between gap-4 px-4 py-2.5 text-[13px] hover:bg-navy/[0.03] transition-colors", className)} {...props} />
);
