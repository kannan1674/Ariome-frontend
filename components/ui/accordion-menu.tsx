"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Types
export interface AccordionMenuClassNames {
  root?: string
  group?: string
  label?: string
  separator?: string
  item?: string
  sub?: string
  subTrigger?: string
  subContent?: string
  indicator?: string
}

export interface AccordionMenuProps {
  selectedValue?: string
  matchPath?: (path: string) => boolean
  classNames?: AccordionMenuClassNames
  type?: "single" | "multiple"
  collapsible?: boolean
  className?: string
  children?: React.ReactNode
}

export type AccordionMenuGroupProps = React.ComponentPropsWithoutRef<"div">;

export type AccordionMenuLabelProps = React.ComponentPropsWithoutRef<"div">;

export interface AccordionMenuItemProps
  extends React.ComponentPropsWithoutRef<"div"> {
  value: string
}

export interface AccordionMenuSubProps
  extends React.ComponentPropsWithoutRef<"div"> {
  value: string
}

export type AccordionMenuSubTriggerProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>;

export interface AccordionMenuSubContentProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
  parentValue?: string
}

// Components
const AccordionMenu = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionMenuProps
>(({ className, selectedValue, matchPath: _matchPath, classNames, type = "single", collapsible = true, children, ...props }, ref) => {
  const [value, setValue] = React.useState<string | string[] | undefined>(
    selectedValue
  )

  React.useEffect(() => {
    if (selectedValue) {
      setValue(selectedValue)
    }
  }, [selectedValue])

  const accordionProps = type === "single" 
    ? { type: "single" as const, collapsible, value: value as string, onValueChange: setValue as (value: string) => void }
    : { type: "multiple" as const, value: value as string[], onValueChange: setValue as (value: string[]) => void }

  return (
    <AccordionPrimitive.Root
      ref={ref}
      className={cn(classNames?.root, className)}
      {...accordionProps}
      {...props}
    >
      {children}
    </AccordionPrimitive.Root>
  )
})
AccordionMenu.displayName = "AccordionMenu"

const AccordionMenuGroup = React.forwardRef<
  HTMLDivElement,
  AccordionMenuGroupProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-1", className)}
    {...props}
  />
))
AccordionMenuGroup.displayName = "AccordionMenuGroup"

const AccordionMenuLabel = React.forwardRef<
  HTMLDivElement,
  AccordionMenuLabelProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-medium text-muted-foreground", className)}
    {...props}
  />
))
AccordionMenuLabel.displayName = "AccordionMenuLabel"

const AccordionMenuItem = React.forwardRef<
  HTMLDivElement,
  AccordionMenuItemProps
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 px-3 py-2 rounded-md", className)}
    data-value={value}
    {...props}
  />
))
AccordionMenuItem.displayName = "AccordionMenuItem"

const AccordionMenuSub = React.forwardRef<
  HTMLDivElement,
  AccordionMenuSubProps
>(({ className, value, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    value={value}
    className={cn("border-none", className)}
    {...props}
  />
))
AccordionMenuSub.displayName = "AccordionMenuSub"

const AccordionMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionMenuSubTriggerProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center gap-2 px-3 py-2 rounded-md font-medium transition-all hover:bg-accent hover:text-accent-foreground [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 ml-auto" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionMenuSubTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionMenuSubContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionMenuSubContentProps
>(({ className, children, parentValue: _parentValue, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-2 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionMenuSubContent.displayName = AccordionPrimitive.Content.displayName

export {
  AccordionMenu,
  AccordionMenuGroup,
  AccordionMenuLabel,
  AccordionMenuItem,
  AccordionMenuSub,
  AccordionMenuSubTrigger,
  AccordionMenuSubContent,
}
