import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type InputVariant = "default" | "glass";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  variant?: InputVariant;
  containerClassName?: string;
  inputClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftSlot,
      rightSlot,
      variant = "glass",
      id,
      containerClassName,
      inputClassName,
      className,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const isInvalid = !!error;

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium tracking-wide text-foreground"
          >
            {label}
          </label>
        )}

        <div className={cn("relative", containerClassName)}>
          {leftSlot && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
              {leftSlot}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "liquid-focus-ring w-full rounded-2xl border px-3 py-2.5 text-sm text-foreground outline-none transition-all duration-300",
              "placeholder:text-muted/80",
              Boolean(leftSlot) && "pl-10",
              Boolean(rightSlot) && "pr-10",
              variant === "glass" &&
                "liquid-glass border-transparent shadow-[inset_0_1px_0_rgba(209,255,255,0.22)]",
              variant === "default" && "bg-surface/70",
              isInvalid && "border-danger focus-visible:outline-danger",
              inputClassName
            )}
            aria-invalid={isInvalid}
            {...props}
          />

          {rightSlot && (
            <span className="absolute inset-y-0 right-3 flex items-center text-muted">{rightSlot}</span>
          )}
        </div>

        {error ? (
          <p className="mt-2 text-sm text-danger">{error}</p>
        ) : helperText ? (
          <p className="mt-2 text-sm text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
