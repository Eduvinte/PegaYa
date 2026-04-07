import { createClient } from "@/lib/supabase/server";

export type JobDetail = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  region: string | null;
  comuna: string | null;
  durationValue: number | null;
  durationUnit: "days" | "weeks" | "months" | "years" | null;
  extensionPossible: boolean;
  salary: number | null;
  status: "open" | "closed";
  createdAt: string | null;
  companyId: string | null;
  companyName: string;
  visibleApplicationsCount: number;
  hasApplied: boolean;
};

export const getJobDetail = async (jobId: string, userId?: string): Promise<JobDetail | null> => {
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select(
      "id, title, description, location, region, comuna, duration_value, duration_unit, extension_possible, salary, status, created_at, company_id, companies(name)"
    )
    .eq("id", jobId)
    .maybeSingle();

  if (!job) {
    return null;
  }

  const [{ data: countRows, error: countError }, { data: application }] = await Promise.all([
    supabase.rpc("get_job_application_counts", { job_ids: [jobId] }),
    userId
      ? supabase
          .from("applications")
          .select("id")
          .eq("job_id", jobId)
          .eq("user_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  let visibleApplicationsCount = 0;
  if (!countError && countRows?.length) {
    const value = Number(
      (countRows as { job_id: string; total_applications: number | string | null }[])[0]
        ?.total_applications ?? 0
    );
    visibleApplicationsCount = Number.isNaN(value) ? 0 : value;
  } else {
    const { count } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("job_id", jobId);
    visibleApplicationsCount = count ?? 0;
  }

  return {
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
    status: job.status,
    createdAt: job.created_at,
    companyId: job.company_id,
    companyName: extractCompanyName(job.companies) ?? "Empresa no disponible",
    visibleApplicationsCount,
    hasApplied: Boolean(application?.id),
  };
};

const extractCompanyName = (companies: unknown) => {
  if (!companies) {
    return null;
  }

  if (Array.isArray(companies)) {
    const firstCompany = companies[0] as { name?: string } | undefined;
    return firstCompany?.name ?? null;
  }

  return (companies as { name?: string }).name ?? null;
};
