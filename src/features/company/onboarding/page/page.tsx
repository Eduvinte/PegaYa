import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/features/app-shell/services/getCurrentAppUser";
import { CompanyOnboardingForm } from "@/features/company/onboarding/components/CompanyOnboardingForm";
import { Card } from "@/shared/ui";

export default async function CompanyOnboardingPage() {
  const currentUser = await getCurrentAppUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "company") {
    redirect("/jobs");
  }

  if (currentUser.companyId) {
    redirect("/company/profile");
  }

  return (
    <section className="space-y-5">
      <header className="liquid-glass-strong rounded-3xl p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-soft">Onboarding empresa</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Crea tu empresa para empezar a publicar vacantes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Este paso se hace una sola vez. Luego podras publicar, editar y gestionar vacantes.
        </p>
      </header>

      <Card variant="glass" padding="lg" className="max-w-2xl">
        <CompanyOnboardingForm />
      </Card>
    </section>
  );
}
