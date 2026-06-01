import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "border-sky-500/30 bg-sky-500/15 text-sky-200",
      success: "border-emerald-500/30 bg-emerald-500/15 text-emerald-200",
      warning: "border-amber-500/30 bg-amber-500/15 text-amber-200",
      destructive: "border-red-500/30 bg-red-500/15 text-red-200",
      muted: "border-slate-700 bg-slate-800 text-slate-300",
      vip: "border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-200",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
