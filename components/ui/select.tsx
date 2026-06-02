"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { IoCheckmark, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger ref={ref} className={cn("flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition hover:border-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className)} {...props}>
    <span className="min-w-0 flex-1 truncate text-left">{children}</span>
    <SelectPrimitive.Icon asChild>
      <IoChevronDown className="shrink-0 text-slate-500" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        "z-[90] max-h-[var(--radix-select-content-available-height)] min-w-[8rem] overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl shadow-black/40",
        position === "popper" && "w-[var(--radix-select-trigger-width)] translate-y-1",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1 text-slate-400">
        <IoChevronUp />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "max-h-72")}>
        {children}
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1 text-slate-400">
        <IoChevronDown />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item ref={ref} className={cn("relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm outline-none transition hover:bg-slate-800 focus:bg-slate-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:bg-sky-500 data-[state=checked]:text-slate-950", className)} {...props}>
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <IoCheckmark />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
