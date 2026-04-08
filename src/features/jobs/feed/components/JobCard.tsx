import Link from "next/link";
import type { JobFeedItem } from "@/features/jobs/feed/services/getJobsFeed";
import { Button, Card } from "@/shared/ui";

type JobCardProps = {
  job: JobFeedItem;
};

export const JobCard = ({ job }: JobCardProps) => {
  return (
    <Card
      variant="glass"
      padding="md"
      className="flex h-full flex-col justify-between"
      title={job.title}
      description={job.description ? clipDescription(job.description) : "Sin descripcion disponible."}
    >
      <div className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <MetaBlock label="Empresa" value={job.companyName} />
          <MetaBlock
            label="Ubicacion"
            value={[job.region, job.comuna, job.location].filter(Boolean).join(" · ") || "No especificada"}
          />
          <MetaBlock
            label="Duracion"
            value={formatDuration(job.durationValue, job.durationUnit)}
          />
          <MetaBlock label="Dia de trabajo" value={formatJobDate(job.workStartDate)} />
          <MetaBlock
            label="Extension"
            value={job.extensionPossible ? "Si, posible extension" : "Sin extension"}
          />
          <MetaBlock
            label="Estado"
            value={job.status === "open" ? "Abierta" : "Cerrada"}
          />
          <MetaBlock label="Postulaciones visibles" value={`${job.visibleApplicationsCount}`} />
        </div>

        <div className="flex justify-end">
          <Link href={`/jobs/${job.id}`}>
            <Button size="sm">Ver detalle</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

const MetaBlock = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
};

const clipDescription = (value: string) => {
  if (value.length <= 160) {
    return value;
  }

  return `${value.slice(0, 157)}...`;
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

const formatJobDate = (value: string | null) => {
  if (!value) return "No definida";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};
