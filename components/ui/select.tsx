"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { IoChevronDown } from "react-icons/io5";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectTrigger = ({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) => (
  <SelectPrimitive.Trigger className={cn("flex h-10 w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none focus:border-sky-400", className)} {...props}>
    {children}<IoChevronDown className="text-slate-500" />
  </SelectPrimitive.Trigger>
);
export const SelectContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Portal><SelectPrimitive.Content className={cn("z-50 rounded-xl border border-slate-700 bg-slate-900 p-1 text-slate-100 shadow-xl", className)} {...props} /></SelectPrimitive.Portal>
);
export const SelectItem = ({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item className={cn("cursor-pointer rounded-lg px-3 py-2 text-sm outline-none hover:bg-slate-800 data-[state=checked]:bg-sky-500 data-[state=checked]:text-slate-950", className)} {...props}>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);
