import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/features/app-shell/services/getCurrentAppUser";
import { JobActions } from "@/features/company/jobs/components/JobActions";
import { createClient } from "@/lib/supabase/server";
import { Button, Card } from "@/shared/ui";

export default async function CompanyJobsPage() {
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
  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      "id, title, description, location, region, comuna, duration_value, duration_unit, extension_possible, status, created_at, companies!inner(owner_id)"
    )
    .eq("companies.owner_id", currentUser.id)
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-5">
      <header className="liquid-glass-strong rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-soft">Empresa</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Mis vacantes</h1>
            <p className="mt-2 text-sm text-muted">
              Gestiona vacantes de tu empresa y entra al detalle para revisar postulaciones visibles.
            </p>
          </div>

          <Link href="/company/jobs/new">
            <Button>Publicar vacante</Button>
          </Link>
        </div>
      </header>

      {jobs?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <Card
              key={job.id}
              variant="glass"
              title={job.title}
              description={job.description ?? "Sin descripcion"}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <MetaBlock
                  label="Ubicacion"
                  value={[job.region, job.comuna, job.location].filter(Boolean).join(" · ") || "No especificada"}
                />
                <MetaBlock
                  label="Duracion"
                  value={formatDuration(job.duration_value, job.duration_unit)}
                />
                <MetaBlock
                  label="Extension"
                  value={job.extension_possible ? "Si" : "No"}
                />
                <MetaBlock label="Estado" value={job.status === "open" ? "Abierta" : "Cerrada"} />
              </div>

              <div className="mt-4 flex justify-end">
                <Link href={`/company/jobs/${job.id}/applications`} className="mr-2">
                  <Button variant="outline" size="sm">
                    Ver postulantes
                  </Button>
                </Link>
                <Link href={`/jobs/${job.id}`}>
                  <Button variant="glass" size="sm">
                    Ver detalle
                  </Button>
                </Link>
              </div>

              <div className="mt-3">
                <JobActions
                  jobId={job.id}
                  jobTitle={job.title}
                  status={job.status === "closed" ? "closed" : "open"}
                />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card
          variant="glass"
          title="Aun no tienes vacantes"
          description="Publica tu primera vacante para empezar a recibir postulaciones."
        />
      )}
    </section>
  );
}

const MetaBlock = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
};

const formatDuration = (
  durationValue: number | null,
  durationUnit: string | null
) => {
  if (!durationValue || !durationUnit) return "No definida";
  const labels: Record<string, string> = {
    days: "dias",
    weeks: "semanas",
    months: "meses",
    years: "anos",
  };
  return `${durationValue} ${labels[durationUnit] ?? durationUnit}`;
};
