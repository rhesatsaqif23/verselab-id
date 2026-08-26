// shadcn/ui button component.
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "#/libs/utils.ts";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "relative overflow-hidden bg-linear-to-r from-(--btn-from) to-(--btn-to) text-(--btn-text) shadow-[0_5px_0_0_var(--btn-shadow),0_6px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_0_0_var(--btn-shadow),0_5px_12px_rgba(0,0,0,0.12)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_2px_0_0_var(--btn-shadow),0_3px_8px_rgba(0,0,0,0.1)]",
        destructive:
          "relative overflow-hidden bg-linear-to-r from-(--btn-destructive-from) via-(--btn-destructive-via) to-(--btn-destructive-to) text-(--btn-destructive-text) shadow-[0_5px_0_0_var(--btn-destructive-shadow),0_6px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_0_0_var(--btn-destructive-shadow),0_5px_12px_rgba(0,0,0,0.12)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_2px_0_0_var(--btn-destructive-shadow),0_3px_8px_rgba(0,0,0,0.1)]",
        outline:
          "relative overflow-hidden border-2 border-(--btn-outline-border) bg-card text-(--btn-outline-text) shadow-xs hover:border-primary/50 hover:bg-accent/5 active:scale-[0.98]",
        secondary:
          "relative overflow-hidden bg-linear-to-r from-(--btn-secondary-from) via-(--btn-secondary-via) to-(--btn-secondary-to) text-(--btn-secondary-text) shadow-[0_4px_0_0_var(--btn-shadow),0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_3px_0_0_var(--btn-shadow),0_4px_10px_rgba(0,0,0,0.06)] hover:brightness-103 active:translate-y-[2px] active:shadow-[0_1px_0_0_var(--btn-shadow),0_2px_6px_rgba(0,0,0,0.06)]",
        ghost:
          "text-(--btn-ghost-text) hover:bg-(--btn-ghost-hover) hover:text-(--btn-ghost-hover-text) active:bg-(--btn-ghost-active)",
        link: "text-(--btn-ghost-text) underline-offset-4 hover:underline hover:text-(--btn-ghost-hover-text)",
      },
      size: {
        default: "h-11 px-6 py-2.5 has-[>svg]:px-5",
        xs: "h-6 gap-1 rounded-full px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-full px-3.5 has-[>svg]:px-2.5",
        lg: "h-12 rounded-full px-8 text-base has-[>svg]:px-6",
        icon: "size-9",
        "icon-xs": "size-6 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  if (asChild) {
    return (
      <Slot.Root
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot.Root>
    );
  }

  const Comp = "button";

  const hasShimmer = variant === "default" || variant === "destructive" || variant === "secondary";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {hasShimmer && !props.disabled && (
        <>
          <span
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <span
              className="absolute inset-y-0 -left-full w-1/2 bg-linear-to-r from-transparent via-(--color-primary-soft)/30 to-transparent"
              style={{ animation: "btn-shimmer 3s ease-in-out infinite" }}
            />
          </span>
        </>
      )}
      <span className="relative z-20">{children}</span>
    </Comp>
  );
}

export { Button, buttonVariants };
