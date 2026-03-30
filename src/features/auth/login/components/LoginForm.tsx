"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { Button, Input, LightParticles } from "@/shared/ui";

type LoginFormProps = {
  handleLogin: (email: string, password: string) => Promise<void>;
  compact?: boolean;
  className?: string;
  showForgotLink?: boolean;
};

const LOGIN_POINTS = [
  "Postula en minutos a vacantes activas.",
  "Haz seguimiento de tus procesos en un solo lugar.",
  "Conversa directo con empresas desde la plataforma.",
];

export const LoginForm = ({
  handleLogin,
  compact = false,
  className,
  showForgotLink = true,
}: LoginFormProps) => {
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
            <p className="text-xs uppercase tracking-[0.2em] text-brand-soft">Acceso candidatos</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Encuentra vacantes en Chile y postula rapido.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Inicia sesion para revisar vacantes nuevas por dia, semana o proyecto de largo plazo.
            </p>

            <div className="mt-5 space-y-2.5">
              {LOGIN_POINTS.map((item) => (
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

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Inicia sesion</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Accede para gestionar tus postulaciones y conversaciones.
          </p>

          <form
            className={cn("mt-6 space-y-4", compact ? "" : "max-w-md")}
            onSubmit={(e) => {
              e.preventDefault();
              const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
              const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
              handleLogin(email, password);
            }}
          >
            <Input id="login-email" name="email" type="email" label="Correo" required />

            <Input id="login-password" name="password" type="password" label="Contrasena" required />

            {showForgotLink ? (
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-brand-soft hover:text-brand">
                  ¿Olvidaste tu clave?
                </Link>
              </div>
            ) : null}

            <Button type="submit" fullWidth>
              Ingresar
            </Button>
          </form>

          <p className="mt-5 text-sm text-muted">
            ¿No tienes cuenta?{" "}
            <Link href="/signup" className="font-medium text-brand-soft hover:text-brand">
              Crear cuenta
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};
