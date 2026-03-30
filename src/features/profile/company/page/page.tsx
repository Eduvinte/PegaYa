import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/features/app-shell/services/getCurrentAppUser";
import { CompanyProfileForm } from "@/features/profile/company/components/CompanyProfileForm";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/shared/ui";

export default async function CompanyProfilePage() {
  const currentUser = await getCurrentAppUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "company") {
    redirect("/jobs");
  }

  if (!currentUser.companyId) {
    redirect("/company/onboarding");
  }

  const supabase = await createClient();
  const [{ data: company }, { data: profile }] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name, description, verified, created_at, website, industry, company_size, founded_year, hq_city, hq_region")
      .eq("owner_id", currentUser.id)
      .maybeSingle(),
    supabase.from("profiles").select("avatar_url").eq("id", currentUser.id).maybeSingle(),
  ]);

  return (
    <section className="space-y-5">
      <header className="liquid-glass-strong rounded-3xl p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-soft">Empresa</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Perfil empresa</h1>
        <p className="mt-2 text-sm text-muted">
          Datos visibles de la empresa para vacantes y reputacion en la plataforma.
        </p>
      </header>

      <Card variant="glass" padding="lg">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetaBlock label="Nombre" value={company?.name ?? "Sin definir"} />
          <MetaBlock label="Verificada" value={company?.verified ? "Si" : "No"} />
          <MetaBlock
            label="Creada"
            value={
              company?.created_at
                ? new Date(company.created_at).toLocaleDateString("es-CL")
                : "No disponible"
            }
          />
          <MetaBlock label="Descripcion" value={company?.description ?? "Sin descripcion"} />
          <MetaBlock label="Website" value={company?.website ?? "Sin website"} />
          <MetaBlock label="Industria" value={company?.industry ?? "Sin industria"} />
          <MetaBlock label="Tamano" value={company?.company_size ?? "Sin dato"} />
          <MetaBlock label="Correo owner" value={currentUser.email} />
        </div>
      </Card>

      {company ? (
        <Card variant="glass" padding="lg" title="Editar perfil empresa">
          <CompanyProfileForm
            initialValues={{
              companyId: company.id,
              name: company.name ?? "",
              description: company.description ?? "",
              website: company.website ?? "",
              industry: company.industry ?? "",
              companySize: company.company_size ?? "",
              foundedYear: company.founded_year ?? null,
              hqCity: company.hq_city ?? "",
              hqRegion: company.hq_region ?? "",
              avatarUrl: profile?.avatar_url ?? "",
            }}
          />
        </Card>
      ) : null}
    </section>
  );
}

const MetaBlock = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
};
