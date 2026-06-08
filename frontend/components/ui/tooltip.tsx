"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content className={cn("z-50 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 shadow-xl", className)} {...props} />
  </TooltipPrimitive.Portal>
);
