import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/features/app-shell/services/getCurrentAppUser";
import { CreateJobForm } from "@/features/company/jobs/new/components/CreateJobForm";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/shared/ui";

export default async function CompanyNewJobPage() {
  const currentUser = await getCurrentAppUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "company") {
    redirect("/jobs");
  }

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("owner_id", currentUser.id)
    .maybeSingle();

  if (!company) {
    redirect("/company/onboarding");
  }

  return (
    <section className="space-y-5">
      <header className="liquid-glass-strong rounded-3xl p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-soft">Empresa</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Publicar vacante</h1>
        <p className="mt-2 text-sm text-muted">
          Empresa activa: {company.name}. Completa los datos y publica la vacante.
        </p>
      </header>

      <Card variant="glass" padding="lg" className="max-w-2xl">
        <CreateJobForm companyId={company.id} />
      </Card>
    </section>
  );
}
