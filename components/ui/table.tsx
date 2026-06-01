import * as React from "react";
import { cn } from "@/lib/utils";

export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => <div className="w-full overflow-auto rounded-2xl border border-slate-800"><table className={cn("w-full caption-bottom text-sm", className)} {...props} /></div>;
export const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={cn("bg-slate-950/60 text-slate-400", className)} {...props} />;
export const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={cn("border-b border-slate-800 transition hover:bg-slate-800/40", className)} {...props} />;
export const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => <th className={cn("h-10 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide", className)} {...props} />;
export const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => <td className={cn("px-3 py-3 align-middle text-slate-200", className)} {...props} />;
