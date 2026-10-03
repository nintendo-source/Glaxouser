import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const tapScale = "active:not-disabled:scale-[0.96]";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium select-none transition-[transform,background-color,color,opacity,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gx-accent",
  {
    variants: {
      variant: {
        primary: "bg-gx-accent text-gx-accent-fg hover:opacity-90",
        hot: "bg-gx-hot text-gx-hot-fg hover:opacity-90",
        ghost: "bg-transparent text-gx-muted hover:bg-gx-elevated hover:text-gx-fg",
        quiet: "bg-gx-elevated text-gx-fg hover:bg-gx-accent-soft",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-[var(--radius-sm)]",
        md: "h-11 px-4 text-sm rounded-[var(--radius-md)]",
        lg: "h-12 px-5 text-base rounded-[var(--radius-md)]",
        icon: "size-11 rounded-[var(--radius-md)]",
        rail: "size-11 rounded-[var(--radius-sm)]",
      },
      static: {
        true: "",
        false: tapScale,
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      static: false,
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    static?: boolean;
  };

export function Button({ className, variant, size, static: isStatic, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, static: isStatic }), className)}
      {...props}
    />
  );
}
