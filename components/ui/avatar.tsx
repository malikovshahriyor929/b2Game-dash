import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

export const Avatar = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>) => <AvatarPrimitive.Root className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-700", className)} {...props} />;
export const AvatarImage = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>) => <AvatarPrimitive.Image className={cn("aspect-square h-full w-full object-cover", className)} {...props} />;
export const AvatarFallback = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>) => <AvatarPrimitive.Fallback className={cn("flex h-full w-full items-center justify-center bg-slate-800 text-xs font-bold text-sky-200", className)} {...props} />;
