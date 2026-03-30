import JobDetailPage from "@/features/jobs/detail/page/page";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { jobId } = await params;
  return <JobDetailPage jobId={jobId} />;
}
