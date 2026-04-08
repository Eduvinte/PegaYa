import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { AcceptSelectionButton } from "@/features/applications/list/components/AcceptSelectionButton";
import { DeclineSelectionButton } from "@/features/applications/list/components/DeclineSelectionButton";
import { getCurrentAppUser } from "@/features/app-shell/services/getCurrentAppUser";
import { createClient } from "@/lib/supabase/server";
import { isJobExpired } from "@/shared/lib/jobExpiry";
import { Card } from "@/shared/ui";

export default async function ApplicationsListPage() {
  const currentUser = await getCurrentAppUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "candidate") {
    redirect("/jobs");
  }

  const supabase = await createClient();
  const { data: applications } = await supabase
    .from("applications")
    .select(
      "id, status, created_at, jobs(id, title, location, region, comuna, work_start_date, duration_value, duration_unit, extension_possible, salary, status, created_at, companies(name, owner_id))"
    )
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-5">
      <header className="liquid-glass-strong rounded-3xl p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-soft">Candidato</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Mis postulaciones</h1>
        <p className="mt-2 text-sm text-muted">
          Revisa el estado de tus postulaciones y vuelve al detalle de la vacante cuando lo necesites.
        </p>
      </header>

      {applications?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {applications.map((application) => {
            const job = extractFirst(application.jobs);
            const companyName = extractCompanyName(job?.companies);
            const companyOwnerId = extractCompanyOwnerId(job?.companies);
            const jobExpired = isJobExpired({
              workStartDate: job?.work_start_date,
            });
            const canAccept =
              application.status === "selected_by_company" &&
              Boolean(companyOwnerId) &&
              Boolean(job?.id) &&
              !jobExpired;
            const canDecline =
              (application.status === "selected_by_company" || application.status === "accepted_by_candidate") &&
              Boolean(companyOwnerId) &&
              Boolean(job?.id) &&
              !jobExpired;

            return (
              <Card
                key={application.id}
                variant="glass"
                title={job?.title ?? "Vacante no disponible"}
                description={
                  companyName
                    ? `Empresa: ${companyName}`
                    : "No tienes acceso al detalle de esta vacante (cerrada o eliminada)."
                }
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <MetaBlock
                    label="Estado postulacion"
                    value={formatApplicationStatus(application.status)}
                    badge={<StatusBadge status={application.status} />}
                  />
                  <MetaBlock label="Fecha postulacion" value={formatDate(application.created_at)} />
                  <MetaBlock label="Estado vacante" value={job?.status === "open" ? "Abierta" : "Cerrada"} />
                  <MetaBlock label="Ubicacion" value={formatLocation(job)} />
                  <MetaBlock label="Duracion" value={formatDuration(job)} />
                  <MetaBlock label="Dia de trabajo" value={formatJobDate(job?.work_start_date)} />
                  <MetaBlock label="Extension" value={job?.extension_possible ? "Si" : "No"} />
                  <MetaBlock label="Sueldo" value={formatSalary(job?.salary)} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {job?.id ? (
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex h-10 items-center rounded-xl border border-brand-soft/40 bg-white/[0.02] px-4 text-sm font-semibold text-brand-soft transition hover:border-brand-strong/60 hover:text-brand-strong"
                    >
                      Ver detalle vacante
                    </Link>
                  ) : null}
                  {canAccept ? (
                    <AcceptSelectionButton
                      applicationId={application.id}
                      companyOwnerId={companyOwnerId}
                      jobId={job?.id ?? ""}
                      jobTitle={job?.title ?? "Vacante"}
                    />
                  ) : null}
                  {canDecline ? (
                    <DeclineSelectionButton
                      applicationId={application.id}
                      companyOwnerId={companyOwnerId}
                      jobId={job?.id ?? ""}
                      jobTitle={job?.title ?? "Vacante"}
                    />
                  ) : null}
                  {jobExpired ? (
                    <p className="text-xs text-muted">La vacante vencio. Ya no hay acciones disponibles.</p>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card
          variant="glass"
          title="Aun no tienes postulaciones"
          description="Cuando postules a una vacante, la veras listada aqui."
        />
      )}
    </section>
  );
}

const MetaBlock = ({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: ReactNode;
}) => {
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-foreground">{value}</p>
        {badge}
      </div>
    </div>
  );
};

const formatApplicationStatus = (status: string) => {
  if (status === "selected_by_company") {
    return "Fuiste seleccionado por la empresa (pendiente tu confirmacion)";
  }
  if (status === "accepted_by_candidate") {
    return "Confirmaste tu interes. Si desistes, la vacante se reabrira.";
  }
  if (status === "accepted") {
    return "Contratacion confirmada por empresa";
  }
  if (status === "rejected") {
    return "Rechazada";
  }
  return "Pendiente";
};

const formatDate = (value: string | null) => {
  if (!value) {
    return "Sin fecha";
  }
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatLocation = (job: {
  location?: string | null;
  region?: string | null;
  comuna?: string | null;
} | null) => {
  if (!job) {
    return "No especificada";
  }
  if (job.region || job.comuna) {
    return [job.comuna, job.region].filter(Boolean).join(", ");
  }
  return job.location ?? "No especificada";
};

const formatDuration = (job: {
  duration_value?: number | null;
  duration_unit?: string | null;
} | null) => {
  if (!job?.duration_value || !job.duration_unit) {
    return "No especificada";
  }
  const unitMap: Record<string, string> = {
    days: "dias",
    weeks: "semanas",
    months: "meses",
    years: "anios",
  };
  return `${job.duration_value} ${unitMap[job.duration_unit] ?? job.duration_unit}`;
};

const formatSalary = (salary: number | null | undefined) => {
  if (salary == null) {
    return "No informado";
  }
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(salary);
};

const formatJobDate = (value: string | null | undefined) => {
  if (!value) return "No definida";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const StatusBadge = ({ status }: { status: string }) => {
  const styleByStatus: Record<string, string> = {
    pending: "border-white/20 bg-white/10 text-foreground/85",
    selected_by_company: "border-cyan-300/40 bg-cyan-400/20 text-cyan-100",
    accepted_by_candidate: "border-emerald-300/40 bg-emerald-400/20 text-emerald-100",
    accepted: "border-green-300/40 bg-green-400/20 text-green-100",
    rejected: "border-rose-300/40 bg-rose-400/20 text-rose-100",
  };
  const labelByStatus: Record<string, string> = {
    pending: "Pendiente",
    selected_by_company: "Seleccionado por empresa",
    accepted_by_candidate: "Confirmada por ti",
    accepted: "Aceptada",
    rejected: "Rechazada",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${
        styleByStatus[status] ?? styleByStatus.pending
      }`}
    >
      {labelByStatus[status] ?? "Pendiente"}
    </span>
  );
};

const extractFirst = <T,>(value: T | T[] | null): T | null => {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
};

const extractCompanyName = (companies: unknown) => {
  const company = extractFirst(companies as { name?: string } | { name?: string }[] | null);
  return company?.name ?? null;
};

const extractCompanyOwnerId = (companies: unknown) => {
  const company = extractFirst(
    companies as { owner_id?: string } | { owner_id?: string }[] | null
  );
  return company?.owner_id ?? "";
};
