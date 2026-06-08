"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content className={cn("z-50 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-slate-100 shadow-xl", className)} {...props} />
  </PopoverPrimitive.Portal>
);
