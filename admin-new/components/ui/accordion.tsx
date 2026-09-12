"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function Accordion({
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
    return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
    className,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
    return (
        <AccordionPrimitive.Item
            data-slot="accordion-item"
            className={cn(
                "rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden",
                className
            )}
            {...props}
        />
    );
}

function AccordionTrigger({
    className,
    children,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
    return (
        <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
                data-slot="accordion-trigger"
                className={cn(
                    "w-full text-left p-space-lg flex justify-between items-center gap-space-md",
                    "font-title-lg text-title-lg text-on-surface font-medium",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    "[&[data-state=open]>svg]:rotate-180",
                    className
                )}
                {...props}
            >
                {children}
                <ChevronDown className="size-5 shrink-0 text-on-surface-variant transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    );
}

function AccordionContent({
    className,
    children,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
    return (
        <AccordionPrimitive.Content
            data-slot="accordion-content"
            className="overflow-hidden text-body-md data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
            {...props}
        >
            <div
                className={cn(
                    "px-space-lg pb-space-lg text-on-surface-variant font-body-md text-body-md",
                    className
                )}
            >
                {children}
            </div>
        </AccordionPrimitive.Content>
    );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };