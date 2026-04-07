import CandidateDetailPage from "@/features/company/candidates/page/page";

type PageProps = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ jobId?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { userId } = await params;
  const { jobId } = await searchParams;
  return <CandidateDetailPage userId={userId} jobId={jobId} />;
}
