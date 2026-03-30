"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Button, Input, LightParticles } from "@/shared/ui";

type SignUpFormProps = {
  handleSignUp: (
    email: string,
    password: string,
    role: string,
    fullName: string,
    bio: string
  ) => Promise<void>;
  compact?: boolean;
  className?: string;
};

const SIGNUP_POINTS = [
  "Crea perfil como candidato o empresa.",
  "Publica vacantes y recibe postulaciones ordenadas.",
  "Mantiene seguimiento de cada proceso de seleccion.",
];

export const SignUpForm = ({ handleSignUp, compact = false, className }: SignUpFormProps) => {
  const [error, setError] = useState<string | null>(null);

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
            <p className="text-xs uppercase tracking-[0.2em] text-brand-soft">Registro</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Activa tu cuenta y empieza a contratar o postular hoy.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Pensado para empresas y trabajadores en Chile, con procesos claros y rapidos.
            </p>

            <div className="mt-5 space-y-2.5">
              {SIGNUP_POINTS.map((item) => (
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

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Crea tu cuenta</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Registra tus datos para comenzar a postular o publicar vacantes.
          </p>

          <form
            className={cn("mt-6 space-y-4", compact ? "" : "max-w-md")}
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);

              const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
              const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
              const confirmPassword = (
                e.currentTarget.elements.namedItem("confirmPassword") as HTMLInputElement
              ).value;
              const role = (e.currentTarget.elements.namedItem("role") as HTMLSelectElement).value;
              const fullName = (e.currentTarget.elements.namedItem("fullName") as HTMLInputElement).value.trim();
              const bio = (e.currentTarget.elements.namedItem("bio") as HTMLTextAreaElement).value.trim();

              if (password !== confirmPassword) {
                setError("Las contrasenas no coinciden.");
                return;
              }

              if (!fullName) {
                setError("Ingresa tu nombre completo.");
                return;
              }

              handleSignUp(email, password, role, fullName, bio);
            }}
          >
            <Input id="signup-full-name" name="fullName" type="text" label="Nombre completo" required />

            <Input id="signup-email" name="email" type="email" label="Correo" required />

            <Input id="signup-password" name="password" type="password" label="Contrasena" required />

            <Input
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              label="Repite tu contrasena"
              required
            />

            <div className="space-y-2">
              <label
                className="block text-sm font-medium tracking-wide text-foreground"
                htmlFor="role"
              >
                Tipo de cuenta
              </label>
              <select
                id="role"
                name="role"
                required
                className="liquid-focus-ring liquid-glass w-full rounded-2xl px-3 py-2.5 text-sm text-foreground outline-none"
              >
                <option value="candidate" className="bg-[#08212a]">
                  Candidato
                </option>
                <option value="company" className="bg-[#08212a]">
                  Empresa
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium tracking-wide text-foreground" htmlFor="bio">
                Sobre ti (opcional)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                className="liquid-focus-ring liquid-glass w-full rounded-2xl px-3 py-2.5 text-sm text-foreground outline-none"
                placeholder="Cuéntanos una breve descripción de tu perfil."
              />
            </div>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <Button type="submit" fullWidth>
              Crear cuenta
            </Button>
          </form>

          <p className="mt-5 text-sm text-muted">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-brand-soft hover:text-brand">
              Inicia sesion
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};
