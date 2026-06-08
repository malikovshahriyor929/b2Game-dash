"use client"

import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  DayPicker,
  type DayButton,
  type Locale,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 [&_table]:w-full [&_tbody_tr]:grid [&_tbody_tr]:grid-cols-7 [&_thead_tr]:grid [&_thead_tr]:grid-cols-7 [&_td]:p-0 [&_th]:text-center [&_th]:text-xs [&_.rdp-caption]:flex [&_.rdp-caption]:items-center [&_.rdp-caption]:justify-between [&_.rdp-nav]:flex [&_.rdp-nav]:gap-1", className)}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        months: "flex flex-col gap-y-4 w-full",
        month: "space-y-4 w-full",
        caption_label: "text-sm font-medium",
        day: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
          }
          return <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        },
        DayButton: (dayProps) => (
          <CalendarDayButton locale={locale} {...dayProps} />
        ),
        ...components,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  return (
    <button
      data-day={day.date.toLocaleDateString(locale?.code)}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "relative h-8 w-8 p-0 font-normal",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
