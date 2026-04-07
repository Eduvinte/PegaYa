import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentAppUser } from "@/features/app-shell/services/getCurrentAppUser";
import { ApplyButton } from "@/features/jobs/detail/components/ApplyButton";
import { getJobDetail } from "@/features/jobs/detail/services/getJobDetail";
import { Button, Card } from "@/shared/ui";

type JobDetailPageProps = {
  jobId: string;
};

export default async function JobDetailPage({ jobId }: JobDetailPageProps) {
  const currentUser = await getCurrentAppUser();

  if (!currentUser) {
    notFound();
  }

  const job = await getJobDetail(jobId, currentUser.id);

  if (!job) {
    return (
      <Card
        variant="glass"
        title="Vacante no disponible"
        description="No encontramos la vacante solicitada o ya no tienes acceso."
      />
    );
  }

  const isCandidate = currentUser.role === "candidate";
  const isCompany = currentUser.role === "company";
  const isOwnerCompany = isCompany && Boolean(currentUser.companyId) && currentUser.companyId === job.companyId;
  const canApply = isCandidate && job.status === "open" && !job.hasApplied;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link href="/jobs" className="text-sm text-brand-soft hover:text-brand">
          ← Volver al feed
        </Link>
        <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-muted">
          {job.status === "open" ? "Vacante abierta" : "Vacante cerrada"}
        </span>
      </div>

      <Card
        variant="glassStrong"
        title={job.title}
        description={`Publicada por ${job.companyName}`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetaBlock
            label="Ubicacion"
            value={[job.region, job.comuna, job.location].filter(Boolean).join(" · ") || "No especificada"}
          />
          <MetaBlock
            label="Sueldo"
            value={job.salary ? formatCurrency(job.salary) : "A convenir"}
          />
          <MetaBlock label="Duracion" value={formatDuration(job.durationValue, job.durationUnit)} />
          <MetaBlock
            label="Extension"
            value={job.extensionPossible ? "Si, posible extension" : "Sin extension"}
          />
          <MetaBlock
            label="Postulaciones visibles"
            value={`${job.visibleApplicationsCount}`}
          />
          <MetaBlock
            label="Estado"
            value={job.status === "open" ? "Abierta" : "Cerrada"}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-white/15 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Descripcion</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {job.description ?? "La empresa aun no agrego una descripcion."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {isOwnerCompany ? (
            <Link href={`/company/jobs/${job.id}/applications`}>
              <Button type="button" variant="glass">
                Ver postulaciones visibles ({job.visibleApplicationsCount})
              </Button>
            </Link>
          ) : canApply ? (
            <ApplyButton jobId={job.id} />
          ) : job.hasApplied ? (
            <Button type="button" variant="glass" disabled>
              Ya postulaste
            </Button>
          ) : (
            <Button type="button" variant="glass" disabled>
              {isCandidate ? "Vacante cerrada" : "Solo candidatos pueden postular"}
            </Button>
          )}
        </div>
      </Card>
    </section>
  );
}

const MetaBlock = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDuration = (
  durationValue: number | null,
  durationUnit: "days" | "weeks" | "months" | "years" | null
) => {
  if (!durationValue || !durationUnit) return "No definida";
  const labels: Record<"days" | "weeks" | "months" | "years", string> = {
    days: "dias",
    weeks: "semanas",
    months: "meses",
    years: "anos",
  };
  return `${durationValue} ${labels[durationUnit]}`;
};
