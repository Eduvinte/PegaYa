import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type ButtonVariant = "solid" | "glass" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  solid:
    "bg-brand text-[#03242a] shadow-[0_10px_24px_rgba(23,209,199,0.34)] hover:brightness-110 active:translate-y-px",
  glass:
    "liquid-glass text-foreground hover:brightness-110 active:translate-y-px",
  outline:
    "bg-transparent border border-brand/60 text-brand-soft hover:bg-brand/10",
  ghost: "bg-transparent text-foreground hover:bg-white/8",
  danger: "bg-danger text-white hover:brightness-110 active:translate-y-px",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 rounded-xl px-3 text-sm",
  md: "h-11 rounded-2xl px-4 text-sm",
  lg: "h-12 rounded-2xl px-6 text-base",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "solid",
      size = "md",
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "liquid-focus-ring inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {leftIcon}
        <span>{loading ? "Procesando..." : children}</span>
        {rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
