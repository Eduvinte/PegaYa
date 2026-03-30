"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import { ForgotPasswordForm } from "@/features/auth/forgot-password/components/ForgotPasswordForm";
import { LoginForm } from "@/features/auth/login/components/LoginForm";
import { ResetPasswordForm } from "@/features/auth/reset-password/components/ResetPasswordForm";
import { SignUpForm } from "@/features/auth/signup/components/signUpForm";
import { Button, Card, Input, Modal } from "@/shared/ui";

export default function UiKitPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleDemoLogin = async (email: string, password: string) => {
    void password;
    toast.info(`Demo login para ${email}.`);
  };

  const handleDemoSignUp = async (email: string, password: string, role: string) => {
    void password;
    toast.info(`Demo signup para ${email} como ${role}.`);
  };

  const handleDemoForgot = async (email: string) => {
    toast.info(`Demo recovery email para ${email}.`);
  };

  const handleDemoReset = async (password: string) => {
    void password;
    toast.info("Demo reset password enviado.");
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10 md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-grid-overlay opacity-35" />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="liquid-glass rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-soft">
                Pegaya Design System
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                UI Kit de Componentes
              </h1>
            </div>
            <Link href="/">
              <Button variant="glass" size="sm">
                Volver Home
              </Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card
            title="Buttons"
            description="Variantes, tamanos y estados para acciones primarias y secundarias."
            variant="glass"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="solid">Solid</Button>
                <Button variant="glass">Glass</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
              <Button fullWidth variant="glass">
                Full Width CTA
              </Button>
            </div>
          </Card>

          <Card
            title="Inputs"
            description="Campos reutilizables con label, helper, error y slots."
            variant="glass"
          >
            <div className="space-y-4">
              <Input
                label="Email"
                placeholder="you@company.com"
                helperText="Este campo acepta correo corporativo."
              />
              <Input label="Busqueda" placeholder="Frontend, React, Remote..." variant="default" />
              <Input
                label="Con icono"
                placeholder="Buscar..."
                leftSlot="Q"
                rightSlot="K"
                helperText="Slots para iconos o atajos."
              />
              <Input
                label="Estado error"
                placeholder="Ejemplo invalido"
                error="Este valor no cumple el formato esperado."
              />
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card
            variant="glass"
            title="Card Glass"
            description="Ideal para listas y secciones de producto."
          />
          <Card
            variant="glassStrong"
            title="Card Glass Strong"
            description="Mayor contraste para foco visual."
          />
          <Card
            variant="outline"
            title="Card Outline"
            description="Uso util para zonas neutras y layout."
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card
            variant="glass"
            title="Modal"
            description="Componente global para confirmaciones, formularios y flujos secundarios."
          >
            <Button variant="glass" onClick={() => setModalOpen(true)}>
              Abrir Modal Demo
            </Button>
          </Card>

          <Card title="Paleta Base" description="Tokens principales usados por el sistema." variant="glass">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <ColorSwatch name="brand-300" color="var(--brand-300)" />
              <ColorSwatch name="brand-400" color="var(--brand-400)" />
              <ColorSwatch name="brand-500" color="var(--brand-500)" />
              <ColorSwatch name="accent-500" color="var(--accent-500)" />
              <ColorSwatch name="bg-elevated" color="var(--bg-elevated)" />
              <ColorSwatch name="bg-panel" color="var(--bg-panel)" />
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-soft">
              Feature Components
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Auth Forms</h2>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card variant="glassStrong" padding="lg">
              <LoginForm compact showForgotLink={false} handleLogin={handleDemoLogin} />
            </Card>

            <Card variant="glassStrong" padding="lg">
              <SignUpForm compact handleSignUp={handleDemoSignUp} />
            </Card>

            <Card variant="glassStrong" padding="lg">
              <ForgotPasswordForm compact handleSubmit={handleDemoForgot} />
            </Card>

            <Card variant="glassStrong" padding="lg">
              <ResetPasswordForm compact handleSubmit={handleDemoReset} />
            </Card>
          </div>
        </section>
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal Preview"
        description="Ejemplo de composicion con footer custom."
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setModalOpen(false)}>Aceptar</Button>
          </div>
        }
      >
        <p className="text-sm text-muted">
          Este modal usa el estilo liquid glass, cierra con fondo, tecla Escape y boton de accion.
        </p>
      </Modal>
    </main>
  );
}

function ColorSwatch({ name, color }: { name: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-black/20 p-2">
      <div className="h-10 rounded-md" style={{ background: color }} />
      <p className="mt-2 text-xs text-muted">{name}</p>
    </div>
  );
}
