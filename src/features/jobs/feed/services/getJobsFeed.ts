import { createClient } from "@/lib/supabase/server";

export type JobFeedItem = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  region: string | null;
  comuna: string | null;
  durationValue: number | null;
  durationUnit: "days" | "weeks" | "months" | "years" | null;
  extensionPossible: boolean;
  status: "open" | "closed";
  createdAt: string | null;
  companyName: string;
  visibleApplicationsCount: number;
};

export type JobsFeedFilters = {
  region?: string;
  comuna?: string;
  durationUnit?: "days" | "weeks" | "months" | "years";
  extensionPossible?: boolean;
};

export const getJobsFeed = async (filters: JobsFeedFilters = {}): Promise<JobFeedItem[]> => {
  const supabase = await createClient();

  let query = supabase
    .from("jobs")
    .select(
      "id, title, description, location, region, comuna, duration_value, duration_unit, extension_possible, status, created_at, companies(name)"
    )
    .order("created_at", { ascending: false });

  if (filters.region) {
    query = query.ilike("region", `%${filters.region}%`);
  }

  if (filters.comuna) {
    query = query.ilike("comuna", `%${filters.comuna}%`);
  }

  if (filters.durationUnit) {
    query = query.eq("duration_unit", filters.durationUnit);
  }

  if (typeof filters.extensionPossible === "boolean") {
    query = query.eq("extension_possible", filters.extensionPossible);
  }

  const { data: jobs } = await query.limit(40);

  if (!jobs?.length) {
    return [];
  }

  const jobIds = jobs.map((job) => job.id);
  const applicationCountByJob = new Map<string, number>();
  const { data: countsRows, error: countsError } = await supabase.rpc("get_job_application_counts", {
    job_ids: jobIds,
  });

  if (!countsError && countsRows?.length) {
    (
      countsRows as {
        job_id: string;
        total_applications: number | string | null;
      }[]
    ).forEach((row) => {
      const total = Number(row.total_applications ?? 0);
      applicationCountByJob.set(row.job_id, Number.isNaN(total) ? 0 : total);
    });
  } else {
    const { data: applications } = await supabase.from("applications").select("job_id").in("job_id", jobIds);
    (applications ?? []).forEach((application) => {
      const currentCount = applicationCountByJob.get(application.job_id) ?? 0;
      applicationCountByJob.set(application.job_id, currentCount + 1);
    });
  }

  return jobs.map((job) => {
    const companyName =
      extractCompanyName(job.companies) ?? "Empresa no disponible";

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
      status: job.status,
      createdAt: job.created_at,
      companyName,
      visibleApplicationsCount: applicationCountByJob.get(job.id) ?? 0,
    };
  });
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
