"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button/Button";

type ModalSize = "sm" | "md" | "lg";

const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
  size?: ModalSize;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeOnBackdrop = true,
  size = "md",
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#021117]/55 p-4 backdrop-blur-sm"
      onClick={() => {
        if (closeOnBackdrop) onClose();
      }}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        className={cn(
          "liquid-glass-strong w-full rounded-3xl p-6",
          "border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.42)]",
          sizeStyles[size],
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="text-2xl font-semibold tracking-tight">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar modal">
            Cerrar
          </Button>
        </header>

        <div>{children}</div>

        {footer ? <footer className="mt-6">{footer}</footer> : null}
      </section>
    </div>
  );
}
