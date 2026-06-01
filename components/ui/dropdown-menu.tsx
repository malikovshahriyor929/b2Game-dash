"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content className={cn("z-50 min-w-44 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-1 text-slate-100 shadow-xl", className)} {...props} />
  </DropdownMenuPrimitive.Portal>
);
export const DropdownMenuItem = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>) => <DropdownMenuPrimitive.Item className={cn("flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-slate-800", className)} {...props} />;
export const DropdownMenuLabel = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>) => <DropdownMenuPrimitive.Label className={cn("px-3 py-2 text-xs font-semibold uppercase text-slate-400", className)} {...props} />;
export const DropdownMenuSeparator = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) => <DropdownMenuPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-slate-800", className)} {...props} />;
