import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/features/app-shell/services/getCurrentAppUser";
import { EditJobForm } from "@/features/company/jobs/edit/components/EditJobForm";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/shared/ui";

type CompanyEditJobPageProps = {
  jobId: string;
};

export default async function CompanyEditJobPage({ jobId }: CompanyEditJobPageProps) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser) redirect("/login");
  if (currentUser.role !== "company") redirect("/jobs");
  if (!currentUser.companyId) redirect("/company/onboarding");

  const supabase = await createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select(
      "id, title, description, location, region, comuna, duration_value, duration_unit, extension_possible, salary, status, companies!inner(owner_id)"
    )
    .eq("id", jobId)
    .eq("companies.owner_id", currentUser.id)
    .maybeSingle();

  if (!job) {
    return (
      <Card variant="glass" title="Vacante no disponible" description="No encontramos la vacante para editar." />
    );
  }

  return (
    <section className="space-y-5">
      <header className="liquid-glass-strong rounded-3xl p-5 sm:p-6">
        <Link href="/company/jobs" className="text-sm text-brand-soft hover:text-brand">
          ← Volver a mis vacantes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Editar vacante</h1>
      </header>

      <Card variant="glass" padding="lg" className="max-w-3xl">
        <EditJobForm
          job={{
            id: job.id,
            title: job.title,
            description: job.description,
            location: job.location,
            region: job.region,
            comuna: job.comuna,
            durationValue: job.duration_value,
            durationUnit:
              job.duration_unit === "days" ||
              job.duration_unit === "weeks" ||
              job.duration_unit === "months" ||
              job.duration_unit === "years"
                ? job.duration_unit
                : null,
            extensionPossible: Boolean(job.extension_possible),
            salary: job.salary,
            status: job.status === "closed" ? "closed" : "open",
          }}
        />
      </Card>
    </section>
  );
}
