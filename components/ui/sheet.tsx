"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { IoClose } from "react-icons/io5";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetContent = ({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55" />
    <DialogPrimitive.Content className={cn("fixed right-0 top-0 z-50 h-full w-[420px] max-w-[94vw] border-l border-slate-700 bg-slate-950 p-5 text-slate-100 shadow-2xl", className)} {...props}>
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100">
        <IoClose />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);
export const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />;
export const SheetTitle = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) => <DialogPrimitive.Title className={cn("text-lg font-semibold", className)} {...props} />;
export const SheetDescription = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) => <DialogPrimitive.Description className={cn("text-sm text-slate-400", className)} {...props} />;
