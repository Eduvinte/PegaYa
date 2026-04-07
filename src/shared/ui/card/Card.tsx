import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type CardVariant = "solid" | "glass" | "glassStrong" | "outline";
type CardPadding = "none" | "sm" | "md" | "lg";

const variantStyles: Record<CardVariant, string> = {
  solid: "bg-surface/80 border border-white/10",
  glass: "liquid-glass",
  glassStrong: "liquid-glass-strong",
  outline: "bg-transparent border border-white/20",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  variant?: CardVariant;
  padding?: CardPadding;
  title?: ReactNode;
  description?: ReactNode;
};

export function Card({
  variant = "glass",
  padding = "md",
  title,
  description,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl text-foreground",
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {title ? <h3 className="text-xl font-semibold tracking-tight">{title}</h3> : null}
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      {children ? <div className={cn(title || description ? "mt-4" : "")}>{children}</div> : null}
    </div>
  );
}
