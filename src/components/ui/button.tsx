import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_6px_18px_rgba(124,108,240,0.35)] hover:brightness-110",
        teal:
          "bg-teal text-white shadow-[0_6px_18px_rgba(20,184,166,0.35)] hover:brightness-110",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_6px_18px_rgba(239,68,68,0.3)] hover:brightness-110",
        outline:
          "border border-border bg-card/60 backdrop-blur hover:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:brightness-105",
        ghost: "hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-xl px-3.5",
        lg: "h-13 rounded-2xl px-7 text-base",
        icon: "size-11 rounded-2xl",
        pill: "h-11 rounded-full px-6",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
