import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default: "bg-sky-500 text-slate-950 shadow-glow hover:bg-sky-400",
        secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
        ghost: "hover:bg-slate-800/80 text-slate-300",
        outline: "border border-slate-700 bg-slate-900/40 hover:bg-slate-800",
        destructive: "bg-red-500 text-white hover:bg-red-400",
        success: "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
        warning: "bg-amber-500 text-slate-950 hover:bg-amber-400",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});

export { buttonVariants };
