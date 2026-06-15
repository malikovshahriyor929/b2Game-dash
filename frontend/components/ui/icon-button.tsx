"use client";

import { forwardRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Icon-only action button that shows its label as a tooltip on hover.
// A global TooltipProvider is mounted in SessionProvider.
type IconButtonProps = ButtonProps & { tooltip: string };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { tooltip, size = "icon", ...props },
  ref,
) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button ref={ref} size={size} aria-label={tooltip} {...props} />
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
});
