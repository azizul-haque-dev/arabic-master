import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-default text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-sm shadow-primary/20 transition-all hover:bg-[#554ce8] hover:shadow-md hover:shadow-primary/30 active:translate-y-px active:scale-[0.98]",
        secondary:
          "bg-surface text-primary-light border border-primary-light/25 hover:bg-primary-light/10 hover:border-primary-light/45",
        outline:
          "bg-surface text-white border border-white/15 hover:bg-[#343052] hover:border-primary/35",
        ghost:
          "bg-transparent text-white/75 hover:bg-[#343052] hover:text-white",
        destructive:
          "bg-transparent text-error-text hover:bg-error-bg",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-[13px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
