"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { IoClose } from "react-icons/io5";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;
export const DialogOverlay = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) => (
  <DialogPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/75 backdrop-blur-sm", className)} {...props} />
);
export const DialogContent = ({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 grid w-[min(92vw,680px)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-100 shadow-2xl outline-none", className)} {...props}>
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100">
        <IoClose />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
);
export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex justify-end gap-2", className)} {...props} />;
export const DialogTitle = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) => <DialogPrimitive.Title className={cn("text-lg font-semibold", className)} {...props} />;
export const DialogDescription = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) => <DialogPrimitive.Description className={cn("text-sm text-slate-400", className)} {...props} />;
