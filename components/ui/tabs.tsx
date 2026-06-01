"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;
export const TabsList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) => <TabsPrimitive.List className={cn("inline-flex h-10 items-center rounded-xl border border-slate-800 bg-slate-950/70 p-1", className)} {...props} />;
export const TabsTrigger = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) => <TabsPrimitive.Trigger className={cn("inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-400 transition data-[state=active]:bg-sky-500 data-[state=active]:text-slate-950", className)} {...props} />;
export const TabsContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) => <TabsPrimitive.Content className={cn("mt-4 outline-none", className)} {...props} />;
