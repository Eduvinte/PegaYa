import Link from "next/link";
import { getCurrentAppUser } from "@/features/app-shell/services/getCurrentAppUser";
import { getCandidateProfileCompletion } from "@/features/profile/candidate/lib/profileCompletion";
import { createClient } from "@/lib/supabase/server";
import { JobCard } from "@/features/jobs/feed/components/JobCard";
import { getJobsFeed } from "@/features/jobs/feed/services/getJobsFeed";
import { Button, Card } from "@/shared/ui";

const quickFilters = ["Todas", "Santiago", "Remoto", "Temporal", "Indefinido"];

type JobsFeedPageProps = {
  filters?: {
    region?: string;
    comuna?: string;
    durationUnit?: string;
    extension?: string;
  };
};

export default async function JobsFeedPage({ filters }: JobsFeedPageProps) {
  const region = filters?.region?.trim() ?? "";
  const comuna = filters?.comuna?.trim() ?? "";
  const durationUnit =
    filters?.durationUnit === "days" ||
    filters?.durationUnit === "weeks" ||
    filters?.durationUnit === "months" ||
    filters?.durationUnit === "years"
      ? filters.durationUnit
      : undefined;
  const extensionPossible =
    filters?.extension === "yes" ? true : filters?.extension === "no" ? false : undefined;

  const [jobs, currentUser] = await Promise.all([
    getJobsFeed({ region, comuna, durationUnit, extensionPossible }),
    getCurrentAppUser(),
  ]);
  const supabase = await createClient();
  const { data: profile } =
    currentUser?.role === "candidate"
      ? await supabase
          .from("profiles")
          .select(
            "full_name, bio, phone, city, region, nationality, headline, education_level, years_experience, skills, linkedin_url, cv_url"
          )
          .eq("id", currentUser.id)
          .maybeSingle()
      : { data: null };
  const completion = currentUser?.role === "candidate" ? getCandidateProfileCompletion(profile) : 0;

  return (
    <section className="space-y-5">
      <header className="liquid-glass-strong rounded-3xl p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-soft">Panel privado</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Feed de vacantes</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted sm:text-base">
          Revisa vacantes activas, compara estado y entra al detalle para postular o gestionar el proceso.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <span
              key={filter}
              className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-xs text-muted"
            >
              {filter}
            </span>
          ))}
        </div>
      </header>

      <Card variant="glass" padding="md" title="Filtros del feed">
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" method="get">
          <div className="space-y-1.5">
            <label htmlFor="region" className="text-xs uppercase tracking-[0.12em] text-muted">
              Region
            </label>
            <input
              id="region"
              name="region"
              defaultValue={region}
              placeholder="Ej: Metropolitana"
              className="liquid-focus-ring liquid-glass w-full rounded-xl px-3 py-2 text-sm text-foreground outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="comuna" className="text-xs uppercase tracking-[0.12em] text-muted">
              Comuna
            </label>
            <input
              id="comuna"
              name="comuna"
              defaultValue={comuna}
              placeholder="Ej: Providencia"
              className="liquid-focus-ring liquid-glass w-full rounded-xl px-3 py-2 text-sm text-foreground outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="durationUnit" className="text-xs uppercase tracking-[0.12em] text-muted">
              Duracion
            </label>
            <select
              id="durationUnit"
              name="durationUnit"
              defaultValue={durationUnit ?? ""}
              className="liquid-focus-ring liquid-glass w-full rounded-xl px-3 py-2 text-sm text-foreground outline-none"
            >
              <option value="" className="bg-[#08212a]">
                Todas
              </option>
              <option value="days" className="bg-[#08212a]">
                Dias
              </option>
              <option value="weeks" className="bg-[#08212a]">
                Semanas
              </option>
              <option value="months" className="bg-[#08212a]">
                Meses
              </option>
              <option value="years" className="bg-[#08212a]">
                Anos
              </option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="extension" className="text-xs uppercase tracking-[0.12em] text-muted">
              Extension
            </label>
            <select
              id="extension"
              name="extension"
              defaultValue={filters?.extension ?? ""}
              className="liquid-focus-ring liquid-glass w-full rounded-xl px-3 py-2 text-sm text-foreground outline-none"
            >
              <option value="" className="bg-[#08212a]">
                Todas
              </option>
              <option value="yes" className="bg-[#08212a]">
                Con extension
              </option>
              <option value="no" className="bg-[#08212a]">
                Sin extension
              </option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" size="sm">
              Filtrar
            </Button>
            <Link href="/jobs">
              <Button type="button" size="sm" variant="glass">
                Limpiar
              </Button>
            </Link>
          </div>
        </form>
      </Card>

      {currentUser?.role === "company" && !currentUser.companyId ? (
        <Card
          variant="glass"
          title="Te falta crear tu empresa"
          description="Para publicar vacantes necesitas registrar tu empresa una vez."
          className="border-brand/30"
        >
          <Link href="/company/onboarding">
            <Button size="sm">Crear empresa</Button>
          </Link>
        </Card>
      ) : null}

      {currentUser?.role === "candidate" && completion < 100 ? (
        <Card
          variant="glass"
          title="Completa tu perfil"
          description={`Tu perfil está al ${completion}%. Completarlo mejora cómo te ven las empresas.`}
          className="border-warning/40"
        >
          <Link href="/profile">
            <Button size="sm">Completar perfil</Button>
          </Link>
        </Card>
      ) : null}

      {jobs.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <Card
          variant="glass"
          title="No encontramos vacantes con esos filtros"
          description="Prueba quitando region/comuna o cambiando duracion y extension."
        />
      )}
    </section>
  );
}
