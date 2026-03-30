"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { Button, Input, LightParticles } from "@/shared/ui";

type ForgotPasswordFormProps = {
  handleSubmit: (email: string) => Promise<void>;
  compact?: boolean;
  className?: string;
};

const RECOVERY_POINTS = [
  "Recibes el enlace de recuperacion en segundos.",
  "El enlace permite cambiar tu clave de forma segura.",
  "Luego puedes volver a login y continuar tu proceso.",
];

export const ForgotPasswordForm = ({
  handleSubmit,
  compact = false,
  className,
}: ForgotPasswordFormProps) => {
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
            <p className="text-xs uppercase tracking-[0.2em] text-brand-soft">Seguridad de cuenta</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Recupera acceso sin perder tu avance.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Mantiene el control de tu cuenta y vuelve rapido a postular o gestionar vacantes.
            </p>

            <div className="mt-5 space-y-2.5">
              {RECOVERY_POINTS.map((item) => (
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

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Recuperar contrasena</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Te enviaremos un enlace para restablecer tu clave.
          </p>

          <form
            className={cn("mt-6 space-y-4", compact ? "" : "max-w-md")}
            onSubmit={(e) => {
              e.preventDefault();
              const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
              handleSubmit(email);
            }}
          >
            <Input id="forgot-password-email" name="email" type="email" label="Correo" required />

            <Button type="submit" fullWidth>
              Enviar enlace
            </Button>
          </form>

          <p className="mt-5 text-sm text-muted">
            ¿Recordaste tu clave?{" "}
            <Link href="/login" className="font-medium text-brand-soft hover:text-brand">
              Volver a login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};
