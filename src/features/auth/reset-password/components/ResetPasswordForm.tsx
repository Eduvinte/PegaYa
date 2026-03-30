"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { Button, Input, LightParticles } from "@/shared/ui";

type ResetPasswordFormProps = {
  handleSubmit: (password: string) => Promise<void>;
  compact?: boolean;
  className?: string;
};

const RESET_POINTS = [
  "Usa una clave unica que no repitas en otros servicios.",
  "Actualiza tu acceso en menos de un minuto.",
  "Al finalizar podras volver a login y continuar tu proceso.",
];

export const ResetPasswordForm = ({
  handleSubmit,
  compact = false,
  className,
}: ResetPasswordFormProps) => {
  return (
    <div
      className={cn(
        compact
          ? "w-full"
          : "relative flex min-h-screen items-start px-4 py-6 sm:px-6 sm:py-10 lg:items-center lg:px-10",
        className
      )}
    >
      {!compact ? <LightParticles level="low" className="opacity-55" /> : null}

      <div
        className={cn(
          compact ? "w-full" : "relative mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[1.05fr_0.95fr]"
        )}
      >
        {!compact ? (
          <aside className="liquid-glass order-2 rounded-3xl p-5 sm:p-6 lg:order-1 lg:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-soft">Nueva clave</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Protege tu cuenta con un cambio rapido y seguro.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Este paso asegura que solo tu puedas retomar el acceso a tus postulaciones y vacantes.
            </p>

            <div className="mt-5 space-y-2.5">
              {RESET_POINTS.map((item) => (
                <div key={item} className="rounded-2xl border border-white/20 bg-white/[0.06] px-3.5 py-2.5">
                  <p className="text-sm text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </aside>
        ) : null}

        <section
          className={cn(
            "order-1 w-full",
            compact ? "" : "liquid-glass-strong rounded-3xl p-5 sm:p-6 lg:order-2 lg:p-8"
          )}
        >
          {!compact ? (
            <Link href="/" className="mb-5 inline-flex text-sm text-brand-soft hover:text-brand">
              ← Volver al inicio
            </Link>
          ) : null}

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Define tu nueva clave</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">Ingresa una contrasena segura para tu cuenta.</p>

          <form
            className={cn("mt-6 space-y-4", compact ? "" : "max-w-md")}
            onSubmit={(e) => {
              e.preventDefault();
              const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
              handleSubmit(password);
            }}
          >
            <Input
              id="reset-password"
              name="password"
              type="password"
              label="Nueva contrasena"
              required
            />

            <Button type="submit" fullWidth>
              Guardar contrasena
            </Button>
          </form>

          <p className="mt-5 text-sm text-muted">
            ¿Prefieres volver?{" "}
            <Link href="/login" className="font-medium text-brand-soft hover:text-brand">
              Ir a login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};
