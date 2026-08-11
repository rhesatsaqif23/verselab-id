import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "#/lib/utils.ts"

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "relative overflow-hidden bg-gradient-to-r from-[var(--btn-from)] via-[var(--btn-via)] to-[var(--btn-to)] text-[var(--btn-text)] hover:brightness-105 active:scale-[0.98]",
        destructive:
          "relative overflow-hidden bg-gradient-to-r from-[var(--btn-destructive-from)] via-[var(--btn-destructive-via)] to-[var(--btn-destructive-to)] text-[var(--btn-destructive-text)] hover:brightness-105 active:scale-[0.98]",
        outline:
          "relative overflow-hidden border-2 border-[var(--btn-outline-border)] bg-gradient-to-r from-[var(--btn-outline-from)] to-[var(--btn-outline-to)] text-[var(--btn-outline-text)] hover:border-[var(--btn-outline-border)]/60 active:scale-[0.98]",
        secondary:
          "bg-muted text-muted-foreground hover:bg-muted/80 active:scale-[0.98]",
        ghost:
          "text-[var(--btn-ghost-text)] hover:bg-[var(--btn-ghost-hover)] hover:text-[var(--btn-ghost-hover-text)] active:bg-[var(--btn-ghost-active)]",
        link: "text-[var(--btn-ghost-text)] underline-offset-4 hover:underline hover:text-[var(--btn-ghost-hover-text)]",
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
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  const hasGlow = variant === "default" || variant === "destructive"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {hasGlow && (
        <>
          <span
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <span
              className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
              style={{ animation: "btn-shimmer 3s ease-in-out infinite" }}
            />
          </span>
        </>
      )}
      <span className="relative z-20">{children}</span>
    </Comp>
  )
}

export { Button, buttonVariants }
