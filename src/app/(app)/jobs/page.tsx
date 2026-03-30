import JobsFeedPage from "@/features/jobs/feed/page/page";

type PageProps = {
  searchParams: Promise<{
    region?: string;
    comuna?: string;
    durationUnit?: string;
    extension?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const filters = await searchParams;
  return <JobsFeedPage filters={filters} />;
}
